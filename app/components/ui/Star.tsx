import React from 'react';

interface StarProps {
  size: number;
  top: string;
  left: string;
  delay: string;
}

/**
 * A simple animated star component for the background
 */
const Star: React.FC<StarProps> = ({ size, top, left, delay }) => (
  <div 
    className="absolute rounded-full bg-white animate-twinkle"
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      top, 
      left, 
      animationDelay: delay,
      opacity: Math.random() * 0.7 + 0.3
    }}
  />
);

export default Star;