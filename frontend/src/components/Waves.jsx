import { useRef, useEffect } from "react";
import './Waves.css';

class Grad {
  constructor(x, y, z) {
    this.x = x; this.y = y; this.z = z;
  }
  dot2(x, y) { return this.x * x + this.y * y; }
}

class Noise {
  constructor(seed = 0) {
    this.grad3 = [
      new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
      new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
      new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)
    ];
    this.p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    this.perm = new Array(512);
    this.gradP = new Array(512);
    this.seed(seed);
  }

  seed(seed) {
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;
    for (let i = 0; i < 256; i++) {
      let v = (i & 1) ? (this.p[i] ^ (seed & 255)) : (this.p[i] ^ ((seed >> 8) & 255));
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }

  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(a, b, t) { return (1 - t) * a + t * b; }

  perlin2(x, y) {
    let X = Math.floor(x), Y = Math.floor(y);
    x = x - X; y = y - Y;
    X = X & 255; Y = Y & 255;

    const n00 = this.gradP[X + this.perm[Y]].dot2(x, y);
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1);
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y);
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1);

    const u = this.fade(x);
    return this.lerp(
      this.lerp(n00, n10, u),
      this.lerp(n01, n11, u),
      this.fade(y)
    );
  }
}

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
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const boundingRef = useRef({ width: 0, height: 0, left: 0, top: 0 });
  const noiseRef = useRef(new Noise(Math.random()));
  const linesRef = useRef([]);
  const mouseRef = useRef({
    x: 0,
    y: 0,
    radius: 150,
    strength: 40,
    isPressed: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    ctxRef.current = canvas.getContext("2d");
    const ctx = ctxRef.current;

    function setSize() {
      const bounds = container.getBoundingClientRect();
      boundingRef.current = bounds;
      canvas.width = bounds.width;
      canvas.height = bounds.height;
    }

    function handlePointer(e) {
      const bounds = boundingRef.current;
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - bounds.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - bounds.top;
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      mouseRef.current.isPressed = true;
      mouseRef.current.strength = 80;
    }

    function handlePointerUp() {
      mouseRef.current.isPressed = false;
      mouseRef.current.strength = 40;
    }

    function handlePointerMove(e) {
      const bounds = boundingRef.current;
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - bounds.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - bounds.top;
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      
      mouseRef.current.strength = mouseRef.current.isPressed ? 80 : 40;
    }

    function setLines() {
      const { width, height } = boundingRef.current;
      linesRef.current = [];
      
      const cols = Math.ceil(width / xGap) + 2;
      const rows = Math.ceil(height / yGap) + 2;
      const offsetX = (width - (cols * xGap)) / 2;
      const offsetY = (height - (rows * yGap)) / 2;

      for (let i = 0; i < cols; i++) {
        const points = [];
        for (let j = 0; j < rows; j++) {
          points.push({
            x: i * xGap + offsetX,
            y: j * yGap + offsetY,
            originX: i * xGap + offsetX,
            originY: j * yGap + offsetY,
            noiseX: 0,
            noiseY: 0
          });
        }
        linesRef.current.push(points);
      }
    }

    function animate() {
      const time = Date.now() * 0.001;
      const lines = linesRef.current;
      const noise = noiseRef.current;
      const mouse = mouseRef.current;
      const { width, height } = boundingRef.current;

      ctx.clearRect(0, 0, width, height);
      
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 1;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 4;

      // Crear un punto de movimiento automático
      const autoX = Math.sin(time * 0.5) * width * 0.3 + width * 0.5;
      const autoY = Math.cos(time * 0.3) * height * 0.2 + height * 0.5;

      for (let i = 0; i < lines.length; i++) {
        const points = lines[i];
        ctx.beginPath();
        
        points.forEach((point, j) => {
          // Movimiento base de las olas
          const wave1 = noise.perlin2((point.y * 0.002 + time * waveSpeedX), 0) * waveAmpX;
          const wave2 = noise.perlin2((point.y * 0.001 - time * waveSpeedX * 0.7), 1) * waveAmpX * 0.8;
          const wave3 = noise.perlin2((point.x * 0.001 + time * waveSpeedY), 2) * waveAmpY;
          
          point.noiseX = wave1 + wave2;
          point.noiseY = wave3;

          // Añadir movimiento automático
          const dxAuto = point.x - autoX;
          const dyAuto = point.y - autoY;
          const distanceAuto = Math.sqrt(dxAuto * dxAuto + dyAuto * dyAuto);
          const radiusAuto = 200; // Radio de influencia del movimiento automático
          
          if (distanceAuto < radiusAuto) {
            const forceAuto = (1 - distanceAuto / radiusAuto) * 40; // Fuerza del movimiento automático
            point.noiseX += dxAuto * forceAuto * 0.01;
            point.noiseY += dyAuto * forceAuto * 0.01;
          }
          
          // Mantener la interacción del cursor
          if (mouse.x && mouse.y) {
            const dx = point.x - mouse.x;
            const dy = point.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
              const force = (1 - distance / mouse.radius) * mouse.strength;
              point.noiseX += dx * force * 0.02;
              point.noiseY += dy * force * 0.02;
            }
          }
          
          const x = point.originX + point.noiseX;
          const y = point.originY + point.noiseY;

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    }

    setSize();
    setLines();
    animate();

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('touchmove', handlePointerMove);
    container.addEventListener('mousedown', handlePointer);
    container.addEventListener('touchstart', handlePointer);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('mouseleave', handlePointerUp);
    window.addEventListener('resize', setSize);

    return () => {
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchmove', handlePointerMove);
      container.removeEventListener('mousedown', handlePointer);
      container.removeEventListener('touchstart', handlePointer);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('mouseleave', handlePointerUp);
      window.removeEventListener('resize', setSize);
    };
  }, [lineColor, waveSpeedX, waveSpeedY, waveAmpX, waveAmpY, xGap, yGap]);

  return (
    <div
      ref={containerRef}
      className={`waves ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor,
        touchAction: 'none',
        ...style
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Waves; 