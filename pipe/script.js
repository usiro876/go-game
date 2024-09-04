    document.addEventListener('DOMContentLoaded', () => {
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

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        // Add stars to the background
        function addStars() {
            const starGeometry = new THREE.SphereGeometry(0.1, 24, 24);
            const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const starGroup = new THREE.Group();

            for (let i = 0; i < 200; i++) {
                const star = new THREE.Mesh(starGeometry, starMaterial);

                star.position.x = THREE.MathUtils.randFloatSpread(100);
                star.position.y = THREE.MathUtils.randFloatSpread(100);
                star.position.z = THREE.MathUtils.randFloatSpread(100);

                starGroup.add(star);
            }

            scene.add(starGroup);
        }

        addStars();

        // Random walk parameters
        let positions = [];
        let currentPosition = new THREE.Vector3(0, 0, 0);
        const stepSize = 0.5;
        const totalSteps = 1000;

        // Function to get a random direction
        function getRandomDirection() {
            return new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();
        }

        // Function to update the position and add particle
        function updatePosition() {
            const direction = getRandomDirection();
            currentPosition.add(direction.multiplyScalar(stepSize));
            positions.push(currentPosition.clone());
            addParticle(currentPosition, positions.length);
        }

        // Function to create gradient color based on step
        function getColor(step, totalSteps) {
            const hue = (step / totalSteps) * 360;
            return new THREE.Color(`hsl(${hue}, 100%, 50%)`);
        }

        // Function to add a particle at the current position
        function addParticle(position, step) {
            const particleGeometry = new THREE.SphereGeometry(0.05, 16, 16);
            const particleMaterial = new THREE.MeshBasicMaterial({ color: getColor(step, totalSteps) });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.copy(position);
            scene.add(particle);
        }

        // Draw the path with gradient colors
        function drawPath(step) {
            const pathGeometry = new THREE.BufferGeometry().setFromPoints(positions.slice(0, step + 1));
            const pathMaterial = new THREE.LineBasicMaterial({ vertexColors: true });
            
            const colors = [];
            for (let i = 0; i <= step; i++) {
                const color = getColor(i, totalSteps);
                colors.push(color.r, color.g, color.b);
            }

            pathGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            return new THREE.Line(pathGeometry, pathMaterial);
        }

        // Simulate a random walk
        function randomWalk(steps) {
            for (let i = 0; i < steps; i++) {
                updatePosition();
            }
        }

        // Initialize the random walk
        randomWalk(totalSteps);

        // Camera setup and animation loop
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);

        let currentPathStep = 0;
        let currentPath = null;

        function animate() {
            requestAnimationFrame(animate);

            // Update the path
            if (currentPathStep < positions.length) {
                if (currentPath) {
                    scene.remove(currentPath);
                }
                
                currentPath = drawPath(currentPathStep);
                scene.add(currentPath);
                
                currentPathStep++;
            }

            // Rotate camera around the origin
            const time = Date.now() * 0.001;
            const radius = 20;
            camera.position.x = Math.cos(time * 0.5) * radius;
            camera.position.z = Math.sin(time * 0.5) * radius;
            camera.lookAt(0, 0, 0);
            
            renderer.render(scene, camera);
        }

        animate();

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });
