import { useRef, useEffect } from 'react';

/*  Componente que dibuja un efecto "glitch" de letras en un canvas
    Props principales:
      – glitchSpeed (ms)
      – centerVignette / outerVignette (boolean)
      – smooth (true para transiciones de color)
*/
const LetterGlitch = ({
  glitchColors   = ['#2b4539', '#61dca3', '#61b3dc'],
  glitchSpeed    = 50,
  centerVignette = false,
  outerVignette  = true,
  smooth         = true,
}) => {

  const canvasRef       = useRef(null);
  const ctxRef          = useRef(null);
  const lettersRef      = useRef([]);
  const gridRef         = useRef({ cols:0, rows:0 });
  const animRef         = useRef(null);
  const lastGlitchTime  = useRef(Date.now());

  /* ---------- constantes visuales ---------- */
  const fontSize   = 16;
  const charWidth  = 10;
  const charHeight = 20;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>,0123456789'.split('');

  /* ---------- helpers ---------- */
  const rand = arr => arr[Math.floor(Math.random()*arr.length)];
  const randomChar   = () => rand(chars);
  const randomColor  = () => rand(glitchColors);
  const hexToRgb     = h => {
    const full = h.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(m,r,g,b)=>r+r+g+g+b+b);
    const res  = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
    return res ? { r:parseInt(res[1],16), g:parseInt(res[2],16), b:parseInt(res[3],16)} : null;
  };
  const mix = (a,b,f)=>
    `rgb(${Math.round(a.r+(b.r-a.r)*f)},${Math.round(a.g+(b.g-a.g)*f)},${Math.round(a.b+(b.b-a.b)*f)})`;

  /* ---------- canvas y grid ---------- */
  const calcGrid = (w,h)=>({ cols:Math.ceil(w/charWidth), rows:Math.ceil(h/charHeight) });

  const initLetters = (cols,rows)=>{
    gridRef.current = { cols, rows };
    lettersRef.current = Array.from({length:cols*rows},()=>({
      char : randomChar(),
      color: randomColor(),
      target: randomColor(),
      progress:1
    }));
  };

  const resizeCanvas = ()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    const parent = canvas.parentElement; if(!parent) return;
    const dpr = window.devicePixelRatio||1;
    const { width, height } = parent.getBoundingClientRect();
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    canvas.style.width  = `${width}px`;
    canvas.style.height = `${height}px`;
    if(ctxRef.current) ctxRef.current.setTransform(dpr,0,0,dpr,0,0);
    const { cols,rows } = calcGrid(width,height);
    initLetters(cols,rows);
  };

  /* ---------- dibujo ---------- */
  const draw = ()=>{
    const ctx = ctxRef.current; if(!ctx) return;
    const { width,height } = canvasRef.current.getBoundingClientRect();
    ctx.clearRect(0,0,width,height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';
    lettersRef.current.forEach((lt,i)=>{
      const x = (i % gridRef.current.cols)*charWidth;
      const y = Math.floor(i/gridRef.current.cols)*charHeight;
      ctx.fillStyle = lt.color;
      ctx.fillText(lt.char,x,y);
    });
  };

  /* ---------- actualización ---------- */
  const glitchUpdate = ()=>{
    const list = lettersRef.current;
    if(!list.length) return;
    const n = Math.max(1,Math.floor(list.length*0.05));
    for(let i=0;i<n;i++){
      const idx = Math.floor(Math.random()*list.length);
      const l   = list[idx];
      l.char       = randomChar();
      l.target     = randomColor();
      l.progress   = smooth ? 0 : 1;
      if(!smooth) l.color = l.target;
    }
  };

  const smoothColors = ()=>{
    let need = false;
    lettersRef.current.forEach(l=>{
      if(l.progress<1){
        l.progress += 0.05;
        if(l.progress>1) l.progress=1;
        const s = hexToRgb(l.color);
        const e = hexToRgb(l.target);
        if(s&&e){ l.color = mix(s,e,l.progress); need=true; }
      }
    });
    if(need) draw();
  };

  const animate = ()=>{
    const now = Date.now();
    if(now-lastGlitchTime.current>=glitchSpeed){
      glitchUpdate(); draw(); lastGlitchTime.current = now;
    }
    if(smooth) smoothColors();
    animRef.current = requestAnimationFrame(animate);
  };

  /* ---------- lifecycle ---------- */
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    ctxRef.current = canvas.getContext('2d');
    resizeCanvas(); draw(); animate();
    const onResize = ()=>{ cancelAnimationFrame(animRef.current); resizeCanvas(); draw(); animate(); };
    window.addEventListener('resize',onResize);
    return ()=>{ cancelAnimationFrame(animRef.current); window.removeEventListener('resize',onResize); };
    // eslint‑disable‑next‑line
  },[glitchSpeed,smooth]);

  /* ---------- styles ---------- */
  return(
    <div style={{position:'relative',width:'100%',height:'100%'}}>
      <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}} />
      {outerVignette && (
        <div style={{
          position:'absolute',inset:0,pointerEvents:'none',
          background:'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.9) 100%)'
        }}/>
      )}
      {centerVignette && (
        <div style={{
          position:'absolute',inset:0,pointerEvents:'none',
          background:'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)'
        }}/>
      )}
    </div>
  );
};

export default LetterGlitch; 