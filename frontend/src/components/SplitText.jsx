import { useSprings, animated } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';

/**
 * Animación de texto letra‑por‑letra.
 *  – Props más usadas: text, className, delay, animationFrom, animationTo
 */
const SplitText = ({
  text = '',
  className = '',
  delay = 100,
  animationFrom = { opacity: 0, transform: 'translate3d(0,40px,0)' },
  animationTo   = { opacity: 1, transform: 'translate3d(0,0,0)' },
  easing = 'easeOutCubic',
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
}) => {

  const words  = text.split(' ').map(w => w.split(''));
  const letters = words.flat();

  const [inView,setInView]     = useState(false);
  const ref                    = useRef(null);
  const animatedCount          = useRef(0);

  /* IntersectionObserver para disparar la animación */
  useEffect(()=>{
    const obs = new IntersectionObserver(
      ([entry])=>{
        if(entry.isIntersecting){
          setInView(true);
          obs.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );
    obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[threshold, rootMargin]);

  const springs = useSprings(
    letters.length,
    letters.map((_,i)=>({
      from: animationFrom,
      to  : inView
        ? async (next)=>{
            await next(animationTo);
            animatedCount.current += 1;
            if(animatedCount.current===letters.length && onLetterAnimationComplete){
              onLetterAnimationComplete();
            }
          }
        : animationFrom,
      delay: i*delay,
      config:{ easing }
    }))
  );

  /* Render */
  return (
    <p
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        textAlign,
        overflow:'hidden',
        display:'inline',
        whiteSpace:'normal',
        wordWrap:'break-word'
      }}
    >
      {words.map((word,wi)=>(
        <span key={wi} style={{display:'inline-block',whiteSpace:'nowrap'}}>
          {word.map((letter,li)=>{
            const idx = words.slice(0,wi).reduce((acc,w)=>acc+w.length,0)+li;
            return (
              <animated.span
                key={idx}
                style={{...springs[idx],display:'inline-block',willChange:'transform,opacity'}}
              >
                {letter}
              </animated.span>
            );
          })}
          {/* espacio entre palabras */}
          <span style={{display:'inline-block',width:'0.3em'}}>&nbsp;</span>
        </span>
      ))}
    </p>
  );
};

export default SplitText; 