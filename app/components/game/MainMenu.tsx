import React, { useEffect } from 'react';

interface MainMenuProps {
  onStartGame: () => void;
  highScore: number;
}

// Moved the styles outside the component to be used once
const PIXEL_STYLES = `
  @font-face {
    font-family: 'Press Start 2P';
    font-style: normal;
    font-weight: 400;
    src: url('https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2') format('woff2');
    font-display: swap;
  }
  
  .pixel-text {
    font-family: 'Press Start 2P', cursive;
    text-transform: uppercase;
    image-rendering: pixelated;
    letter-spacing: 1px;
  }
  
  .pixel-text-sm {
    font-family: 'Press Start 2P', cursive;
    font-size: 10px;
    line-height: 1.5;
    letter-spacing: 0.5px;
  }
  
  .pixel-box {
    image-rendering: pixelated;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
  }
  
  .pixel-pattern {
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
      url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVQYlWNgYGD4z4AE/lPHBQA+xA8hN1uFBwAAAABJRU5ErkJggg==");
    background-repeat: repeat;
    background-size: 8px 8px;
  }
  
  .pixel-dino {
    background-color: #333;
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20,40 h50 v40 h-10 v10 h-10 v-20 h-10 v20 h-20 z M30,50 h10 v10 h-10 z M70,60 h10 v10 h-10 z'/%3E%3C/svg%3E");
    mask-size: contain;
    mask-repeat: no-repeat;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20,40 h50 v40 h-10 v10 h-10 v-20 h-10 v20 h-20 z M30,50 h10 v10 h-10 z M70,60 h10 v10 h-10 z'/%3E%3C/svg%3E");
    -webkit-mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    image-rendering: pixelated;
  }
`;

// Keep track of how many menus are rendered to avoid duplicating styles
let pixelStylesAdded = false;

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, highScore }) => {
  // Add the pixelated styles to the document head
  useEffect(() => {
    // Ensure styles are only added once
    if (!pixelStylesAdded) {
      // Create style element for our pixel styles
      const pixelStyles = document.createElement('style');
      pixelStyles.id = 'pixel-game-styles';
      pixelStyles.innerHTML = PIXEL_STYLES;
      
      // Only add the styles if they don't already exist
      if (!document.getElementById('pixel-game-styles')) {
        document.head.appendChild(pixelStyles);
        pixelStylesAdded = true;
      }
    }
    
    // Cleanup function to remove styles when last component unmounts
    return () => {
      // Only remove if this is the last instance
      if (pixelStylesAdded) {
        const styleElement = document.getElementById('pixel-game-styles');
        if (styleElement) {
          document.head.removeChild(styleElement);
          pixelStylesAdded = false;
        }
      }
    };
  }, []);
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-500/10 to-purple-500/10 backdrop-blur-sm z-10 pixel-pattern">
      {/* Pixelated clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-24 h-12 bg-white rounded-full" style={{ boxShadow: '10px 10px 0 5px white, 18px 0px 0 8px white' }}></div>
        <div className="absolute top-[20%] right-[15%] w-28 h-14 bg-white rounded-full" style={{ boxShadow: '12px 10px 0 8px white, 24px 0px 0 10px white' }}></div>
        <div className="absolute bottom-[25%] left-[25%] w-20 h-10 bg-white rounded-full" style={{ boxShadow: '8px 8px 0 6px white, 16px 0px 0 6px white' }}></div>
      </div>
      
      <h1 className="text-5xl font-bold mb-6 text-center pixel-text">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 pixel-dino"></div>
        </div>
        DINO RUNNER
      </h1>
      
      {highScore > 0 && (
        <div className="mb-6 px-4 py-2 bg-yellow-100 border-4 border-yellow-400 pixel-box">
          <p className="text-xl font-bold text-yellow-800 pixel-text">HIGH SCORE: {highScore}</p>
        </div>
      )}
      
      <div className="flex flex-col gap-4 w-64">
        <button 
          onClick={onStartGame}
          className="bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-bold py-3 px-6 pixel-box border-b-8 border-green-700 active:border-b-4 active:translate-y-1 transition-all duration-100 flex items-center justify-center"
        >
          <span className="mr-2 text-2xl">🎮</span>
          <span className="pixel-text text-xl tracking-wide">PLAY GAME</span>
        </button>
      </div>
      
      <div className="mt-8 text-gray-700 max-w-xs text-center pixel-text-sm">
        <p>PRESS SPACE OR CLICK TO JUMP</p>
      </div>
      
      {/* Add some pixel art ground */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-neutral-800"></div>
    </div>
  );
};

export default MainMenu;
