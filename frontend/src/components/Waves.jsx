import { useRef, useEffect } from "react";
import './Waves.css';

const Waves = ({
  lineColor = "#ffffff",
  backgroundColor = "transparent",
  waveSpeedX = 0.05,
  waveSpeedY = 0.03,
  waveAmpX = 80,
  waveAmpY = 60,
  xGap = 35,
  yGap = 48,
  style = {},
  className = ""
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Simplificado: usar Math.sin en lugar de Perlin noise
    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';

      const cols = Math.ceil(width / xGap);
      const rows = Math.ceil(height / yGap);

      // Dibujar líneas verticales
      for (let i = 0; i < cols; i++) {
        ctx.beginPath();
        for (let j = 0; j < rows; j++) {
          const x = i * xGap + Math.sin(time * 0.001 + j * 0.5) * waveAmpX;
          const y = j * yGap + Math.sin(time * 0.002 + i * 0.5) * waveAmpY;

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Manejar resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [lineColor, waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, xGap, yGap]);

  return (
    <div
      className={`waves ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor,
        ...style
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Waves; 