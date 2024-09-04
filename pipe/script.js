// Basic setup
const container = document.getElementById('container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Lighting setup
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

// Add stars to the background
function addStars() {
    const starGeometry = new THREE.SphereGeometry(0.1, 24, 24);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < 200; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);

        star.position.x = THREE.MathUtils.randFloatSpread(100);
        star.position.y = THREE.MathUtils.randFloatSpread(100);
        star.position.z = THREE.MathUtils.randFloatSpread(100);

        scene.add(star);
    }
}

// Call the addStars function to populate the scene with stars
addStars();

// Random walk parameters
let positions = [];
let currentPosition = { x: 0, y: 0, z: 0 };
let directions = ['x+', 'x-', 'y+', 'y-', 'z+', 'z-'];
let lastDirection = '';
let cameraStep = 0;
const cameraSpeed = 0.5;

// Add the starting point
positions.push(currentPosition);

// Function to pick the next direction randomly
function pickNextDirection() {
    let availableDirections = directions.filter(dir => dir !== lastDirection);
    let nextDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)];
    lastDirection = nextDirection;
    return nextDirection;
}

// Function to update the position based on direction and add particle
function updatePosition(direction) {
    switch(direction) {
        case 'x+': currentPosition.x += 1; break;
        case 'x-': currentPosition.x -= 1; break;
        case 'y+': currentPosition.y += 1; break;
        case 'y-': currentPosition.y -= 1; break;
        case 'z+': currentPosition.z += 1; break;
        case 'z-': currentPosition.z -= 1; break;
    }
    positions.push({...currentPosition});
    addParticle(currentPosition);
}

// Function to create gradient color based on step
function getColor(step, totalSteps) {
    const hue = (step / totalSteps) * 360;
    return new THREE.Color(`hsl(${hue}, 100%, 50%)`);
}

// Function to add a particle at the current position
function addParticle(position) {
    const particleGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.set(position.x, position.y, position.z);
    scene.add(particle);
}

// Draw the path with gradient colors and varying line widths
function drawPath() {
    const totalSteps = positions.length;
    for (let i = 0; i < totalSteps - 1; i++) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(positions[i].x, positions[i].y, positions[i].z),
            new THREE.Vector3(positions[i+1].x, positions[i+1].y, positions[i+1].z)
        ]);

        const material = new THREE.LineBasicMaterial({ 
            color: getColor(i, totalSteps),
            linewidth: 2 + (i / totalSteps) * 10 // Vary line width
        });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
    }
}

// Simulate a random walk
function randomWalk(steps) {
    for (let i = 0; i < steps; i++) {
        let nextDirection = pickNextDirection();
        updatePosition(nextDirection);
    }
}

// Initialize the random walk
randomWalk(100);
drawPath();

// Camera setup and animation loop
camera.position.z = 10;

function animate() {
    requestAnimationFrame(animate);

    // Move camera along the path
    if (cameraStep < positions.length) {
        const targetPosition = positions[Math.floor(cameraStep)];
        camera.position.set(targetPosition.x, targetPosition.y, targetPosition.z + 10);
        camera.lookAt(targetPosition.x, targetPosition.y, targetPosition.z);
        cameraStep += cameraSpeed;
    }
    
    renderer.render(scene, camera);
}

animate();
