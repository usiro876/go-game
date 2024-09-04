let scene, camera, renderer, controls;
let positions = [];
let particles = [];
let currentPosition = { x: 0, y: 0, z: 0 };
let directions = ['x+', 'x-', 'y+', 'y-', 'z+', 'z-'];
let lastDirection = '';
let cameraStep = 0;
let cameraSpeed = 0.1;
let steps = 100;
let animationSpeed = 1;

const sound = new Howl({
    src: ['https://example.com/path/to/your/sound.mp3'],
    loop: true,
    volume: 0.5
});

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Fog
    scene.fog = new THREE.FogExp2(0x000000, 0.01);

    // Skybox
    const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const skyboxMaterials = [
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('https://example.com/path/to/skybox/right.jpg'), side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('https://example.com/path/to/skybox/left.jpg'), side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('https://example.com/path/to/skybox/top.jpg'), side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('https://example.com/path/to/skybox/bottom.jpg'), side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('https://example.com/path/to/skybox/front.jpg'), side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('https://example.com/path/to/skybox/back.jpg'), side: THREE.BackSide })
    ];
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
    scene.add(skybox);

    addStars();
    generatePath();

    // GUI
    const gui = new dat.GUI();
    gui.add(scene.fog, 'density', 0, 0.1);
    gui.add(animationSpeed, 'value', 0.1, 2).name('Animation Speed');

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('regenerateBtn').addEventListener('click', regeneratePath);
    document.getElementById('stepsSlider').addEventListener('input', updateSteps);
    document.getElementById('speedSlider').addEventListener('input', updateSpeed);

    sound.play();
}

function addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1 });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starsVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

function pickNextDirection() {
    let availableDirections = directions.filter(dir => dir !== lastDirection);
    let nextDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)];
    lastDirection = nextDirection;
    return nextDirection;
}

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

function getColor(step, totalSteps) {
    const hue = (step / totalSteps) * 360;
    return new THREE.Color(`hsl(${hue}, 100%, 50%)`);
}

function addParticle(position) {
    const geometries = [
        new THREE.SphereGeometry(0.1, 32, 32),
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.ConeGeometry(0.1, 0.2, 32)
    ];
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshPhongMaterial({ color: 0xffff00, shininess: 100 });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(position.x, position.y, position.z);
    scene.add(particle);
    particles.push(particle);
}

function drawPath() {
    const totalSteps = positions.length;
    const pathGeometry = new THREE.BufferGeometry();
    const pathMaterial = new THREE.LineBasicMaterial({ vertexColors: true });
    
    const vertices = [];
    const colors = [];

    for (let i = 0; i < totalSteps; i++) {
        vertices.push(positions[i].x, positions[i].y, positions[i].z);
        const color = getColor(i, totalSteps);
        colors.push(color.r, color.g, color.b);
    }

    pathGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    pathGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const path = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(path);
}

function generatePath() {
    positions = [];
    particles.forEach(particle => scene.remove(particle));
    particles = [];
    currentPosition = { x: 0, y: 0, z: 0 };
    cameraStep = 0;

    positions.push({...currentPosition});
    for (let i = 0; i < steps; i++) {
        let nextDirection = pickNextDirection();
        updatePosition(nextDirection);
    }
    drawPath();
}

function animate() {
    requestAnimationFrame(animate);

    // Move and rotate particles
    particles.forEach((particle, index) => {
        particle.rotation.x += 0.01 * animationSpeed;
        particle.rotation.y += 0.01 * animationSpeed;
        particle.scale.setScalar(1 + Math.sin(Date.now() * 0.001 + index) * 0.1);
    });

    // Move camera along the path
    if (cameraStep < positions.length) {
        const targetPosition = positions[Math.floor(cameraStep)];
        camera.position.lerp(new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z + 10), 0.1);
        camera.lookAt(targetPosition.x, targetPosition.y, targetPosition.z);
        cameraStep += cameraSpeed * animationSpeed;
    }

    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function regeneratePath() {
    generatePath();
}

function updateSteps(event) {
    steps = parseInt(event.target.value);
    document.getElementById('info').textContent = `Steps: ${steps}`;
}

function updateSpeed(event) {
    animationSpeed = parseFloat(event.target.value);
    document.getElementById('info').textContent = `Speed: ${animationSpeed.toFixed(1)}`;
}

init();
animate();
