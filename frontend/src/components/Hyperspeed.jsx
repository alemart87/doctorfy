import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing';
import './Hyperspeed.css';

// Funciones auxiliares
const random = base => {
  if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0];
  return Math.random() * base;
};

const pickRandom = arr => {
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
  return arr;
};

function lerp(current, target, speed = 0.1, limit = 0.001) {
  let change = (target - current) * speed;
  if (Math.abs(change) < limit) {
    change = target - current;
  }
  return change;
}

function resizeRendererToDisplaySize(renderer, setSize) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    setSize(width, height, false);
  }
  return needResize;
}

const Hyperspeed = ({ effectOptions = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 9,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 50,
  lightPairsPerRoadWay: 50,
  colors: {
    roadColor: 0x000000,
    islandColor: 0x000000,
    background: 0x000000,
    shoulderLines: 0xFFFFFF,
    brokenLines: 0xFFFFFF,
    leftCars: [0xFFFFFF],
    rightCars: [0xFFFFFF],
    sticks: 0xFFFFFF,
  }
} }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Configuración básica de Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      effectOptions.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // Configurar el renderizador
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Configurar la escena
    scene.background = new THREE.Color(effectOptions.colors.background);
    camera.position.z = 5;

    // Crear la carretera
    const roadGeometry = new THREE.PlaneGeometry(
      effectOptions.roadWidth,
      effectOptions.length,
      20,
      200
    );
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: effectOptions.colors.roadColor,
      roughness: 0.7,
      metalness: 0
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Crear líneas de la carretera
    const createRoadLine = (width, color, y = 0.01) => {
      const geometry = new THREE.PlaneGeometry(width, effectOptions.length);
      const material = new THREE.MeshBasicMaterial({ color });
      const line = new THREE.Mesh(geometry, material);
      line.rotation.x = -Math.PI / 2;
      line.position.y = y;
      return line;
    };

    // Añadir líneas
    const shoulderLine = createRoadLine(0.1, effectOptions.colors.shoulderLines);
    scene.add(shoulderLine);

    // Crear luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Efecto de postprocesamiento
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new EffectPass(camera, new BloomEffect());
    composer.addPass(bloomPass);

    // Animación
    let speed = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      // Actualizar velocidad
      speed = lerp(speed, 1, 0.01);

      // Mover la carretera
      road.position.z += speed;
      if (road.position.z > effectOptions.length / 2) {
        road.position.z = -effectOptions.length / 2;
      }

      // Renderizar
      composer.render();
    };

    // Manejar redimensionamiento
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      composer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Iniciar animación
    animate();

    // Limpieza
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      renderer.dispose();
      composer.dispose();
    };
  }, [effectOptions]);

  return <div id="lights" ref={containerRef} />;
};

export default Hyperspeed; 