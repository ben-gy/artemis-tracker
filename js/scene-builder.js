// ========================================
// Three.js 3D Scene Builder
// ========================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { smoothPath, moonPosition, missionProgress, pathIndexAtProgress } from './trajectory-service.js';
import { getTrajectory } from './trajectory-data.js';

// Scale: 1 unit = 10,000 km (so Earth is visible, Moon at ~38 units away)
const SCALE = 10000;
const EARTH_RADIUS = 6371 / SCALE;  // ~0.64 units
const MOON_RADIUS = 1737 / SCALE;   // ~0.17 units

let renderer, scene, camera, controls;
let earthMesh, moonMesh, craftMesh, trajectoryLine, trajectoryLineFuture;
let currentTrajectory = null;
let currentSmooth = null;
let animationFrameId = null;
let isInitialized = false;

export function initScene(container) {
    if (isInitialized) {
        // Just resize if already initialized
        handleResize();
        return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050810);
    container.appendChild(renderer.domElement);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 2000);
    camera.position.set(0, 30, 50);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 200;
    controls.target.set(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);

    // Starfield
    createStarfield();

    // Earth
    earthMesh = createCelestialBody(EARTH_RADIUS, 0x1a6fc4, 0x0a3d6b);
    scene.add(earthMesh);

    // Moon
    moonMesh = createCelestialBody(MOON_RADIUS, 0x888888, 0x555555);
    scene.add(moonMesh);

    // Spacecraft marker
    const craftGeom = new THREE.SphereGeometry(0.25, 16, 16);
    const craftMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    craftMesh = new THREE.Mesh(craftGeom, craftMat);
    craftMesh.visible = false;
    scene.add(craftMesh);

    // Glow around spacecraft
    const glowGeom = new THREE.SphereGeometry(0.45, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.15,
    });
    const glowMesh = new THREE.Mesh(glowGeom, glowMat);
    craftMesh.add(glowMesh);

    // Handle resize
    window.addEventListener('resize', handleResize);

    isInitialized = true;

    // Start animation loop
    animate();
}

function createCelestialBody(radius, color, darkColor) {
    const geometry = new THREE.SphereGeometry(radius, 48, 48);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: darkColor,
        emissiveIntensity: 0.15,
        shininess: 15,
    });
    return new THREE.Mesh(geometry, material);
}

function createStarfield() {
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 500 + Math.random() * 500;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        sizes[i] = 0.5 + Math.random() * 1.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.4,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
    });

    scene.add(new THREE.Points(geometry, material));
}

/**
 * Load trajectory for a mission and build the path geometry.
 */
export function loadMissionTrajectory(missionId, missionDate) {
    // Remove old trajectory lines
    if (trajectoryLine) {
        scene.remove(trajectoryLine);
        trajectoryLine.geometry.dispose();
        trajectoryLine = null;
    }
    if (trajectoryLineFuture) {
        scene.remove(trajectoryLineFuture);
        trajectoryLineFuture.geometry.dispose();
        trajectoryLineFuture = null;
    }

    currentTrajectory = getTrajectory(missionId);
    if (!currentTrajectory) {
        currentSmooth = null;
        craftMesh.visible = false;
        // Position Moon at default location
        const moonPos = moonPosition(new Date());
        moonMesh.position.set(moonPos.x / SCALE, moonPos.z / SCALE, -moonPos.y / SCALE);
        return;
    }

    currentSmooth = smoothPath(currentTrajectory, 10);

    // Position Moon for the mission's time period
    const midDate = missionDate || currentTrajectory[Math.floor(currentTrajectory.length / 2)].timestamp;
    const moonPos = moonPosition(midDate);
    moonMesh.position.set(moonPos.x / SCALE, moonPos.z / SCALE, -moonPos.y / SCALE);

    // Build trajectory line
    const progress = missionProgress(currentTrajectory, missionDate || new Date());
    const splitIndex = pathIndexAtProgress(currentSmooth.length, progress);

    // Past trajectory (solid bright blue)
    if (splitIndex > 0) {
        const pastPoints = currentSmooth.slice(0, splitIndex + 1).map(p =>
            new THREE.Vector3(p.x / SCALE, p.z / SCALE, -p.y / SCALE)
        );
        const pastGeom = new THREE.BufferGeometry().setFromPoints(pastPoints);
        const pastMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, linewidth: 2 });
        trajectoryLine = new THREE.Line(pastGeom, pastMat);
        scene.add(trajectoryLine);
    }

    // Future trajectory (semi-transparent)
    if (splitIndex < currentSmooth.length - 1) {
        const futurePoints = currentSmooth.slice(splitIndex).map(p =>
            new THREE.Vector3(p.x / SCALE, p.z / SCALE, -p.y / SCALE)
        );
        const futureGeom = new THREE.BufferGeometry().setFromPoints(futurePoints);
        const futureMat = new THREE.LineBasicMaterial({
            color: 0x60a5fa,
            transparent: true,
            opacity: 0.25,
            linewidth: 1,
        });
        trajectoryLineFuture = new THREE.Line(futureGeom, futureMat);
        scene.add(trajectoryLineFuture);
    }

    // Position spacecraft at current progress
    if (progress > 0 && progress < 1) {
        const idx = Math.min(splitIndex, currentSmooth.length - 1);
        const pos = currentSmooth[idx];
        craftMesh.position.set(pos.x / SCALE, pos.z / SCALE, -pos.y / SCALE);
        craftMesh.visible = true;
    } else if (progress >= 1) {
        // Mission complete - show craft at end
        const pos = currentSmooth[currentSmooth.length - 1];
        craftMesh.position.set(pos.x / SCALE, pos.z / SCALE, -pos.y / SCALE);
        craftMesh.visible = false; // Hide for completed missions
    } else {
        craftMesh.visible = false;
    }

    // Reset camera to show full trajectory
    resetCamera();
}

/**
 * Update spacecraft position for live telemetry.
 */
export function updateCraftPosition(posX, posY, posZ) {
    if (!craftMesh) return;
    craftMesh.position.set(posX / SCALE, posZ / SCALE, -posY / SCALE);
    craftMesh.visible = true;
}

/**
 * Update the trajectory split between past/future.
 */
export function updateTrajectoryProgress(missionId) {
    if (!currentTrajectory || !currentSmooth) return;

    const progress = missionProgress(currentTrajectory, new Date());
    const splitIndex = pathIndexAtProgress(currentSmooth.length, progress);

    // Rebuild past line
    if (trajectoryLine) {
        scene.remove(trajectoryLine);
        trajectoryLine.geometry.dispose();
    }
    if (splitIndex > 0) {
        const pastPoints = currentSmooth.slice(0, splitIndex + 1).map(p =>
            new THREE.Vector3(p.x / SCALE, p.z / SCALE, -p.y / SCALE)
        );
        const pastGeom = new THREE.BufferGeometry().setFromPoints(pastPoints);
        const pastMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, linewidth: 2 });
        trajectoryLine = new THREE.Line(pastGeom, pastMat);
        scene.add(trajectoryLine);
    }

    // Rebuild future line
    if (trajectoryLineFuture) {
        scene.remove(trajectoryLineFuture);
        trajectoryLineFuture.geometry.dispose();
    }
    if (splitIndex < currentSmooth.length - 1) {
        const futurePoints = currentSmooth.slice(splitIndex).map(p =>
            new THREE.Vector3(p.x / SCALE, p.z / SCALE, -p.y / SCALE)
        );
        const futureGeom = new THREE.BufferGeometry().setFromPoints(futurePoints);
        const futureMat = new THREE.LineBasicMaterial({
            color: 0x60a5fa,
            transparent: true,
            opacity: 0.25,
        });
        trajectoryLineFuture = new THREE.Line(futureGeom, futureMat);
        scene.add(trajectoryLineFuture);
    }

    // Update craft position
    if (progress > 0 && progress < 1) {
        const idx = Math.min(splitIndex, currentSmooth.length - 1);
        const pos = currentSmooth[idx];
        craftMesh.position.set(pos.x / SCALE, pos.z / SCALE, -pos.y / SCALE);
        craftMesh.visible = true;
    }
}

/**
 * Show a "no trajectory" state.
 */
export function showNoTrajectory() {
    if (trajectoryLine) { scene.remove(trajectoryLine); trajectoryLine = null; }
    if (trajectoryLineFuture) { scene.remove(trajectoryLineFuture); trajectoryLineFuture = null; }
    craftMesh.visible = false;
    currentTrajectory = null;
    currentSmooth = null;

    const moonPos = moonPosition(new Date());
    moonMesh.position.set(moonPos.x / SCALE, moonPos.z / SCALE, -moonPos.y / SCALE);
    resetCamera();
}

// Camera presets
export function focusEarth() {
    if (!controls) return;
    controls.target.set(0, 0, 0);
    camera.position.set(0, 3, 5);
}

export function focusMoon() {
    if (!controls || !moonMesh) return;
    const mp = moonMesh.position;
    controls.target.copy(mp);
    camera.position.set(mp.x, mp.y + 2, mp.z + 4);
}

export function focusCraft() {
    if (!controls || !craftMesh || !craftMesh.visible) return;
    const cp = craftMesh.position;
    controls.target.copy(cp);
    camera.position.set(cp.x + 2, cp.y + 2, cp.z + 4);
}

export function resetCamera() {
    if (!controls) return;
    controls.target.set(0, 0, 0);
    // Position to see both Earth and Moon with trajectory
    camera.position.set(0, 30, 50);
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);

    // Slow Earth rotation
    if (earthMesh) earthMesh.rotation.y += 0.001;
    if (moonMesh) moonMesh.rotation.y += 0.0005;

    // Pulse spacecraft
    if (craftMesh && craftMesh.visible) {
        const t = Date.now() * 0.003;
        craftMesh.scale.setScalar(1 + Math.sin(t) * 0.15);
    }

    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
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
    if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
    }
    isInitialized = false;
}
