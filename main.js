import * as THREE from "three";
import { OrbitControls } from "./three_modules/OrbitControls.js";
import { GLTFLoader } from "./three_modules/GLTFLoader.js";
import { CSS2DRenderer, CSS2DObject } from "./three_modules/CSS2DRenderer.js";
import TWEEN from "./tween.esm.js";

// WebGLRenderer initialisieren
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Szene und Kamera initialisieren
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 20, 100);

// OrbitControls für Interaktivität hinzufügen
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.5 - 0.1;
controls.minPolarAngle = 1.25;
controls.enablePan = false;
controls.update();

// CSS2DRenderer für 2D-Overlay-Elemente initialisieren
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Directional Light hinzufügen
const light = new THREE.DirectionalLight(0xFFFFFF, 3);
light.position.set(-1, 2, 4);
scene.add(light);

// Ambient Light hinzufügen
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2); // Farbe und Intensität anpassen
scene.add(ambientLight);

// Variable für den Automaten und das CSS2DObject (Formular)
let automat;
let formCSS2DObject;

// GLTFLoader verwenden, um das Modell zu laden
const loader = new GLTFLoader();
loader.load("./models/automat.glb", function (gltf) {
    // Automaten-Modell laden
    const automatMesh = gltf.scene.children.find((child) => child.name === "Cock");
    const automatMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    automat = new THREE.Mesh(automatMesh.geometry, automatMaterial);
    automat.position.set(0, 3.5, 0);
    automat.rotateY(-Math.PI / 2); // Anpassung der Rotation
    scene.add(automat);

    // Erstellen der Hitbox um den Automaten
    const automatHitboxGeometry = new THREE.BoxGeometry(4, 7.5, 4.5); // Größe anpassen
    const automatHitboxMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const automatHitbox = new THREE.Mesh(automatHitboxGeometry, automatHitboxMaterial);
    automatHitbox.position.copy(automat.position); // Position entsprechend dem Automaten
    scene.add(automatHitbox);

    // Eventlistener auf die Hitbox setzen
    automatHitbox.addEventListener('click', () => {
        console.log('Automat wurde geklickt!');

        // Zielposition für die Kamera definieren
        const targetPosition = automat.position.clone().add(new THREE.Vector3(0, 20, 100));

        // Animation der Kamera zur Zielposition mit TWEEN.js
        new TWEEN.Tween(camera.position)
            .to(targetPosition, 1000) // Dauer der Animation (in ms)
            .easing(TWEEN.Easing.Quadratic.InOut) // Easing-Funktion für weicheren Übergang
            .start()
          
             
    });

    // CSS2DObject für das Formular erstellen
    const canvas = document.getElementById('canvas'); // Beispiel für das Formular-Element
    formCSS2DObject = new CSS2DObject(canvas);
    formCSS2DObject.position.set(0, 1.13, 0); // Beispielpositionierung am Modell (anpassen)
    automat.add(formCSS2DObject); // CSS2DObject als Kind des 3D-Modells hinzufügen
    
    formCSS2DObject.visible = false; 

    // Start der Animationsschleife
    animate();
});

// Boden hinzufügen
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x7d8da8, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotateX(-Math.PI / 2);
plane.position.set(0, 0, 0);
scene.add(plane);

// Raycaster für Kollisionserkennung
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event-Handler für Klick-Ereignisse
renderer.domElement.addEventListener('click', onClick);

function onClick(event) {
    // Berechne die Mausposition im Normalized Device Coordinate (NDC)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Setze den Ursprung des Raycasters an die aktuelle Kameraposition
    raycaster.setFromCamera(mouse, camera);

    // Überprüfe alle Objekte, die vom Raycaster geschnitten werden
    const intersects = raycaster.intersectObject(automat);

    // Wenn ein Objekt geschnitten wird, führe die gewünschte Aktion aus
    if (intersects.length > 0) {
        console.log('Automat wurde geklickt!');

        // Zielposition für die Kamera definieren
        const targetPosition = automat.position.clone().add(new THREE.Vector3(0, 5, 0));
        labelRenderer.domElement.style.pointerEvents = 'auto';
        setTimeout(() => {
    // Code, der nach einer Sekunde ausgeführt werden soll
    formCSS2DObject.visible = true;
},900);

        // Animation der Kamera zur Zielposition mit TWEEN.js
        new TWEEN.Tween(camera.position)
            .to(targetPosition, 1000) // Dauer der Animation (in ms)
            .easing(TWEEN.Easing.Quadratic.InOut) // Easing-Funktion für weicheren Übergang
            .start();
    }
}

// Fenstergröße-Anpassung behandeln
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        console.log('Escape-Taste wurde gedrückt');
        // Aktionen ausführen, wenn die Escape-Taste gedrückt wird
        formCSS2DObject.visible = false;
        labelRenderer.domElement.style.pointerEvents = 'none';

        // Kamera zurück zur ursprünglichen Position bewegen
        new TWEEN.Tween(camera.position)
            .to({ x: 0, y: 20, z: 100 }, 1000) // Dauer der Animation (in ms)
            .easing(TWEEN.Easing.Quadratic.InOut) // Easing-Funktion für weicheren Übergang
            .start();
    }
});

// Render-Funktion für Animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera); // CSS2DRenderer rendern
    TWEEN.update(); // TWEEN-Animationen aktualisieren
}

