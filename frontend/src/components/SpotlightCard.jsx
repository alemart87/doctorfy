import { useRef } from "react";
import "./SpotlightCard.css";

const SpotlightCard = ({ children, className="", spotlightColor="rgba(0,229,255,.25)" }) => {
  const ref = useRef(null);

  const handleMove = (e)=>{
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    ref.current.style.setProperty("--mouse-x", `${x}px`);
    ref.current.style.setProperty("--mouse-y", `${y}px`);
    ref.current.style.setProperty("--spotlight-color", spotlightColor);
  };

  return (
    <div ref={ref} onMouseMove={handleMove} className={`card-spotlight ${className}`}>
      {children}
    </div>
  );
};

export default SpotlightCard; 