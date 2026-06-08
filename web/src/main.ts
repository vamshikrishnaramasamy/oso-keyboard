import "./styles.css";
import appHtml from "./app.html?raw";
import layout from "../../hardware/layout/oso75.layout.json";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

document.querySelector<HTMLDivElement>("#root")!.innerHTML = appHtml;

type ViewMode = "solid" | "wire" | "xray";

const modelUrl = `${import.meta.env.BASE_URL}models/oso75_case_plate.stl`;
const unitMm = layout.unit_mm;
const switchCutoutMm = layout.switch_cutout_mm;
const plateTopZ = 14.5 + 1.6;
const viewer = document.querySelector<HTMLDivElement>("#viewer");
const statusText = document.querySelector<HTMLElement>("#status-text");
const statVertices = document.querySelector<HTMLElement>("#stat-vertices");
const statFaces = document.querySelector<HTMLElement>("#stat-faces");
const statBounds = document.querySelector<HTMLElement>("#stat-bounds");
const statFile = document.querySelector<HTMLElement>("#stat-file");
const materialSelect = document.querySelector<HTMLSelectElement>("#material");
const modeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-mode]"));
const viewButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-view]"));
const fitButton = document.querySelector<HTMLButtonElement>("#fit");
const resetButton = document.querySelector<HTMLButtonElement>("#reset");
const downloadButton = document.querySelector<HTMLAnchorElement>("#download-stl");

if (!viewer) {
  throw new Error("Viewer root is missing");
}

const scene = new THREE.Scene();
scene.background = new THREE.Color("#f1f1ee");

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 4000);
camera.position.set(280, -260, 190);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewer.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const ssaoPass = new SSAOPass(scene, camera, 1, 1);
ssaoPass.kernelRadius = 18;
ssaoPass.minDistance = 0.004;
ssaoPass.maxDistance = 0.18;
composer.addPass(ssaoPass);
composer.addPass(new OutputPass());

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(170, 64, 8);

const modelGroup = new THREE.Group();
scene.add(modelGroup);

const keyLight = new THREE.DirectionalLight("#ffffff", 4.7);
keyLight.position.set(90, -150, 330);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 10;
keyLight.shadow.camera.far = 780;
keyLight.shadow.camera.left = -260;
keyLight.shadow.camera.right = 260;
keyLight.shadow.camera.top = 220;
keyLight.shadow.camera.bottom = -220;
keyLight.shadow.bias = -0.00025;
keyLight.shadow.normalBias = 0.035;
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight("#ffffff", 1.1);
fillLight.position.set(-260, 210, 150);
scene.add(fillLight);
const rimLight = new THREE.DirectionalLight("#dfe6ff", 1.4);
rimLight.position.set(-160, -120, 120);
scene.add(rimLight);
scene.add(new THREE.HemisphereLight("#ffffff", "#bdbdb4", 1.35));

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(900, 620),
  new THREE.ShadowMaterial({ color: "#1b1c18", opacity: 0.18 })
);
ground.position.set(180, 72, -1.4);
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(460, 32, "#d3d3cc", "#e9e9e4");
grid.rotation.x = Math.PI / 2;
grid.position.z = -1.25;
scene.add(grid);

const axes = new THREE.AxesHelper(38);
axes.position.set(10, 10, 4);
scene.add(axes);

const materialLibrary = {
  graphite: new THREE.MeshPhysicalMaterial({
    color: "#a3a29a",
    roughness: 0.58,
    metalness: 0.08,
    clearcoat: 0.18,
    clearcoatRoughness: 0.55
  }),
  aluminum: new THREE.MeshPhysicalMaterial({
    color: "#b8bab4",
    roughness: 0.38,
    metalness: 0.48,
    clearcoat: 0.22,
    clearcoatRoughness: 0.35
  }),
  resin: new THREE.MeshPhysicalMaterial({
    color: "#5b5c57",
    roughness: 0.64,
    metalness: 0.02,
    clearcoat: 0.28,
    clearcoatRoughness: 0.68
  })
};

let mesh: THREE.Mesh | null = null;
let edgeLines: THREE.LineSegments | null = null;
let cutoutOverlay: THREE.Group | null = null;
let currentMode: ViewMode = "solid";
let currentMaterial = materialLibrary.graphite;

function setStatus(text: string) {
  if (statusText) statusText.textContent = text;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function resize() {
  const rect = viewer.getBoundingClientRect();
  camera.aspect = rect.width / Math.max(rect.height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height, false);
  composer.setSize(rect.width, rect.height);
  ssaoPass.setSize(rect.width, rect.height);
}

function fitModel() {
  if (!mesh) return;

  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  controls.target.copy(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360));
  camera.position.set(center.x + distance * 0.18, center.y - distance * 0.5, center.z + distance * 0.82);
  camera.near = Math.max(distance / 100, 0.1);
  camera.far = distance * 8;
  camera.updateProjectionMatrix();
  controls.update();
}

function setView(view: string) {
  if (!mesh) return;
  const center = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
  const distance = camera.position.distanceTo(center) || 420;
  const positions: Record<string, THREE.Vector3> = {
    top: new THREE.Vector3(center.x, center.y, center.z + distance),
    front: new THREE.Vector3(center.x, center.y - distance, center.z + 30),
    right: new THREE.Vector3(center.x + distance, center.y, center.z + 30),
    iso: new THREE.Vector3(center.x + distance * 0.18, center.y - distance * 0.5, center.z + distance * 0.82)
  };
  camera.position.copy(positions[view] ?? positions.iso);
  controls.target.copy(center);
  controls.update();
}

function applyMode(mode: ViewMode) {
  currentMode = mode;
  if (!mesh) return;
  mesh.material = currentMaterial.clone();
  const material = mesh.material as THREE.MeshPhysicalMaterial;
  material.wireframe = mode === "wire";
  material.transparent = mode === "xray";
  material.opacity = mode === "xray" ? 0.34 : 1;
  modeButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
}

function makeCutoutOverlay(z: number) {
  const group = new THREE.Group();
  const zTop = z + 0.1;
  const zBottom = z - 2.25;
  const lineMaterial = new THREE.LineBasicMaterial({
    color: "#11120f",
    transparent: true,
    opacity: 0.92,
    depthTest: true
  });
  const glintMaterial = new THREE.LineBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.28,
    depthTest: true
  });
  const wallDarkMaterial = new THREE.MeshStandardMaterial({
    color: "#181915",
    roughness: 0.72,
    metalness: 0.02,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: -1
  });
  const wallMidMaterial = new THREE.MeshStandardMaterial({
    color: "#55564e",
    roughness: 0.68,
    metalness: 0.03,
    transparent: true,
    opacity: 0.76,
    side: THREE.DoubleSide,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: -1
  });

  function wall(points: THREE.Vector3[], material: THREE.Material) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
    geometry.computeVertexNormals();
    return new THREE.Mesh(geometry, material);
  }

  for (const key of layout.keys) {
    const w = switchCutoutMm;
    const h = switchCutoutMm;
    const cx = (key.x + ((key.w ?? 1) / 2)) * unitMm + 13;
    const cy = (key.y + ((key.h ?? 1) / 2)) * unitMm + 13;
    const x0 = cx - w / 2;
    const x1 = cx + w / 2;
    const y0 = cy - h / 2;
    const y1 = cy + h / 2;

    const points = [
      new THREE.Vector3(x0, y0, zTop),
      new THREE.Vector3(x1, y0, zTop),
      new THREE.Vector3(x1, y1, zTop),
      new THREE.Vector3(x0, y1, zTop),
      new THREE.Vector3(x0, y0, zTop)
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial));

    group.add(wall([
      new THREE.Vector3(x0, y0, zTop),
      new THREE.Vector3(x1, y0, zTop),
      new THREE.Vector3(x1, y0, zBottom),
      new THREE.Vector3(x0, y0, zBottom)
    ], wallDarkMaterial));
    group.add(wall([
      new THREE.Vector3(x0, y0, zTop),
      new THREE.Vector3(x0, y0, zBottom),
      new THREE.Vector3(x0, y1, zBottom),
      new THREE.Vector3(x0, y1, zTop)
    ], wallDarkMaterial));
    group.add(wall([
      new THREE.Vector3(x0, y1, zTop),
      new THREE.Vector3(x0, y1, zBottom),
      new THREE.Vector3(x1, y1, zBottom),
      new THREE.Vector3(x1, y1, zTop)
    ], wallMidMaterial));
    group.add(wall([
      new THREE.Vector3(x1, y0, zTop),
      new THREE.Vector3(x1, y1, zTop),
      new THREE.Vector3(x1, y1, zBottom),
      new THREE.Vector3(x1, y0, zBottom)
    ], wallMidMaterial));

    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x0 + 0.5, y1 - 0.5, zTop + 0.05),
      new THREE.Vector3(x1 - 0.5, y1 - 0.5, zTop + 0.05)
    ]), glintMaterial));
  }

  group.renderOrder = 10;
  return group;
}

function addModelOutlines(geometry: THREE.BufferGeometry) {
  if (!mesh) return;
  if (edgeLines) modelGroup.remove(edgeLines);
  const edgeGeometry = new THREE.EdgesGeometry(geometry, 24);
  edgeLines = new THREE.LineSegments(
    edgeGeometry,
    new THREE.LineBasicMaterial({
      color: "#242520",
      transparent: true,
      opacity: 0.32
    })
  );
  edgeLines.renderOrder = 8;
  modelGroup.add(edgeLines);
}

function loadModel() {
  setStatus("Loading model");
  const loader = new STLLoader();
  loader.load(
    modelUrl,
    geometry => {
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();

      mesh = new THREE.Mesh(geometry, currentMaterial.clone());
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      modelGroup.add(mesh);
      addModelOutlines(geometry);

      const box = geometry.boundingBox;
      const size = new THREE.Vector3();
      box?.getSize(size);
      if (box) {
        if (cutoutOverlay) scene.remove(cutoutOverlay);
        cutoutOverlay = makeCutoutOverlay(plateTopZ + 0.35);
        scene.add(cutoutOverlay);
      }

      if (statVertices) statVertices.textContent = formatNumber(geometry.attributes.position.count);
      if (statFaces) statFaces.textContent = formatNumber(Math.floor(geometry.attributes.position.count / 3));
      if (statBounds) statBounds.textContent = `${size.x.toFixed(1)} x ${size.y.toFixed(1)} x ${size.z.toFixed(1)} mm`;
      if (statFile) statFile.textContent = "oso75_case_plate.stl";
      setStatus("Ready");
      applyMode(currentMode);
      fitModel();
    },
    event => {
      if (event.total > 0) {
        const pct = Math.round((event.loaded / event.total) * 100);
        setStatus(`Loading ${pct}%`);
      }
    },
    () => setStatus("Model failed to load")
  );
}

function animate() {
  controls.update();
  composer.render();
  requestAnimationFrame(animate);
}

materialSelect?.addEventListener("change", () => {
  currentMaterial = materialLibrary[materialSelect.value as keyof typeof materialLibrary] ?? materialLibrary.graphite;
  applyMode(currentMode);
});

modeButtons.forEach(button => {
  button.addEventListener("click", () => applyMode((button.dataset.mode as ViewMode) ?? "solid"));
});

viewButtons.forEach(button => {
  button.addEventListener("click", () => setView(button.dataset.view ?? "iso"));
});

fitButton?.addEventListener("click", fitModel);
resetButton?.addEventListener("click", () => setView("iso"));
if (downloadButton) downloadButton.href = modelUrl;

window.addEventListener("resize", resize);
resize();
loadModel();
animate();
