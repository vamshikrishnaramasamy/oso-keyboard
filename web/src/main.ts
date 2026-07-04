import "./styles.css";
import appHtml from "./app.html?raw";
import layout from "../../hardware/layout/oso75.layout.json";
import pcbExtract from "../../hardware/cad/build123d/pcb_extract.json";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

document.querySelector<HTMLDivElement>("#root")!.innerHTML = appHtml;

type ViewMode = "solid" | "wire" | "xray";
type LayerView = "case" | "pcb" | "both";

const unitMm = layout.unit_mm;
const switchCutoutMm = layout.switch_cutout_mm;
const boardWidthMm = Number((pcbExtract.board.w - 0.1).toFixed(3));
const boardHeightMm = Number((pcbExtract.board.h - 0.1).toFixed(3));
const pcbClearanceMm = 0.3;
const caseWallMm = 6.0;
const outerX0 = -pcbClearanceMm - caseWallMm;
const outerY0 = -pcbClearanceMm - caseWallMm;
const outerX1 = boardWidthMm + pcbClearanceMm + caseWallMm;
const outerY1 = boardHeightMm + pcbClearanceMm + caseWallMm;
const displayWidthMm = outerX1 - outerX0;
const displayHeightMm = outerY1 - outerY0;
const cadShiftX = -outerX0;
const cadShiftY = -outerY0;
const pcbZMm = 6.0;
const pcbThicknessMm = 1.6;
const plateZMm = 11.1;
const plateTopZ = 12.6;
const caseHeightMm = 15.0;

type ModelPart = {
  file: string;
  offset: { x: number; y: number; z: number };
  tint?: string;
};

type ModelDef = {
  label: string;
  source: string;
  parts: ModelPart[];
};

// Production Build123d exports use raw PCB coordinates. Keep dimensions raw,
// then only translate the negative case wall into positive viewer space.
const cadOffset = { x: cadShiftX, y: cadShiftY, z: 0 };
const plateOffset = { x: cadShiftX, y: cadShiftY, z: plateZMm };
const models: Record<string, ModelDef> = {
  scad: {
    label: "Concept case (OpenSCAD)",
    source: "hardware/cad/generated/oso75_case_plate.scad",
    parts: [{ file: "oso75_case_plate.stl", offset: { x: 0, y: 0, z: 0 } }]
  },
  prod: {
    label: "Production case (build123d)",
    source: "hardware/cad/build123d/oso75_case.py",
    parts: [
      { file: "oso75_case_bottom.stl", offset: cadOffset },
      { file: "oso75_case_bezel.stl", offset: cadOffset },
      { file: "oso75_plate.stl", offset: plateOffset, tint: "#c8c6bb" },
      { file: "oso75_bay_cover.stl", offset: plateOffset, tint: "#4a4a4a" }
    ]
  },
  module: {
    label: "Production case + carrier module",
    source: "hardware/kicad/oso-module-carrier/oso_module_carrier.kicad_pcb",
    parts: [
      { file: "oso75_case_bottom.stl", offset: cadOffset },
      { file: "oso75_case_bezel.stl", offset: cadOffset },
      { file: "oso75_plate.stl", offset: plateOffset, tint: "#c8c6bb" },
      { file: "oso75_module_carrier.stl", offset: plateOffset, tint: "#1e6b45" }
    ]
  }
};

let currentModelKey: keyof typeof models = "prod";

function modelFileUrl(file: string) {
  return `${import.meta.env.BASE_URL}models/${file}?v=${Date.now()}`;
}

function publicModelUrl(file: string) {
  return `${import.meta.env.BASE_URL}models/${file}`;
}

function toKeyboardView(point: THREE.Vector3) {
  return new THREE.Vector3(displayWidthMm - point.x, displayHeightMm - point.y, point.z);
}

type SwitchPlacement = {
  ref: string;
  label: string;
  x: number;
  y: number;
};

type ModuleBayPlacement = {
  x_mm: number;
  y_mm: number;
  w_mm: number;
  h_mm: number;
};

function pcbY(canvasY: number) {
  return boardHeightMm - canvasY;
}

function pcbSceneX(x: number) {
  return cadShiftX + x;
}

function pcbSceneY(canvasY: number) {
  return cadShiftY + pcbY(canvasY);
}

function addPlaneRect(
  group: THREE.Group,
  width: number,
  height: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  rotationDeg = 0
) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.position.set(x, y, z);
  mesh.rotation.z = THREE.MathUtils.degToRad(-rotationDeg);
  group.add(mesh);
  return mesh;
}

function addPcbCircle(
  group: THREE.Group,
  diameter: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  segments = 24
) {
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(diameter / 2, segments), material);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function makeTextSprite(text: string, color = "#f4f0d0", scale = 4) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const width = 160;
  const height = 48;
  canvas.width = width;
  canvas.height = height;
  if (context) {
    context.clearRect(0, 0, width, height);
    context.font = "700 18px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineWidth = 4;
    context.strokeStyle = "rgba(8, 20, 12, 0.75)";
    context.strokeText(text, width / 2, height / 2);
    context.fillStyle = color;
    context.fillText(text, width / 2, height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(scale * 3.2, scale, 1);
  return sprite;
}

function makeSwitchPlacements(): SwitchPlacement[] {
  return pcbExtract.switches
    .filter(sw => sw.fpid.includes("Kailh_MX"))
    .map(sw => ({
      ref: sw.ref,
      label: sw.ref,
      x: sw.x,
      y: pcbY(sw.y)
    }));
}

function makeModuleBayPlacement(): ModuleBayPlacement | undefined {
  if (!layout.module_bay) return undefined;
  const bayConnector = pcbExtract.footprints.J3;
  const centerX = bayConnector.x;
  const centerY = pcbY(bayConnector.y);
  return {
    ...layout.module_bay,
    x_mm: centerX - layout.module_bay.w_mm / 2,
    y_mm: centerY - layout.module_bay.h_mm / 2
  };
}

const switchPlacements = makeSwitchPlacements();
const moduleBay = makeModuleBayPlacement();
const moduleFocusCenter = moduleBay
  ? toKeyboardView(new THREE.Vector3(cadShiftX + moduleBay.x_mm + moduleBay.w_mm / 2, cadShiftY + moduleBay.y_mm + moduleBay.h_mm / 2, plateTopZ))
  : undefined;
const viewer = document.querySelector<HTMLDivElement>("#viewer");
const statusText = document.querySelector<HTMLElement>("#status-text");
const statVertices = document.querySelector<HTMLElement>("#stat-vertices");
const statFaces = document.querySelector<HTMLElement>("#stat-faces");
const statBounds = document.querySelector<HTMLElement>("#stat-bounds");
const statFile = document.querySelector<HTMLElement>("#stat-file");
const materialSelect = document.querySelector<HTMLSelectElement>("#material");
const modeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-mode]"));
const layerButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-layer-view]"));
const viewButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-view]"));
const fitButton = document.querySelector<HTMLButtonElement>("#fit");
const resetButton = document.querySelector<HTMLButtonElement>("#reset");
const downloadButton = document.querySelector<HTMLAnchorElement>("#download-stl");

if (!viewer) {
  throw new Error("Viewer root is missing");
}

const scene = new THREE.Scene();
scene.background = new THREE.Color("#f1f1ee");
const textureLoader = new THREE.TextureLoader();

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

const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 3.8;
controls.zoomSpeed = 2.1;
controls.panSpeed = 0.75;
controls.dynamicDampingFactor = 0.12;
controls.staticMoving = true;
controls.minDistance = 24;
controls.maxDistance = 1400;
controls.target.set(170, 64, 8);

let renderQueued = false;
function requestRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    controls.update();
    composer.render();
  });
}

const pointerMoveDeadzonePx = 3;
let lastPointerX: number | null = null;
let lastPointerY: number | null = null;

function requestPointerRender(event: PointerEvent) {
  if (event.type !== "pointermove" || lastPointerX === null || lastPointerY === null) {
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    requestRender();
    return;
  }

  const dx = event.clientX - lastPointerX;
  const dy = event.clientY - lastPointerY;
  if (Math.hypot(dx, dy) < pointerMoveDeadzonePx) return;

  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  requestRender();
}

const modelGroup = new THREE.Group();
modelGroup.scale.x = -1;
modelGroup.scale.y = -1;
modelGroup.position.x = displayWidthMm;
modelGroup.position.y = displayHeightMm;
scene.add(modelGroup);

function orientForKeyboardView(group: THREE.Group) {
  group.scale.x = -1;
  group.scale.y = -1;
  group.position.x = displayWidthMm;
  group.position.y = displayHeightMm;
  return group;
}

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

let meshes: THREE.Mesh[] = [];
let edgeLineSegments: THREE.LineSegments[] = [];
let cutoutOverlay: THREE.Group | null = null;
let caseFitGroup: THREE.Group | null = null;
let pcbFitGroup: THREE.Group | null = null;
let currentMode: ViewMode = "solid";
let currentLayerView: LayerView = "case";
let currentMaterial = materialLibrary.graphite;
let currentModelBoundsLabel = "-";

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
  controls.handleResize();
  requestRender();
}

function fitModel() {
  viewButtons.forEach(button => button.classList.remove("active"));
  camera.up.set(0, 1, 0);
  const box = getActiveLayerBox();
  if (box.isEmpty()) return;
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
  requestRender();
}

function setView(view: string) {
  const activeView = view in { top: true, front: true, back: true, right: true, module: true, iso: true } ? view : "iso";
  const box = getActiveLayerBox();
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const target = activeView === "module" && moduleFocusCenter ? moduleFocusCenter : center;
  const distance = camera.position.distanceTo(center) || 420;
  const sideZ = center.z + 4;
  camera.up.set(0, 1, 0);
  const positions: Record<string, THREE.Vector3> = {
    top: new THREE.Vector3(center.x, center.y, center.z + distance),
    front: new THREE.Vector3(center.x, center.y - distance, sideZ),
    back: new THREE.Vector3(center.x, center.y + distance, sideZ),
    right: new THREE.Vector3(center.x + distance, center.y, sideZ),
    module: moduleFocusCenter
      ? new THREE.Vector3(moduleFocusCenter.x, moduleFocusCenter.y + 82, moduleFocusCenter.z + 2)
      : new THREE.Vector3(center.x, center.y + distance, sideZ),
    iso: new THREE.Vector3(center.x + distance * 0.18, center.y - distance * 0.5, center.z + distance * 0.82)
  };
  camera.position.copy(positions[activeView]);
  controls.target.copy(target);
  controls.update();
  requestRender();
  viewButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.view === activeView);
  });
}

function applyMode(mode: ViewMode) {
  currentMode = mode;
  for (const mesh of meshes) {
    mesh.material = currentMaterial.clone();
    const material = mesh.material as THREE.MeshPhysicalMaterial;
    if (mesh.userData.tint) material.color = new THREE.Color(mesh.userData.tint as string);
    material.wireframe = mode === "wire";
    material.transparent = mode === "xray";
    material.opacity = mode === "xray" ? 0.34 : 1;
  }
  const fitOpacity = mode === "xray" ? 0.24 : 0.52;
  caseFitGroup?.traverse(object => {
    if (object instanceof THREE.Mesh && object.material instanceof THREE.Material) {
      const material = object.material as THREE.MeshStandardMaterial;
      material.wireframe = mode === "wire";
      material.opacity = object.name === "case-cavity" ? 0.1 : fitOpacity;
      material.transparent = true;
    }
  });
  pcbFitGroup?.traverse(object => {
    if (object instanceof THREE.Mesh && object.material instanceof THREE.Material) {
      const material = object.material as THREE.MeshStandardMaterial;
      material.wireframe = mode === "wire";
      material.opacity = mode === "xray" ? 0.42 : 0.92;
      material.transparent = true;
    }
  });
  modeButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  syncLayerVisibility();
  requestRender();
}

function getActiveLayerBox() {
  const box = new THREE.Box3();
  if (currentLayerView === "case" || currentLayerView === "both") {
    for (const mesh of meshes) box.union(new THREE.Box3().setFromObject(mesh));
  }
  if ((currentLayerView === "pcb" || currentLayerView === "both") && pcbFitGroup) {
    box.union(new THREE.Box3().setFromObject(pcbFitGroup));
  }
  if (box.isEmpty()) {
    for (const mesh of meshes) box.union(new THREE.Box3().setFromObject(mesh));
  }
  return box;
}

function syncLayerVisibility() {
  const showCase = currentLayerView === "case" || currentLayerView === "both";
  const showPcb = currentLayerView === "pcb" || currentLayerView === "both";
  for (const mesh of meshes) {
    mesh.visible = showCase;
    const material = mesh.material as THREE.MeshPhysicalMaterial;
    if (currentLayerView === "both" && currentMode === "solid") {
      material.transparent = true;
      material.opacity = 0.28;
      material.depthWrite = false;
    } else if (currentMode === "xray") {
      material.transparent = true;
      material.opacity = 0.34;
      material.depthWrite = true;
    } else {
      material.transparent = false;
      material.opacity = 1;
      material.depthWrite = true;
    }
  }
  for (const lines of edgeLineSegments) lines.visible = showCase;
  if (cutoutOverlay) cutoutOverlay.visible = false;
  if (caseFitGroup) caseFitGroup.visible = false;
  if (pcbFitGroup) pcbFitGroup.visible = showPcb;
  requestRender();
}

function updateBoundsStatForLayer() {
  if (!statBounds) return;
  if (currentLayerView === "pcb") {
    statBounds.textContent = `${boardWidthMm.toFixed(1)} x ${boardHeightMm.toFixed(1)} x ${pcbThicknessMm.toFixed(1)} mm`;
  } else if (currentLayerView === "both") {
    statBounds.textContent = `${currentModelBoundsLabel} case; PCB ${boardWidthMm.toFixed(1)} x ${boardHeightMm.toFixed(1)} x ${pcbThicknessMm.toFixed(1)} mm`;
  } else {
    statBounds.textContent = currentModelBoundsLabel;
  }
}

function setLayerView(view: LayerView) {
  currentLayerView = view;
  syncLayerVisibility();
  updateBoundsStatForLayer();
  layerButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.layerView === view);
  });
  setStatus(view === "both" ? "Fit view: case + PCB" : `Fit view: ${view}`);
  fitModel();
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

  for (const key of switchPlacements) {
    const w = switchCutoutMm;
    const h = switchCutoutMm;
    const overlayCx = cadShiftX + key.x;
    const overlayCy = cadShiftY + key.y;
    const x0 = overlayCx - w / 2;
    const x1 = overlayCx + w / 2;
    const y0 = overlayCy - h / 2;
    const y1 = overlayCy + h / 2;

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

function roundedRectShape(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function makeExtrudedRoundedRect(width: number, height: number, depth: number, radius: number) {
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(width, height, radius), {
    depth,
    bevelEnabled: false
  });
  geometry.rotateX(0);
  return geometry;
}

function makeCaseFitGroup() {
  const group = new THREE.Group();
  const outerW = displayWidthMm;
  const outerH = displayHeightMm;
  const cavityW = boardWidthMm + pcbClearanceMm * 2;
  const cavityH = boardHeightMm + pcbClearanceMm * 2;
  const centerX = outerW / 2;
  const centerY = outerH / 2;

  const shell = new THREE.Mesh(
    makeExtrudedRoundedRect(outerW, outerH, caseHeightMm, 8),
    new THREE.MeshStandardMaterial({
      color: "#b9b7aa",
      roughness: 0.62,
      metalness: 0.04,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  shell.position.set(centerX, centerY, 0);
  shell.castShadow = true;
  shell.receiveShadow = true;
  group.add(shell);

  const cavity = new THREE.Mesh(
    makeExtrudedRoundedRect(cavityW, cavityH, caseHeightMm - 3, 5),
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.5,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  cavity.name = "case-cavity";
  cavity.position.set(cadShiftX + boardWidthMm / 2, cadShiftY + boardHeightMm / 2, 3);
  group.add(cavity);

  const cavityOutline = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(
      roundedRectShape(cavityW, cavityH, 5).getPoints(36).map(point => (
        new THREE.Vector3(point.x + cadShiftX + boardWidthMm / 2, point.y + cadShiftY + boardHeightMm / 2, pcbZMm)
      ))
    ),
    new THREE.LineBasicMaterial({ color: "#11120f", transparent: true, opacity: 0.75 })
  );
  group.add(cavityOutline);

  const topPlate = new THREE.Mesh(
    makeExtrudedRoundedRect(boardWidthMm, boardHeightMm, 1.6, 5),
    new THREE.MeshStandardMaterial({
      color: "#d6d2bf",
      roughness: 0.58,
      transparent: true,
      opacity: 0.62,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  topPlate.position.set(cadShiftX + boardWidthMm / 2, cadShiftY + boardHeightMm / 2, plateTopZ - 1.6);
  group.add(topPlate);

  const usb = new THREE.Mesh(
    new THREE.BoxGeometry(10.2, 1.2, 3.8),
    new THREE.MeshStandardMaterial({ color: "#1d1e1a", roughness: 0.5 })
  );
  usb.position.set(cadShiftX + pcbExtract.footprints.J1.x, cadShiftY + boardHeightMm + caseWallMm * 0.5, caseHeightMm / 2);
  group.add(usb);

  group.name = "case-fit";
  return group;
}

function makePcbFitGroup() {
  const group = new THREE.Group();
  const topZ = pcbZMm + pcbThicknessMm + 0.22;
  const pcbMaterial = new THREE.MeshStandardMaterial({
    color: "#168b46",
    roughness: 0.46,
    metalness: 0.04,
    transparent: true,
    opacity: 0.98
  });
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(boardWidthMm, boardHeightMm, pcbThicknessMm),
    pcbMaterial
  );
  pcb.position.set(cadShiftX + boardWidthMm / 2, cadShiftY + boardHeightMm / 2, pcbZMm + pcbThicknessMm / 2);
  pcb.castShadow = true;
  pcb.receiveShadow = true;
  group.add(pcb);

  const outlineZ = pcbZMm + pcbThicknessMm + 0.18;
  const outlinePoints = [
    new THREE.Vector3(cadShiftX, cadShiftY, outlineZ),
    new THREE.Vector3(cadShiftX + boardWidthMm, cadShiftY, outlineZ),
    new THREE.Vector3(cadShiftX + boardWidthMm, cadShiftY + boardHeightMm, outlineZ),
    new THREE.Vector3(cadShiftX, cadShiftY + boardHeightMm, outlineZ),
    new THREE.Vector3(cadShiftX, cadShiftY, outlineZ)
  ];
  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(outlinePoints),
    new THREE.LineBasicMaterial({ color: "#0b3d23", transparent: true, opacity: 0.95 })
  ));

  const keepoutMaterial = new THREE.MeshBasicMaterial({
    color: "#0b2b18",
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  for (const obstacle of pcbExtract.bottom_obstacles) {
    const x0 = obstacle.x0;
    const x1 = obstacle.x1;
    const y0 = pcbY(obstacle.y1);
    const y1 = pcbY(obstacle.y0);
    addPlaneRect(
      group,
      Math.max(x1 - x0, 0.15),
      Math.max(y1 - y0, 0.15),
      cadShiftX + (x0 + x1) / 2,
      cadShiftY + (y0 + y1) / 2,
      topZ + 0.02,
      keepoutMaterial
    );
  }

  const holeMaterial = new THREE.MeshBasicMaterial({
    color: "#07140c",
    transparent: true,
    opacity: 0.92,
    depthWrite: false
  });
  const drillMaterial = new THREE.MeshBasicMaterial({
    color: "#e9ece4",
    transparent: true,
    opacity: 0.96,
    depthWrite: false
  });
  const copperMaterial = new THREE.MeshBasicMaterial({
    color: "#d5b356",
    transparent: true,
    opacity: 0.96,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const socketMaterial = new THREE.MeshBasicMaterial({
    color: "#06150c",
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  for (const key of switchPlacements) {
    const cx = cadShiftX + key.x;
    const cy = cadShiftY + key.y;
    addPlaneRect(group, 14, 14, cx, cy, topZ + 0.04, socketMaterial);
    addPlaneRect(group, 2.1, 4.6, cx - 6.5, cy - 6.6, topZ + 0.1, copperMaterial);
    addPlaneRect(group, 2.1, 4.6, cx + 6.5, cy - 6.6, topZ + 0.1, copperMaterial);
    addPcbCircle(group, 3.8, cx, cy, topZ + 0.12, holeMaterial);
  }

  for (const drill of pcbExtract.stabs) {
    addPcbCircle(group, Math.min(Math.max(drill.d, 1.1), 4.2), pcbSceneX(drill.x), pcbSceneY(drill.y), topZ + 0.16, drillMaterial, 18);
  }

  if (moduleBay) {
    const carrierTexture = textureLoader.load(publicModelUrl("oso_module_carrier_top.png"), () => requestRender());
    carrierTexture.colorSpace = THREE.SRGBColorSpace;
    carrierTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const bay = new THREE.Mesh(
      new THREE.PlaneGeometry(moduleBay.w_mm, moduleBay.h_mm),
      new THREE.MeshBasicMaterial({
        color: "#ffffff",
        map: carrierTexture,
        transparent: true,
        opacity: 0.94,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    bay.position.set(cadShiftX + moduleBay.x_mm + moduleBay.w_mm / 2, cadShiftY + moduleBay.y_mm + moduleBay.h_mm / 2, topZ + 0.24);
    group.add(bay);

    const bayOutline = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(cadShiftX + moduleBay.x_mm, cadShiftY + moduleBay.y_mm, topZ + 0.32),
        new THREE.Vector3(cadShiftX + moduleBay.x_mm + moduleBay.w_mm, cadShiftY + moduleBay.y_mm, topZ + 0.32),
        new THREE.Vector3(cadShiftX + moduleBay.x_mm + moduleBay.w_mm, cadShiftY + moduleBay.y_mm + moduleBay.h_mm, topZ + 0.32),
        new THREE.Vector3(cadShiftX + moduleBay.x_mm, cadShiftY + moduleBay.y_mm + moduleBay.h_mm, topZ + 0.32),
        new THREE.Vector3(cadShiftX + moduleBay.x_mm, cadShiftY + moduleBay.y_mm, topZ + 0.32)
      ]),
      new THREE.LineBasicMaterial({ color: "#f0c05a", transparent: true, opacity: 0.95 })
    );
    group.add(bayOutline);
  }

  const componentMaterial = new THREE.MeshBasicMaterial({
    color: "#ced1c8",
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const modulePadMaterial = new THREE.MeshBasicMaterial({
    color: "#f0c05a",
    transparent: true,
    opacity: 0.98,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const espMaterial = new THREE.MeshBasicMaterial({
    color: "#18422f",
    transparent: true,
    opacity: 0.94,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const labelZ = topZ + 0.75;
  const footprintSpecs: Record<string, { w: number; h: number; color?: THREE.Material; labelDy?: number }> = {
    J1: { w: 9.8, h: 5.6, color: componentMaterial, labelDy: -5.5 },
    U1: { w: 18.0, h: 25.5, color: espMaterial, labelDy: 15 },
    U3: { w: 3.3, h: 3.1, color: componentMaterial, labelDy: 4 },
    F1: { w: 3.2, h: 1.8, color: modulePadMaterial, labelDy: 3.2 },
    J3: { w: pcbExtract.footprints.J3.bbox.w, h: pcbExtract.footprints.J3.bbox.h, color: modulePadMaterial, labelDy: 17 },
    ST1: { w: 28, h: 6, color: componentMaterial, labelDy: 5 },
    ST2: { w: 28, h: 6, color: componentMaterial, labelDy: 5 },
    ST3: { w: 28, h: 6, color: componentMaterial, labelDy: 5 },
    ST4: { w: 110, h: 6, color: componentMaterial, labelDy: 6 }
  };

  for (const [ref, footprint] of Object.entries(pcbExtract.footprints)) {
    const spec = footprintSpecs[ref] ?? { w: 5, h: 5, color: componentMaterial, labelDy: 4 };
    const x = pcbSceneX(footprint.x);
    const y = pcbSceneY(footprint.y);
    addPlaneRect(group, spec.w, spec.h, x, y, topZ + 0.35, spec.color ?? componentMaterial, footprint.rot ?? 0);
    const label = makeTextSprite(ref, ref === "J3" ? "#ffe08a" : "#f4f0d0", ref === "U1" ? 5.0 : 3.6);
    label.position.set(x, y + (spec.labelDy ?? 4), labelZ);
    group.add(label);
  }

  const j3 = pcbExtract.footprints.J3;
  const padStart = pcbSceneX(j3.x) - 17.5;
  for (let i = 0; i < 10; i++) {
    addPlaneRect(group, 2.0, 5.2, padStart + i * 3.9, pcbSceneY(j3.y) + 8.5, topZ + 0.55, modulePadMaterial);
  }

  const resetBootMaterial = new THREE.MeshBasicMaterial({
    color: "#20211d",
    transparent: true,
    opacity: 0.98,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  for (const tact of pcbExtract.switches.filter(sw => sw.fpid.includes("SW_Tactile"))) {
    addPlaneRect(group, 4, 3, pcbSceneX(tact.x), pcbSceneY(tact.y), topZ + 0.62, resetBootMaterial, tact.rot ?? 0);
    const label = makeTextSprite(tact.ref.replace("SW_", ""), "#ffffff", 3.2);
    label.position.set(pcbSceneX(tact.x), pcbSceneY(tact.y) + 4.2, labelZ);
    group.add(label);
  }

  group.name = "pcb-fit";
  return group;
}

function addModelOutlines(geometry: THREE.BufferGeometry, offset: ModelPart["offset"]) {
  const edgeGeometry = new THREE.EdgesGeometry(geometry, 24);
  const lines = new THREE.LineSegments(
    edgeGeometry,
    new THREE.LineBasicMaterial({
      color: "#242520",
      transparent: true,
      opacity: 0.32
    })
  );
  lines.position.set(offset.x, offset.y, offset.z);
  lines.renderOrder = 8;
  edgeLineSegments.push(lines);
  modelGroup.add(lines);
}

function clearModel() {
  for (const mesh of meshes) modelGroup.remove(mesh);
  for (const lines of edgeLineSegments) modelGroup.remove(lines);
  meshes = [];
  edgeLineSegments = [];
}

function loadStl(url: string): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    new STLLoader().load(url, resolve, undefined, reject);
  });
}

async function loadModel() {
  const model = models[currentModelKey];
  setStatus(`Loading ${model.label}`);
  clearModel();
  let geometries: THREE.BufferGeometry[];
  try {
    geometries = await Promise.all(model.parts.map(part => loadStl(modelFileUrl(part.file))));
  } catch {
    setStatus("Model failed to load");
    return;
  }

  let vertices = 0;
  const totalBox = new THREE.Box3();
  geometries.forEach((geometry, index) => {
    const part = model.parts[index];
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();

    const mesh = new THREE.Mesh(geometry, currentMaterial.clone());
    mesh.position.set(part.offset.x, part.offset.y, part.offset.z);
    if (part.tint) mesh.userData.tint = part.tint;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshes.push(mesh);
    modelGroup.add(mesh);
    addModelOutlines(geometry, part.offset);

    vertices += geometry.attributes.position.count;
    if (geometry.boundingBox) {
      totalBox.union(geometry.boundingBox.clone().translate(
        new THREE.Vector3(part.offset.x, part.offset.y, part.offset.z)
      ));
    }
  });

  if (!cutoutOverlay) {
    cutoutOverlay = orientForKeyboardView(makeCutoutOverlay(plateTopZ + 0.35));
    scene.add(cutoutOverlay);
  }
  if (!caseFitGroup) {
    caseFitGroup = orientForKeyboardView(makeCaseFitGroup());
    scene.add(caseFitGroup);
  }
  if (!pcbFitGroup) {
    pcbFitGroup = orientForKeyboardView(makePcbFitGroup());
    scene.add(pcbFitGroup);
  }

  const size = totalBox.getSize(new THREE.Vector3());
  currentModelBoundsLabel = `${size.x.toFixed(1)} x ${size.y.toFixed(1)} x ${size.z.toFixed(1)} mm`;
  if (statVertices) statVertices.textContent = formatNumber(vertices);
  if (statFaces) statFaces.textContent = formatNumber(Math.floor(vertices / 3));
  updateBoundsStatForLayer();
  if (statFile) statFile.textContent = model.parts.length === 1
    ? model.parts[0].file
    : `${model.parts.length} parts (${model.label})`;
  const sourceLabel = document.querySelector<HTMLElement>("#model-source");
  if (sourceLabel) sourceLabel.textContent = `Source: ${model.source}`;
  if (downloadButton) downloadButton.href = modelFileUrl(model.parts[0].file);
  setStatus("Ready");
  applyMode(currentMode);
  setLayerView(currentLayerView);
  fitModel();
}

materialSelect?.addEventListener("change", () => {
  currentMaterial = materialLibrary[materialSelect.value as keyof typeof materialLibrary] ?? materialLibrary.graphite;
  applyMode(currentMode);
});

const modelSelect = document.querySelector<HTMLSelectElement>("#model");
if (modelSelect) {
  modelSelect.value = currentModelKey;
  modelSelect.addEventListener("change", () => {
    currentModelKey = (modelSelect.value in models ? modelSelect.value : "prod") as keyof typeof models;
    void loadModel();
  });
}

modeButtons.forEach(button => {
  button.addEventListener("click", () => applyMode((button.dataset.mode as ViewMode) ?? "solid"));
});

layerButtons.forEach(button => {
  button.addEventListener("click", () => setLayerView((button.dataset.layerView as LayerView) ?? "both"));
});

viewButtons.forEach(button => {
  button.addEventListener("click", () => setView(button.dataset.view ?? "iso"));
});

fitButton?.addEventListener("click", fitModel);
resetButton?.addEventListener("click", () => setView("iso"));

renderer.domElement.addEventListener("pointerdown", requestPointerRender);
renderer.domElement.addEventListener("pointermove", requestPointerRender);
renderer.domElement.addEventListener("pointerup", (event: PointerEvent) => {
  lastPointerX = null;
  lastPointerY = null;
  requestPointerRender(event);
});
renderer.domElement.addEventListener("pointerleave", () => {
  lastPointerX = null;
  lastPointerY = null;
});
renderer.domElement.addEventListener("wheel", requestRender, { passive: true });
window.addEventListener("keydown", requestRender);
window.addEventListener("resize", resize);
controls.addEventListener("change", requestRender);
resize();
void loadModel();
requestRender();
