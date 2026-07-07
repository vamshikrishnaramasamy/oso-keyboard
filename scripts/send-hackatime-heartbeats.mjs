#!/usr/bin/env node
import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { stdin as input, stdout as output } from "node:process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfgPath = path.join(process.env.HOME, ".wakatime.cfg");
const projectPath = path.join(root, ".wakatime-project");
const defaultEntity = path.join(root, "README.md");
const year = Number(process.env.HACKATIME_YEAR ?? new Date().getFullYear());
const tzName = process.env.TZ || "America/Los_Angeles";

function readConfig(filePath) {
  const config = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#;\[][^=]+?)\s*=\s*(.*?)\s*$/);
    if (match) config[match[1].trim()] = match[2].trim();
  }
  return config;
}

function monthNumber(text) {
  const key = text.toLowerCase().slice(0, 3);
  const months = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
  };
  if (!months[key]) throw new Error(`Unknown month: ${text}`);
  return months[key];
}

function parseClock(text) {
  const match = text.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) throw new Error(`Bad time: ${text}`);
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const suffix = match[3];
  if (suffix === "pm" && hour !== 12) hour += 12;
  if (suffix === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) throw new Error(`Bad time: ${text}`);
  return { hour, minute };
}

function localTimestamp(y, month, day, hour, minute) {
  return Math.floor(new Date(y, month - 1, day, hour, minute, 0, 0).getTime() / 1000);
}

function parsePeriod(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const natural = trimmed.match(/^([a-z]+)\s+(\d{1,2})\s*:\s*([^-]+?)\s*-\s*(.+)$/i);
  if (natural) {
    const month = monthNumber(natural[1]);
    const day = Number(natural[2]);
    const start = parseClock(natural[3]);
    const end = parseClock(natural[4]);
    let startTs = localTimestamp(year, month, day, start.hour, start.minute);
    let endTs = localTimestamp(year, month, day, end.hour, end.minute);
    if (endTs <= startTs) endTs += 24 * 60 * 60;
    return { startTs, endTs, label: trimmed };
  }

  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+([^-]+?)\s*-\s*(?:(\d{4})-(\d{1,2})-(\d{1,2})\s+)?(.+)$/);
  if (iso) {
    const startClock = parseClock(iso[4]);
    const endClock = parseClock(iso[8]);
    let startTs = localTimestamp(Number(iso[1]), Number(iso[2]), Number(iso[3]), startClock.hour, startClock.minute);
    const endYear = Number(iso[5] ?? iso[1]);
    const endMonth = Number(iso[6] ?? iso[2]);
    const endDay = Number(iso[7] ?? iso[3]);
    let endTs = localTimestamp(endYear, endMonth, endDay, endClock.hour, endClock.minute);
    if (endTs <= startTs) endTs += 24 * 60 * 60;
    return { startTs, endTs, label: trimmed };
  }

  throw new Error(`Bad period. Use e.g. "june 21:11:30pm-5am": ${line}`);
}

function makeHeartbeats(periods, project, entity, intervalMinutes) {
  const heartbeats = [];
  for (const period of periods) {
    for (let time = period.startTs; time <= period.endTs; time += intervalMinutes * 60) {
      heartbeats.push({
        entity,
        type: "file",
        category: "coding",
        time,
        project,
        language: "Markdown",
        is_write: true
      });
    }
  }
  return heartbeats;
}

function postJson(url, auth, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    }, res => {
      let response = "";
      res.setEncoding("utf8");
      res.on("data", chunk => { response += chunk; });
      res.on("end", () => resolve({ statusCode: res.statusCode, response }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function readPeriodsFromPrompt() {
  const rl = readline.createInterface({ input, output });
  console.log("Enter work periods, one per line. Blank line sends.");
  console.log("Examples: june 21:11:30pm-5am  OR  2026-06-21 23:30-2026-06-22 05:00");
  const lines = [];
  while (true) {
    const line = await rl.question("> ");
    if (!line.trim()) break;
    lines.push(line);
  }
  rl.close();
  return lines;
}

async function main() {
  process.env.TZ = tzName;
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const intervalArg = args.find(arg => arg.startsWith("--interval-minutes="));
  const intervalMinutes = intervalArg ? Number(intervalArg.split("=")[1]) : 5;
  const periodArgs = args.filter(arg => !arg.startsWith("--"));
  const lines = periodArgs.length ? periodArgs : await readPeriodsFromPrompt();
  const periods = lines.map(parsePeriod).filter(Boolean);
  if (!periods.length) throw new Error("No periods provided.");
  if (!Number.isFinite(intervalMinutes) || intervalMinutes <= 0) throw new Error("Bad interval minutes.");

  const config = readConfig(cfgPath);
  const apiKey = config.api_key;
  const apiUrl = config.api_url;
  if (!apiKey || !apiUrl) throw new Error(`Missing api_key or api_url in ${cfgPath}`);

  const project = fs.readFileSync(projectPath, "utf8").trim();
  const entity = process.env.HACKATIME_ENTITY ?? defaultEntity;
  const heartbeats = makeHeartbeats(periods, project, entity, intervalMinutes);
  const auth = Buffer.from(apiKey).toString("base64");
  const endpoint = `${apiUrl.replace(/\/$/, "")}/users/current/heartbeats.bulk`;

  console.log(`Project: ${project}`);
  console.log(`Entity: ${entity}`);
  console.log(`Timezone: ${process.env.TZ}`);
  console.log(`Periods: ${periods.length}`);
  console.log(`Heartbeats: ${heartbeats.length}`);

  if (dryRun) {
    console.log("Dry run only. Nothing sent.");
    return;
  }

  for (let i = 0; i < heartbeats.length; i += 100) {
    const chunk = heartbeats.slice(i, i + 100);
    const { statusCode, response } = await postJson(endpoint, auth, JSON.stringify(chunk));
    console.log(`chunk=${Math.floor(i / 100) + 1} heartbeats=${chunk.length} HTTP=${statusCode}`);
    if (statusCode < 200 || statusCode >= 300) {
      throw new Error(`Hackatime error ${statusCode}: ${response.replace(/[A-Za-z0-9_=-]{20,}/g, "[redacted]")}`);
    }
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
