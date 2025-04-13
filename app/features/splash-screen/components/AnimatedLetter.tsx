import React from 'react';

interface AnimatedLetterProps {
  letter: string;
  delay: string;
  stage: 'entering' | 'exiting';
}

/**
 * A single animated letter for the splash screen
 * Uses CSS animations based on the current animation stage
 */
const AnimatedLetter: React.FC<AnimatedLetterProps> = ({ letter, delay, stage }) => {
  // Determine the animation class based on the stage
  const className = stage === 'entering' ? 'fall-from-top' : 'fall-down';
  
  // Style object with the CSS variable for animation delay
  const style = { 
    '--delay': delay
  } as React.CSSProperties;
  
  return (
    <span 
      className={className}
      style={style}
      data-text={letter}
    >
      {letter}
    </span>
  );
};

export default AnimatedLetter;