

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffff00);
scene.add(ambientLight);

const lights = [];
lights[0] = new THREE.PointLight(0xbada55, 3, 0);
lights[1] = new THREE.PointLight(0x3399ff, 1, 0);
lights[2] = new THREE.PointLight(0xcc33ff, 1, 0);

lights[0].position.set(0, 200, 0);
lights[1].position.set(100, 200, 100);
lights[2].position.set(-100, -200, -100);

scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);

const material = new THREE.MeshLambertMaterial({
    color: 0xcc33ff,
    wireframe: true,
    wireframeLinewidth: 1,
});
const circle_geom = new THREE.SphereGeometry(20, 30, 30);

const circle = new THREE.Mesh(circle_geom, material);

scene.add(circle);

camera.position.z = 40;

const render = function () {
    const t0 = performance.now();

    requestAnimationFrame(render);

    circle.rotation.x += 0.001;
    circle.rotation.y += 0.001;
    circle.rotation.z += 0.001;

    renderer.render(scene, camera);

    const t1 = performance.now();
    console.log(`Call to render() took ${t1 - t0} milliseconds.`);
};

render();