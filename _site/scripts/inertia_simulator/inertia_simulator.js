import * as THREE from "https://unpkg.com/three@0.162.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.162.0/examples/jsm/controls/OrbitControls.js";
import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm";

// === Basic three.js setup ===
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(4, 3, 6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
window.addEventListener("resize", onResize);
onResize();

// === Lights ===
{
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 7);
    scene.add(dir);
}

// === Coordinate axes helper ===
const axesHelper = new THREE.AxesHelper(2.5);
scene.add(axesHelper);

// === Rod geometry (rectangular bar) ===
// Treat the rod as a solid cuboid with length L along the local X-axis
const mass = 1.0;
const Lx = 3.0;   // length
const Ly = 0.3;   // thickness
const Lz = 0.3;   // thickness

const rodGeom = new THREE.BoxGeometry(Lx, Ly, Lz);
const rodMat = new THREE.MeshStandardMaterial({
    color: 0x6699ff,
    metalness: 0.2,
    roughness: 0.4
});
const rod = new THREE.Mesh(rodGeom, rodMat);
scene.add(rod);

// Start with rod at some skewed orientation
rod.rotation.set(0.6, 0.4, 0.3);

// === Inertia tensor in body frame (about center of mass) ===
// For a solid cuboid of mass m and edge lengths Lx, Ly, Lz:
// Ixx = (1/12) m (Ly^2 + Lz^2), etc.
const Ixx = (mass / 12) * (Ly * Ly + Lz * Lz);
const Iyy = (mass / 12) * (Lx * Lx + Lz * Lz);
const Izz = (mass / 12) * (Lx * Lx + Ly * Ly);

const Ibody = new THREE.Matrix3().set(
    Ixx, 0,   0,
    0,   Iyy, 0,
    0,   0,   Izz
);

// === Physics state ===
let angularVelocity = new THREE.Vector3(0, 0, 0); // world coordinates
const torqueWorld = new THREE.Vector3(0, 1, 0);   // will be controlled via GUI

// === Visual arrows for torque and response axis ===
const torqueColor = 0x00ffff;  // cyan
const alphaColor  = 0xff00ff;  // magenta

const torqueArrow = new THREE.ArrowHelper(
    torqueWorld.clone().normalize(),
    new THREE.Vector3(0, 0, 0),
    2.0,
    torqueColor,
    0.2,
    0.1
);
scene.add(torqueArrow);

const alphaArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 0),
    2.0,
    alphaColor,
    0.2,
    0.1
);
scene.add(alphaArrow);

// === GUI for user-specified torque axis ===
const params = {
    axisX: 0,
    axisY: 1,
    axisZ: 0,
    magnitude: 1.0,
    resetRod: () => {
    rod.rotation.set(0.6, 0.4, 0.3);
    rod.updateMatrixWorld(true);
    angularVelocity.set(0, 0, 0);
    },
    pause: false
};

const gui = new GUI();
const folderAxis = gui.addFolder("Torque axis (world)");
folderAxis.add(params, "axisX", -1, 1, 0.01).name("x").onChange(updateTorqueVector);
folderAxis.add(params, "axisY", -1, 1, 0.01).name("y").onChange(updateTorqueVector);
folderAxis.add(params, "axisZ", -1, 1, 0.01).name("z").onChange(updateTorqueVector);
folderAxis.open();

gui.add(params, "magnitude", 0, 5, 0.01).name("magnitude").onChange(updateTorqueVector);
gui.add(params, "pause").name("pause simulation");
gui.add(params, "resetRod").name("reset rod");

function updateTorqueVector() {
    const axis = new THREE.Vector3(params.axisX, params.axisY, params.axisZ);
    if (axis.lengthSq() < 1e-6) {
    // Avoid zero vector; default to Y axis
    axis.set(0, 1, 0);
    }
    axis.normalize();
    torqueWorld.copy(axis).multiplyScalar(params.magnitude);

    torqueArrow.setDirection(axis);
    torqueArrow.setLength(1.0 + 0.5 * params.magnitude);
}

updateTorqueVector();

// === Utility: compute inertia tensor in world frame ===
const tmpMat3A = new THREE.Matrix3();
const tmpMat3B = new THREE.Matrix3();

function computeWorldInertia() {
    // Extract rotation part of rod's world matrix
    rod.updateMatrixWorld(true);
    const R = tmpMat3A.setFromMatrix4(rod.matrixWorld); // rotation only
    const Rt = tmpMat3B.copy(R).transpose();

    // I_world = R * I_body * R^T
    const Iworld = new THREE.Matrix3();
    Iworld.multiplyMatrices(R, Ibody);
    Iworld.multiply(Rt);
    return Iworld;
}

// === Info panel ===
const infoDiv = document.getElementById("info");

function fmt(x) {
    return x.toFixed(3).padStart(8, " ");
}

function updateInfo(Iworld, tau, alpha) {
    const e = Iworld.elements;
    // Convert column-major array to row-wise display
    const row1 = [e[0], e[1], e[2]];
    const row2 = [e[3], e[4], e[5]];
    const row3 = [e[6], e[7], e[8]];

    const t = tau;
    const a = alpha;

    infoDiv.textContent =
    "World-frame inertia tensor I (about center of mass)\n" +
    "Rows/cols in world (x, y, z)\n\n" +
    "I = [ " + fmt(row1[0]) + " " + fmt(row1[1]) + " " + fmt(row1[2]) + " ]\n" +
    "    [ " + fmt(row2[0]) + " " + fmt(row2[1]) + " " + fmt(row2[2]) + " ]\n" +
    "    [ " + fmt(row3[0]) + " " + fmt(row3[1]) + " " + fmt(row3[2]) + " ]\n\n" +
    "Torque τ (world): ("  + fmt(t.x) + ", " + fmt(t.y) + ", " + fmt(t.z) + " )\n" +
    "Instantaneous α = I⁻¹ τ (world):\n" +
    "             ("  + fmt(a.x) + ", " + fmt(a.y) + ", " + fmt(a.z) + " )\n\n" +
    "Cyan arrow: torque axis (τ)\n" +
    "Magenta arrow: response axis (α, angular acceleration)\n" +
    "Off-diagonal terms of I are what make α deviate from τ.";
}

// === Main animation loop ===
let lastTime = performance.now();

function animate(now) {
    requestAnimationFrame(animate);

    const dt = Math.min(0.033, (now - lastTime) / 1000); // cap dt for stability
    lastTime = now;

    // Compute inertia tensor in world frame
    const Iworld = computeWorldInertia();

    // Compute angular acceleration in world frame: α = I_world⁻¹ * τ
    const IworldInv = Iworld.clone();
    IworldInv.invert(); // assuming it's invertible (true for our rigid body)
    const alphaWorld = torqueWorld.clone().applyMatrix3(IworldInv);

    if (!params.pause) {
    // Integrate angular velocity: ω_{t+dt} = ω_t + α dt
    angularVelocity.addScaledVector(alphaWorld, dt);

    // Apply rotation to rod using ω in world coordinates
    const wMag = angularVelocity.length();
    if (wMag > 1e-6) {
        const axis = angularVelocity.clone().normalize();
        const angle = wMag * dt;
        const dq = new THREE.Quaternion().setFromAxisAngle(axis, angle);

        // Apply world-space rotation: q_new = dq * q
        rod.quaternion.premultiply(dq);
    }
    }

    // Update alpha arrow visualization
    const alphaAxis = alphaWorld.clone();
    if (alphaAxis.lengthSq() < 1e-8) {
    alphaAxis.set(1, 0, 0);
    }
    const alphaLen = Math.min(2.0, 0.5 + alphaWorld.length());
    alphaArrow.setDirection(alphaAxis.normalize());
    alphaArrow.setLength(alphaLen);

    // Update info panel
    updateInfo(Iworld, torqueWorld, alphaWorld);

    controls.update();
    renderer.render(scene, camera);
}

animate(performance.now());
