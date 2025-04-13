import React, { useState, useEffect } from 'react';
import { GameUIProps } from '../types';

const GameUI: React.FC<GameUIProps> = ({
  onClose,
  isStarted,
  isGameOver,
  isReady,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Handle expansion animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle close animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-all duration-300 ${
        isExpanded ? 'opacity-100' : 'opacity-0'
      } ${isClosing ? 'scale-95 opacity-0' : 'scale-100'}`}
    >
      <div 
        className={`bg-white relative rounded-lg overflow-hidden transition-all duration-500 ease-out transform ${
          isExpanded 
            ? 'scale-100 w-[95vw] h-[90vh] max-w-none max-h-none' 
            : 'scale-90 w-[600px] max-w-[95vw] h-[400px]'
        }`}
      >
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-400 active:bg-red-600 
            text-white font-bold rounded-none flex items-center justify-center 
            shadow-[4px_4px_0_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.2)] 
            active:shadow-none border-2 border-white z-20 transition-all duration-100"
          aria-label="Close game"
          style={{ imageRendering: 'pixelated' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        {/* Game content */}
        <div className="w-full h-full flex items-center justify-center relative">
          {children}
        </div>
        
        {/* Game instructions */}
        {(isReady || isStarted || isGameOver) && (
          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <div className="bg-gray-800/90 text-white py-2 px-4 inline-block rounded-lg">
              <span className="pixel-text-sm">
                {isReady ? (
                  "PRESS SPACE/CLICK TO START"
                ) : isGameOver ? (
                  "PRESS SPACE/CLICK TO PLAY AGAIN"
                ) : (
                  "SPACE/CLICK TO JUMP • ESC TO PAUSE"
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameUI;