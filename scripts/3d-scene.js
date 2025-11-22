// Minimal Three.js scene for a modern 3D background
(function () {
    const container = document.getElementById('scene-container');
    if (!container || typeof THREE === 'undefined') return;

    // Scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.classList.add('three-canvas');
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 5, 5);
    scene.add(dir);

    // Main geometry: torus knot
    const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 128, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0x6C63FF,
        metalness: 0.6,
        roughness: 0.2,
        emissive: 0x000000,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Soft rim light using a second, slightly larger mesh with transparent gradient-like material
    const outlineMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.06,
        roughness: 1,
        metalness: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
    });
    const outline = new THREE.Mesh(new THREE.TorusKnotGeometry(1.55, 0.42, 128, 32), outlineMat);
    scene.add(outline);

    // Particles for depth
    const particlesCount = 500;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, opacity: 0.7, transparent: true });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Mouse-based subtle parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMove = (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    // Touch support
    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length) {
            mouseX = (e.touches[0].clientX - window.innerWidth / 2) / window.innerWidth;
            mouseY = (e.touches[0].clientY - window.innerHeight / 2) / window.innerHeight;
        }
    }, { passive: true });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.004;
        mesh.rotation.y += 0.01;
        mesh.rotation.z += 0.002;
        outline.rotation.copy(mesh.rotation);

        // follow mouse for parallax
        mesh.position.x += (mouseX * 2 - mesh.position.x) * 0.05;
        mesh.position.y += (-mouseY * 1.5 - mesh.position.y) * 0.05;

        particles.rotation.y += 0.0008;
        renderer.render(scene, camera);
    }
    animate();

    // Resize handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Small optimization: stop rendering when page is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            renderer.setAnimationLoop(null);
        } else {
            renderer.setAnimationLoop(animate);
        }
    });
})();
