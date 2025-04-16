import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./GlassIcons.css";

const gradientMapping = {
  blue: "linear-gradient(hsl(223, 90%, 50%), hsl(208, 90%, 50%))",
  purple: "linear-gradient(hsl(283, 90%, 50%), hsl(268, 90%, 50%))",
  red: "linear-gradient(hsl(3, 90%, 50%), hsl(348, 90%, 50%))",
  indigo: "linear-gradient(hsl(253, 90%, 50%), hsl(238, 90%, 50%))",
  orange: "linear-gradient(hsl(43, 90%, 50%), hsl(28, 90%, 50%))",
  green: "linear-gradient(hsl(123, 90%, 40%), hsl(108, 90%, 40%))",
  cyan: "linear-gradient(hsl(183, 90%, 50%), hsl(168, 90%, 50%))",
  pink: "linear-gradient(hsl(323, 90%, 50%), hsl(308, 90%, 50%))",
};

const GlassIcons = ({ items = [], className = "" }) => {
  const navigate = useNavigate();

  const getBackgroundStyle = (color) => {
    if (gradientMapping[color]) {
      return { background: gradientMapping[color] };
    }
    return { background: color || 'grey' }; // Default color if none provided
  };

  const handleClick = (href) => {
    if (href) {
      navigate(href);
    }
  };

  return (
    <div className={`icon-btns ${className}`}>
      {items.map((item, index) => (
        <button
          key={index}
          className={`icon-btn ${item.customClass || ""}`}
          aria-label={item.label}
          type="button"
          onClick={() => handleClick(item.href)} // Añadido onClick
          disabled={!item.href} // Deshabilitar si no hay href
        >
          <span
            className="icon-btn__back"
            style={getBackgroundStyle(item.color)}
          ></span>
          <span className="icon-btn__front">
            <span className="icon-btn__icon" aria-hidden="true">
              {item.icon || '?'} {/* Default icon if none provided */}
            </span>
          </span>
          <span className="icon-btn__label">{item.label || 'No Label'}</span>
        </button>
      ))}
    </div>
  );
};

export default GlassIcons; 