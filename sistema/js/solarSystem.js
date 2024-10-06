// Importación
import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";
import planetInfo from './planetInfo.js';



// Creando el renderer con transparencia
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cargador de texturas
const textureLoader = new THREE.TextureLoader();

// Importar todas las texturas
const textures = {
  sun: textureLoader.load("./image/sun.jpg"),
  mercury: textureLoader.load("./image/mercury.jpg"),
  venus: textureLoader.load("./image/venus.jpg"),
  earth: textureLoader.load("./image/earth.jpg"),
  mars: textureLoader.load("./image/mars.jpg"),
  jupiter: textureLoader.load("./image/jupiter.jpg"),
  saturn: textureLoader.load("./image/saturn.jpg"),
  uranus: textureLoader.load("./image/uranus.jpg"),
  neptune: textureLoader.load("./image/neptune.jpg"),
  pluto: textureLoader.load("./image/pluto.jpg"),
  saturnRing: textureLoader.load("./image/saturn_ring.png"),
  uranusRing: textureLoader.load("./image/uranus_ring.png"),
};

// Creando la escena
const scene = new THREE.Scene();

// Cámara en perspectiva
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-50, 90, 150);

// Controles de perspectiva
const orbit = new OrbitControls(camera, renderer.domElement);

// Sol
const sungeo = new THREE.SphereGeometry(15, 50, 50);
const sunMaterial = new THREE.MeshBasicMaterial({
  map: textures.sun,
});
const sun = new THREE.Mesh(sungeo, sunMaterial);
scene.add(sun);

// Luz del sol (luz puntual)
const sunLight = new THREE.PointLight(0xffffff, 1, 300);
scene.add(sunLight);

// Luz ambiental
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Trayectoria de los planetas
const path_of_planets = [];
function createLineLoopWithMesh(radius, color, width) {
  const material = new THREE.LineBasicMaterial({
    color: color,
    linewidth: width,
  });
  const geometry = new THREE.BufferGeometry();
  const lineLoopPoints = [];
  const numSegments = 100;

  // Calcular puntos para la trayectoria circular
  for (let i = 0; i <= numSegments; i++) {
    const angle = (i / numSegments) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    lineLoopPoints.push(x, 0, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(lineLoopPoints, 3)
  );
  const lineLoop = new THREE.LineLoop(geometry, material);
  scene.add(lineLoop);
  path_of_planets.push(lineLoop);
}

// Crear planetas
const genratePlanet = (size, planetTexture, x, ring) => {
  const planetGeometry = new THREE.SphereGeometry(size, 50, 50);
  const planetMaterial = new THREE.MeshStandardMaterial({
    map: planetTexture,
  });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  const planetObj = new THREE.Object3D();
  planet.position.set(x, 0, 0);
  if (ring) {
    const ringGeo = new THREE.RingGeometry(
      ring.innerRadius,
      ring.outerRadius,
      32
    );
    const ringMat = new THREE.MeshBasicMaterial({
      map: ring.ringmat,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    planetObj.add(ringMesh);
    ringMesh.position.set(x, 0, 0);
    ringMesh.rotation.x = -0.5 * Math.PI;
  }
  scene.add(planetObj);

  planetObj.add(planet);
  createLineLoopWithMesh(x, 0xffffff, 3);
  return {
    planetObj: planetObj,
    planet: planet,
  };
};



// Crear planetas
const planets = [
  {
    ...genratePlanet(3.2, textures.mercury, 28),
    rotaing_speed_around_sun: 0.004,
    self_rotation_speed: 0.004,
    name: 'Mercury'
  },
  {
    ...genratePlanet(5.8, textures.venus, 44),
    rotaing_speed_around_sun: 0.015,
    self_rotation_speed: 0.002,
    name: 'Venus'
  },
  {
    ...genratePlanet(6, textures.earth, 62),
    rotaing_speed_around_sun: 0.01,
    self_rotation_speed: 0.02,
    name: 'Earth'
  },
  {
    ...genratePlanet(4, textures.mars, 78),
    rotaing_speed_around_sun: 0.008,
    self_rotation_speed: 0.018,
    name: 'Mars'
  },
  {
    ...genratePlanet(12, textures.jupiter, 100),
    rotaing_speed_around_sun: 0.002,
    self_rotation_speed: 0.04,
    name: 'Jupiter'
  },
  {
    ...genratePlanet(10, textures.saturn, 138, {
      innerRadius: 10,
      outerRadius: 20,
      ringmat: textures.saturnRing,
    }),
    rotaing_speed_around_sun: 0.0009,
    self_rotation_speed: 0.038,
    name: 'Saturn'
  },
  {
    ...genratePlanet(7, textures.uranus, 176, {
      innerRadius: 7,
      outerRadius: 12,
      ringmat: textures.uranusRing,
    }),
    rotaing_speed_around_sun: 0.0004,
    self_rotation_speed: 0.03,
    name: 'Uranus'
  },
  {
    ...genratePlanet(7, textures.neptune, 200),
    rotaing_speed_around_sun: 0.0001,
    self_rotation_speed: 0.032,
    name: 'Neptune'
  },
  {
    ...genratePlanet(2.8, textures.pluto, 216),
    rotaing_speed_around_sun: 0.0007,
    self_rotation_speed: 0.008,
    name: 'Pluto'
  },
];

// Función para agregar el nombre a los planetas
const createPlanetLabel = (name, position) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '30px Arial';
  context.fillStyle = 'white';
  context.fillText(name, 0, 24);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.set(position.x, position.y + 10, position.z); // Ajustar posición según el planeta
  sprite.scale.set(20, 10, 1); // Ajustar el tamaño del texto
  scene.add(sprite);
  return sprite;
};

// Agregar nombres a cada planeta después de crearlos
createPlanetLabel('Mercury', new THREE.Vector3(28, 0, 0));
createPlanetLabel('Venus', new THREE.Vector3(44, 0, 0));
createPlanetLabel('Earth', new THREE.Vector3(62, 0, 0));
createPlanetLabel('Mars', new THREE.Vector3(78, 0, 0));
createPlanetLabel('Jupiter', new THREE.Vector3(100, 0, 0));
createPlanetLabel('Saturn', new THREE.Vector3(138, 0, 0));
createPlanetLabel('Uranus', new THREE.Vector3(176, 0, 0));
createPlanetLabel('Neptune', new THREE.Vector3(200, 0, 0));
createPlanetLabel('Pluto', new THREE.Vector3(216, 0, 0));

// Opciones de la GUI
const gui = new dat.GUI();
const options = {
  "Real View": true,
  "Show Trajectories": true,
  velocidad: 1,
};
gui.add(options, "Real View").onChange((e) => {
  ambientLight.intensity = e ? 0 : 0.5;
});
gui.add(options, "Show Trajectories").onChange((e) => {
  path_of_planets.forEach((dpath) => {
    dpath.visible = e;
  });
});
const maxSpeed = new URL(window.location.href).searchParams.get("ms") * 1;
gui.add(options, "velocidad", 0, maxSpeed ? maxSpeed : 20);

// Ciclo de animación
function animate(time) {
  sun.rotateY(options.velocidad * 0.004);
  planets.forEach(
    ({ planetObj, planet, rotaing_speed_around_sun, self_rotation_speed }) => {
      planetObj.rotateY(options.velocidad * rotaing_speed_around_sun);
      planet.rotateY(options.velocidad * self_rotation_speed);
    }
  );
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  // Convertir la posición del clic a coordenadas de la pantalla
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Calcular los objetos intersectados
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.planet));

  if (intersects.length > 0) {
    const clickedPlanet = intersects[0].object;

    // Obtener información del planeta correspondiente
    const planetData = planets.find(p => p.planet === clickedPlanet);
    if (planetData) {
      const planetNameElement = document.getElementById("planetName");
      const planetDataElement = document.getElementById("planetData");
      planetNameElement.innerText = planetData.name;

      // Obtener información estática del planeta
      const info = planetInfo[planetData.name];
      if (info) {
        planetDataElement.innerHTML = `
          <img src="${info.image}" width="150px" alt="${planetData.name}">
          <br>Descripción: ${info.description}
        `;
      }

      document.getElementById("planetModal").style.display = "block"; // Mostrar el modal
    }
  }
}

// Función para manejar el cierre del modal
document.getElementById("closeModal").onclick = () => {
  document.getElementById("planetModal").style.display = "none"; // Cerrar el modal
};

window.addEventListener("click", onMouseClick);

// Ajustar la cámara al redimensionar la ventana
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

