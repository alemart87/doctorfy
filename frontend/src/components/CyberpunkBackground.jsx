import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CyberpunkBackground = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Configuración básica
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Crear curvas
    const createCurve = (startX, color) => {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(startX, 0, -20),
        new THREE.Vector3(startX, 0, -10),
        new THREE.Vector3(startX * 0.5, 0, 10),
        new THREE.Vector3(startX * 0.2, 0, 30)
      );

      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      const material = new THREE.LineBasicMaterial({ 
        color: color,
        linewidth: 2,
      });
      
      return new THREE.Line(geometry, material);
    };

    // Crear múltiples líneas
    const lines = [];
    const colors = [0xff1493, 0x00bfff]; // Rosa neón y azul neón

    for (let i = -10; i <= 10; i += 2) {
      const color = colors[Math.abs(i) % 2];
      const line = createCurve(i * 2, color);
      lines.push(line);
      scene.add(line);
    }

    // Posicionar cámara
    camera.position.y = 20;
    camera.position.z = -40;
    camera.rotation.x = -Math.PI * 0.2;

    // Animación
    let frame = 0;
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      frame += 0.005;

      // Animar líneas
      lines.forEach((line, i) => {
        line.position.z = Math.sin(frame + i * 0.1) * 2;
        line.rotation.x = Math.cos(frame * 0.5) * 0.1;
      });

      renderer.render(scene, camera);
    };

    // Manejar redimensionamiento
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Limpieza
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }

      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        background: '#000'
      }} 
    />
  );
};

export default CyberpunkBackground; 