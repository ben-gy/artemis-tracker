// ========================================
// Three.js 3D Scene Builder
// ========================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { smoothPath, missionProgress, pathIndexAtProgress } from './trajectory-service.js';
import { getTrajectory, getMoonPosition } from './trajectory-data.js';

// Scale: 1 unit = 10,000 km
const SCALE = 10000;
const EARTH_RADIUS = 6371 / SCALE;
const MOON_RADIUS = 1737 / SCALE;

let renderer, scene, camera, controls;
let earthMesh, earthGlow, moonMesh, craftMesh, craftTrail;
let trajectoryLinePast, trajectoryLineFuture;
let distanceLine, distanceLabel;
let currentSmooth = null;
let currentTrajectory = null;
let animationFrameId = null;
let isInitialized = false;

export function initScene(container) {
    if (isInitialized) {
        handleResize();
        return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050810);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 2000);
    camera.position.set(0, 35, 45);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 200;
    controls.target.set(15, 0, -10);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x334466, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);

    // Starfield
    createStarfield();

    // Earth with atmosphere glow
    earthMesh = createBody(EARTH_RADIUS, 0x1a6fc4, 0x0a3d6b);
    scene.add(earthMesh);
    earthGlow = createGlow(EARTH_RADIUS * 1.15, 0x4488ff, 0.12);
    scene.add(earthGlow);

    // Moon
    moonMesh = createBody(MOON_RADIUS, 0x999999, 0x555555);
    scene.add(moonMesh);

    // Spacecraft
    const craftGeom = new THREE.SphereGeometry(0.3, 16, 16);
    const craftMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    craftMesh = new THREE.Mesh(craftGeom, craftMat);
    craftMesh.visible = false;
    scene.add(craftMesh);

    // Glow
    const glowGeom = new THREE.SphereGeometry(0.55, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.15 });
    craftMesh.add(new THREE.Mesh(glowGeom, glowMat));

    // Distance line (Earth to craft)
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const lineMat = new THREE.LineDashedMaterial({ color: 0x334466, dashSize: 0.5, gapSize: 0.3, transparent: true, opacity: 0.4 });
    distanceLine = new THREE.Line(lineGeo, lineMat);
    distanceLine.computeLineDistances();
    distanceLine.visible = false;
    scene.add(distanceLine);

    window.addEventListener('resize', handleResize);
    isInitialized = true;
    animate();
}

function createBody(radius, color, emissive) {
    const geo = new THREE.SphereGeometry(radius, 48, 48);
    const mat = new THREE.MeshPhongMaterial({ color, emissive, emissiveIntensity: 0.15, shininess: 15 });
    return new THREE.Mesh(geo, mat);
}

function createGlow(radius, color, opacity) {
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.BackSide });
    return new THREE.Mesh(geo, mat);
}

function createStarfield() {
    const count = 2500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 500 + Math.random() * 500;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.35, sizeAttenuation: true, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(geo, mat));
}

function toScene(x, y, z) {
    // Convert km coords to Three.js scene coords
    return new THREE.Vector3(x / SCALE, z / SCALE, -y / SCALE);
}

/**
 * Load trajectory for a mission and build path geometry.
 */
export function loadMissionTrajectory(missionId, viewDate) {
    clearTrajectory();

    currentTrajectory = getTrajectory(missionId);
    const moonPos = getMoonPosition(missionId);

    if (!currentTrajectory) {
        currentSmooth = null;
        craftMesh.visible = false;
        distanceLine.visible = false;
        // Default Moon position
        moonMesh.position.copy(toScene(384400, 0, 0));
        return;
    }

    currentSmooth = smoothPath(currentTrajectory, 12);

    // Position Moon at mission-specific location
    if (moonPos) {
        moonMesh.position.copy(toScene(moonPos.x, moonPos.y, moonPos.z));
    }

    // Build & render trajectory at the given view date
    updateSceneAtDate(viewDate || new Date());
    resetCamera();
}

/**
 * Update scene to show state at a specific date.
 * Called by time slider and live polling.
 */
export function updateSceneAtDate(date) {
    if (!currentTrajectory || !currentSmooth) return;

    const progress = missionProgress(currentTrajectory, date);
    const splitIndex = pathIndexAtProgress(currentSmooth.length, progress);

    // Rebuild past line (bright blue)
    if (trajectoryLinePast) { scene.remove(trajectoryLinePast); trajectoryLinePast.geometry.dispose(); }
    if (splitIndex > 0) {
        const pts = currentSmooth.slice(0, splitIndex + 1).map(p => toScene(p.x, p.y, p.z));
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        trajectoryLinePast = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x60a5fa, linewidth: 2 }));
        scene.add(trajectoryLinePast);
    }

    // Rebuild future line (semi-transparent)
    if (trajectoryLineFuture) { scene.remove(trajectoryLineFuture); trajectoryLineFuture.geometry.dispose(); }
    if (splitIndex < currentSmooth.length - 1) {
        const pts = currentSmooth.slice(splitIndex).map(p => toScene(p.x, p.y, p.z));
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        trajectoryLineFuture = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.2 }));
        scene.add(trajectoryLineFuture);
    }

    // Position spacecraft
    if (progress > 0 && progress <= 1) {
        const idx = Math.min(splitIndex, currentSmooth.length - 1);
        const pos = currentSmooth[idx];
        const scenePos = toScene(pos.x, pos.y, pos.z);
        craftMesh.position.copy(scenePos);
        craftMesh.visible = true;

        // Distance line from Earth to craft
        const positions = distanceLine.geometry.attributes.position;
        positions.setXYZ(0, 0, 0, 0);
        positions.setXYZ(1, scenePos.x, scenePos.y, scenePos.z);
        positions.needsUpdate = true;
        distanceLine.computeLineDistances();
        distanceLine.visible = true;
    } else {
        craftMesh.visible = false;
        distanceLine.visible = false;
    }
}

function clearTrajectory() {
    if (trajectoryLinePast) { scene.remove(trajectoryLinePast); trajectoryLinePast.geometry.dispose(); trajectoryLinePast = null; }
    if (trajectoryLineFuture) { scene.remove(trajectoryLineFuture); trajectoryLineFuture.geometry.dispose(); trajectoryLineFuture = null; }
    craftMesh.visible = false;
    distanceLine.visible = false;
    currentTrajectory = null;
    currentSmooth = null;
}

export function showNoTrajectory() {
    clearTrajectory();
    moonMesh.position.copy(toScene(384400, 0, 0));
    resetCamera();
}

// Camera presets
export function focusEarth() {
    controls.target.set(0, 0, 0);
    camera.position.set(0, 3, 5);
}

export function focusMoon() {
    const mp = moonMesh.position;
    controls.target.copy(mp);
    camera.position.set(mp.x, mp.y + 2, mp.z + 4);
}

export function focusCraft() {
    if (!craftMesh.visible) return;
    const cp = craftMesh.position;
    controls.target.copy(cp);
    camera.position.set(cp.x + 2, cp.y + 2, cp.z + 4);
}

export function resetCamera() {
    controls.target.set(15, 0, -10);
    camera.position.set(0, 35, 45);
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);
    if (earthMesh) earthMesh.rotation.y += 0.001;
    if (earthGlow) earthGlow.rotation.y += 0.001;
    if (moonMesh) moonMesh.rotation.y += 0.0005;
    if (craftMesh && craftMesh.visible) {
        const t = Date.now() * 0.003;
        craftMesh.scale.setScalar(1 + Math.sin(t) * 0.15);
    }
    controls.update();
    renderer.render(scene, camera);
}

function handleResize() {
    const container = renderer?.domElement?.parentElement;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

export function dispose() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', handleResize);
    if (renderer) { renderer.dispose(); renderer.domElement.remove(); }
    isInitialized = false;
}
