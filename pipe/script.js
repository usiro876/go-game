// Basic setup
const container = document.getElementById('container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Material for the lines
const material = new THREE.LineBasicMaterial({ color: 0xffffff });

// Random walk parameters
let positions = [];
let currentPosition = { x: 0, y: 0, z: 0 };
let directions = ['x+', 'x-', 'y+', 'y-', 'z+', 'z-'];
let lastDirection = '';

// Add the starting point
positions.push(currentPosition);

// Function to pick the next direction randomly
function pickNextDirection() {
    let availableDirections = directions.filter(dir => dir !== lastDirection);
    let nextDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)];
    lastDirection = nextDirection;
    return nextDirection;
}

// Function to update the position based on direction
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
}

// Simulate a random walk
function randomWalk(steps) {
    for (let i = 0; i < steps; i++) {
        let nextDirection = pickNextDirection();
        updatePosition(nextDirection);
    }
}

// Draw the path
function drawPath() {
    const geometry = new THREE.BufferGeometry().setFromPoints(
        positions.map(pos => new THREE.Vector3(pos.x, pos.y, pos.z))
    );
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}

// Initialize the random walk
randomWalk(100);
drawPath();

// Camera setup
camera.position.z = 10;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
