import * as THREE from "three";
import { OrbitControls } from "./three_modules/OrbitControls.js";
import { GLTFLoader } from "./three_modules/GLTFLoader.js";
import { CSS3DRenderer, CSS3DObject } from "./three_modules/CSS3DRenderer.js";
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

// CSS3DRenderer für 2D-Panels initialisieren
const css3dRenderer = new CSS3DRenderer();
css3dRenderer.setSize(window.innerWidth, window.innerHeight);
css3dRenderer.domElement.style.position = 'absolute';
css3dRenderer.domElement.style.top = '0px';
css3dRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(css3dRenderer.domElement);

// Directional Light hinzufügen
const light = new THREE.DirectionalLight(0xFFFFFF, 3);
light.position.set(-1, 2, 4);
scene.add(light);

// Ambient Light hinzufügen
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2); // Farbe und Intensität anpassen
scene.add(ambientLight);

// Variable für den Automaten und das CSS3DObject (2D-Panel)
let automat;
let formCSS3DObject;

// GLTFLoader verwenden, um das Modell zu laden
const loader = new GLTFLoader();
loader.load("./models/automat.glb", function (gltf) {
    // Automaten-Modell laden
    const automatMesh = gltf.scene.children.find((child) => child.name === "Cock");
    const automatMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    automat = new THREE.Mesh(automatMesh.geometry, automatMaterial);
    automat.position.set(0, 3.5, 0);
    automat.rotateY(-Math.PI / 2); 
    scene.add(automat);

    // Erstellen der Hitbox um den Automaten
    const automatHitboxGeometry = new THREE.BoxGeometry(4, 7.5, 4.5); // Größe anpassen
    const automatHitboxMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const automatHitbox = new THREE.Mesh(automatHitboxGeometry, automatHitboxMaterial);
    automatHitbox.position.copy(automat.position); // Position entsprechend dem Automaten
    scene.add(automatHitbox);

    // CSS3DObject erstellen
    const formElement = document.getElementById("canvas")
    formCSS3DObject = new CSS3DObject(formElement);
    formCSS3DObject.position.set(0.6, 1.35, 0); // Beispielpositionierung am Modell (muss angepasst werden)
    formCSS3DObject.scale.set(0.002, 0.002, 0.002); // Kleiner machen
    formCSS3DObject.rotateY((Math.PI / 2))
    formCSS3DObject.rotateX(-0.35)
    formCSS3DObject.element.style.pointerEvents = 'none'
    automat.add(formCSS3DObject);

    canvas.style.visibility = "hidden";

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


// Zugriff auf die Create site
const createDiv = document.getElementById('create');

// Zugriff auf die Storage site
const storageDiv = document.getElementById('storage');

//Zugriff auf die Info site
const infoDiv = document.getElementById('info');


function onClick(event) {
    // Berechne die Mausposition im Normalized Device Coordinate (NDC)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Setze den Ursprung des Raycasters an die aktuelle Kameraposition
    raycaster.setFromCamera(mouse, camera);

    // Überprüfe alle Objekte, die vom Raycaster geschnitten werden
    const intersects = raycaster.intersectObject(automat);

    // Wenn ein Objekt geschnitten wird, führe die gewünschte Aktion aus
    if (intersects.length > 0 && controls.enabled == true) {
        console.log('Automat wurde geklickt!');

        // Verzögertes anzeigen des 2D-Panels, damit es nicht janky aussieht
        setTimeout(function() {
            canvas.style.visibility = "visible";
        }, 1000);

        // Zielposition für die Kamera definieren
        const targetPosition = automat.position.clone().add(new THREE.Vector3(0, 5, 0));
        
        // Interaktivität mit canvas aktivieren
        formCSS3DObject.element.style.pointerEvents = 'auto';
        controls.enabled = false;


        // Animation der Kamera zur Zielposition mit TWEEN.js
        new TWEEN.Tween(camera.position)
            .to(targetPosition, 1000) // Dauer der Animation (in ms)
            .easing(TWEEN.Easing.Quadratic.InOut) // Easing-Funktion für weicheren Übergang
            .start();

        //Richtiges Div anzeigen
        createDiv.style.display = 'none';
        infoDiv.style.display = 'none';
        storageDiv.style.display = 'flex';
        

        //Storages richtig benennen
        const cell1 = document.getElementById("storage1");
        const cell2 = document.getElementById("storage2");
        const cell3 = document.getElementById("storage3");

        cell1.textContent = robot1.name;
        cell2.textContent = robot2.name;
        cell3.textContent = robot3.name;
    }

    
}


 
  // Objects erstellen
  var robot1 = {
    name: "",
    color: "",
    form: "",
    wheels: "",
    pattern: "",
    face: "",
    antenne: "",
    swordshield: "",
    size: "",
  };

  var robot2 = {
    name: "",
    color: "",
    form: "",
    wheels: "",
    pattern: "",
    face: "",
    antenne: "",
    swordshield: "",
    size: "",
  };

  var robot3 = {
    name: "",
    color: "",
    form: "",
    wheels: "",
    pattern: "",
    face: "",
    antenne: "",
    swordshield: "",
    size: "",
  };

  let robot1_deserialized = JSON.parse(localStorage.getItem("robot1"));
  let robot2_deserialized = JSON.parse(localStorage.getItem("robot2"));
  let robot3_deserialized = JSON.parse(localStorage.getItem("robot3"));
  if ( robot1_deserialized != null ){
    robot1 = Object.assign({}, robot1_deserialized);
  }

  if (! robot2_deserialized != null ){
    robot2 = Object.assign({}, robot2_deserialized);
  }

  if (! robot3_deserialized != null ){
    robot3 = Object.assign({}, robot3_deserialized);
  } 

  //Variable um zu unterscheiden welcher Roboter überarbeitet wird
  let active_storage = 0;

  let name_cell = document.getElementById('name-info');
  let color_cell = document.getElementById('color-info');
  let form_cell = document.getElementById('form-info');
  let wheels_cell = document.getElementById('wheels-info');
  let pattern_cell = document.getElementById('pattern-info');
  let face_cell = document.getElementById('face-info');
  let antenne_cell = document.getElementById('antenne-info');
  let swordshield_cell = document.getElementById('swordshield-info')
  let size_cell = document.getElementById('size-info');


//Event-Handler für Buttonclicks
canvas.addEventListener('click', buttons);

function buttons(event) {

  if (event.target.classList.contains('button')) {
    const active_button = event.target.id;
    switch(active_button) {

      // Storage Buttons --------------------------------
      case 'storage1' :
        if (robot1.name == "") {
          storageDiv.style.display = 'none';
          createDiv.style.display = 'flex';
        } else {
          storageDiv.style.display = 'none';
          infoDiv.style.display = 'flex';
          
          name_cell.textContent = robot1.name
          color_cell.textContent = robot1.color
          form_cell.textContent = robot1.form
          wheels_cell.textContent = robot1.wheels
          pattern_cell.textContent = robot1.pattern
          face_cell.textContent = robot1.face
          antenne_cell.textContent = robot1.antenne
          swordshield_cell.textContent = robot1.swordshield
          size_cell.textContent = robot1.size

        }
        active_storage = 1;
        break;

      case 'storage2' :
        if (robot2.name == "") {
          storageDiv.style.display = 'none';
          createDiv.style.display = 'flex';
        } else {
          storageDiv.style.display = 'none';
          infoDiv.style.display = 'flex';
      
          name_cell.textContent = robot2.name
          color_cell.textContent = robot2.color
          form_cell.textContent = robot2.form
          wheels_cell.textContent = robot2.wheels
          pattern_cell.textContent = robot2.pattern
          face_cell.textContent = robot2.face
          antenne_cell.textContent = robot2.antenne
          swordshield_cell.textContent = robot2.swordshield
          size_cell.textContent = robot2.size

        }
        active_storage = 2;
        break;
  
      case 'storage3' :
        if (robot3.name == "") {
          storageDiv.style.display = 'none';
          createDiv.style.display = 'flex';
        } else {
          storageDiv.style.display = 'none';
          infoDiv.style.display = 'flex';

          name_cell.textContent = robot3.name
          color_cell.textContent = robot3.color
          form_cell.textContent = robot3.form
          wheels_cell.textContent = robot3.wheels
          pattern_cell.textContent = robot3.pattern
          face_cell.textContent = robot3.face
          antenne_cell.textContent = robot3.antenne
          swordshield_cell.textContent = robot3.swordshield
          size_cell.textContent = robot3.size

        }
        active_storage = 3;
        break;

      // Create Buttons ----------------------------------
      case 'submit':
        createRobot(active_storage);

        //Richtiges Div anzeigen
        createDiv.style.display = 'none';
        storageDiv.style.display = 'flex';
        storageUpdate();
        break;

  
    }
  }

}

function storageUpdate(){
    let cell1 = document.getElementById("storage1");
    let cell2 = document.getElementById("storage2");
    let cell3 = document.getElementById("storage3");

    cell1.textContent = robot1.name;
    cell2.textContent = robot2.name;
    cell3.textContent = robot3.name;
}

function createRobot(number){
  if (number == 1) {
    const name1 = document.getElementById("nameID").value; 
    const color1 = document.getElementById("colorID").value;
    const form1 = document.querySelector('input[name="form"]:checked').value;
    const wheels1 = document.querySelector('input[name="wheels"]:checked').value;
    const pattern1 = document.querySelector('input[name="pattern"]:checked').value;
    const face1 = document.querySelector('input[name="face"]:checked').value;
    const antenne1 = document.querySelector('input[name="antenna"]:checked').value;
    const checkboxes1 = document.querySelectorAll('input[name="swordshield"]:checked');
    const swordshield1 = Array.from(checkboxes1).map(checkbox => checkbox.value);
    const size1 = document.getElementById('sliderID').value;

    robot1.name = name1;
    robot1.color = color1;
    robot1.form = form1;
    robot1.wheels = wheels1;
    robot1.pattern = pattern1;
    robot1.face = face1;
    robot1.antenne = antenne1;
    robot1.swordshield = swordshield1;
    robot1.size = size1;

    console.log(robot1)
    let robot1_serialized = JSON.stringify(robot1);
    localStorage.setItem("robot1", robot1_serialized);
  
  }
  if (number == 2) {

    const name2 = document.getElementById("nameID").value; 
    const color2 = document.getElementById("colorID").value;
    const form2 = document.querySelector('input[name="form"]:checked').value;
    const wheels2 = document.querySelector('input[name="wheels"]:checked').value;
    const pattern2 = document.querySelector('input[name="pattern"]:checked').value;
    const face2 = document.querySelector('input[name="face"]:checked').value;
    const antenne2 = document.querySelector('input[name="antenna"]:checked').value;
    const checkboxes2 = document.querySelectorAll('input[name="swordshield"]:checked');
    const swordshield2 = Array.from(checkboxes2).map(checkbox => checkbox.value);
    const size2 = document.getElementById('sliderID').value;

    robot2.name = name2;
    robot2.color = color2;
    robot2.form = form2;
    robot2.wheels = wheels2;
    robot2.pattern = pattern2;
    robot2.face = face2;
    robot2.antenne = antenne2;
    robot2.swordshield = swordshield2;
    robot2.size = size2;

    let robot2_serialized = JSON.stringify(robot2);
    localStorage.setItem("robot2", robot2_serialized);

  }
  if (number == 3) {

    const name3 = document.getElementById("nameID").value; 
    const color3 = document.getElementById("colorID").value;
    const form3 = document.querySelector('input[name="form"]:checked').value;
    const wheels3 = document.querySelector('input[name="wheels"]:checked').value;
    const pattern3 = document.querySelector('input[name="pattern"]:checked').value;
    const face3 = document.querySelector('input[name="face"]:checked').value;
    const antenne3 = document.querySelector('input[name="antenna"]:checked').value;
    const checkboxes3 = document.querySelectorAll('input[name="swordshield"]:checked');
    const swordshield3 = Array.from(checkboxes3).map(checkbox => checkbox.value);
    const size3 = document.getElementById('sliderID').value;

    robot3.name = name3;
    robot3.color = color3;
    robot3.form = form3;
    robot3.wheels = wheels3;
    robot3.pattern = pattern3;
    robot3.face = face3;
    robot3.antenne = antenne3;
    robot3.swordshield = swordshield3;
    robot3.size = size3;

    let robot3_serialized = JSON.stringify(robot3);
    localStorage.setItem("robot3", robot3_serialized);
  }

}


//Initialisierungsvariable erstellen
const init = localStorage.getItem("init");

// Initialisierung
if ( init == null ) {

  //Damit Initialierung nur einmal durchgeführt wird
  localStorage.setItem("init", true);
  

  let robot1_serialized = JSON.stringify(robot1);
  let robot2_serialized = JSON.stringify(robot2);
let robot3_serialized = JSON.stringify(robot3);

  //Objects in Localstorage pushen
  localStorage.setItem("robot1", robot1_serialized);
  localStorage.setItem("robot2", robot2_serialized);
  localStorage.setItem("robot3", robot3_serialized);
}

console.log(localStorage);

// Fenstergröße-Anpassung behandeln
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    css3dRenderer.setSize(window.innerWidth, window.innerHeight);
}

  const robot2_serialized = JSON.stringify(robot2);
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && controls.enabled == false) {
        console.log('Escape-Taste wurde gedrückt');
        // Aktionen ausführen, wenn die Escape-Taste gedrückt wird
       
        // Controls wieder aktivieren
        controls.enabled = true;

        // Bildschirm ausschalten
        canvas.style.visibility = "hidden";

        // Kamera zurück zur ursprünglichen Position bewegen
        new TWEEN.Tween(camera.position)
            .to({ x: 0, y: 20, z: 100 }, 1000) // Dauer der Animation (in ms)
            .easing(TWEEN.Easing.Quadratic.InOut) // Easing-Funktion für weicheren Übergang
            .start();

        storageUpdate(); 
    }
});

// Render-Funktion für Animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    TWEEN.update(); // TWEEN-Animationen aktualisieren
    css3dRenderer.render(scene, camera); // CSS3DRenderer rendern

    // Sichtbarkeit des Formulars basierend auf Raycaster-Ergebnis einstellen
    checkFormVisibility();
}

function checkFormVisibility() {
    if (!formCSS3DObject) return;

    // Setze den Ursprung des Raycasters an die aktuelle Kameraposition
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    // Überprüfe alle Objekte, die vom Raycaster geschnitten werden
    const intersects = raycaster.intersectObject(automat, true);

    if (intersects.length > 0) {
        // formCSS3DObject.element.style.display = 'none';
    } else {
        formCSS3DObject.element.style.display = 'block';
    }
}


