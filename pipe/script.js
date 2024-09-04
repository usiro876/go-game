let scene, camera, renderer, container;
let points = [];
let line;

function init() {
    // シーンの作成
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // カメラの設定
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // レンダラーの設定
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    // 光源の追加
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // ランダムウォークの初期点
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    points.push(new THREE.Vector3(0, 0, 0));
    geometry.setFromPoints(points);

    line = new THREE.Line(geometry, material);
    scene.add(line);
}

function animate() {
    requestAnimationFrame(animate);

    // 新しい点を追加
    const lastPoint = points[points.length - 1];
    const newPoint = lastPoint.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
    ));
    points.push(newPoint);

    // ラインジオメトリを更新
    line.geometry.setFromPoints(points);

    // カメラを回転
    camera.position.x = Math.sin(Date.now() * 0.001) * 50;
    camera.position.z = Math.cos(Date.now() * 0.001) * 50;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 初期化とアニメーションの開始
init();
animate();

// リサイズイベントリスナーの追加
window.addEventListener('resize', onWindowResize, false);
