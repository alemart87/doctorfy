import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const DEFAULT_CONFIG = {
  count: 170,              // Cantidad de bolas
  gravity: 0.7,            // Gravedad
  friction: 0.9975,        // Fricción
  wallBounce: 0.95,        // Rebote en paredes
  followCursor: false,     // No seguir el cursor
  colors: ['#ffffff'],     // Color de las bolas
  maxVelocity: 0.15,      // Velocidad máxima
  minSize: 0.5,           // Tamaño mínimo
  maxSize: 2,             // Tamaño máximo
  opacity: 0.2            // Opacidad
};

const Ballpit = ({ config = {} }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Configuración
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Setup Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true 
    });

    // Configurar renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Configurar cámara
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);

    // Crear bolas
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
      color: finalConfig.colors[0],
      metalness: 0.5,
      roughness: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      opacity: finalConfig.opacity,
      transparent: true
    });

    // Crear instancias
    const balls = new THREE.InstancedMesh(geometry, material, finalConfig.count);
    scene.add(balls);

    // Física
    const positions = new Float32Array(finalConfig.count * 3);
    const velocities = new Float32Array(finalConfig.count * 3);
    const dummy = new THREE.Object3D();

    // Inicializar posiciones
    for (let i = 0; i < finalConfig.count; i++) {
      positions[i * 3] = THREE.MathUtils.randFloatSpread(10);
      positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(10);
      positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(10);
    }

    // Animación
    const animate = () => {
      // Actualizar física
      for (let i = 0; i < finalConfig.count; i++) {
        const idx = i * 3;

        // Aplicar gravedad
        velocities[idx + 1] -= finalConfig.gravity * 0.016;

        // Actualizar posiciones
        for (let axis = 0; axis < 3; axis++) {
          positions[idx + axis] += velocities[idx + axis];
        }

        // Colisiones con paredes
        for (let axis = 0; axis < 3; axis++) {
          if (Math.abs(positions[idx + axis]) > 10) {
            positions[idx + axis] = Math.sign(positions[idx + axis]) * 10;
            velocities[idx + axis] *= -finalConfig.wallBounce;
          }
        }

        // Aplicar fricción
        for (let axis = 0; axis < 3; axis++) {
          velocities[idx + axis] *= finalConfig.friction;
        }

        // Actualizar matriz
        dummy.position.set(
          positions[idx],
          positions[idx + 1],
          positions[idx + 2]
        );
        dummy.updateMatrix();
        balls.setMatrixAt(i, dummy.matrix);
      }

      balls.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        background: 'black'
      }}
    />
  );
};

export default Ballpit; 