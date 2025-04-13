import React from 'react';
import { MainMenuProps } from '../types';

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, highScore }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#181425] z-10 overflow-hidden" style={{ imageRendering: 'pixelated' }}>
      {/* Pixel art clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="pixel-cloud absolute top-[10%] left-[5%] w-16 h-8 bg-white/20" 
             style={{ clipPath: 'polygon(0% 50%, 12.5% 50%, 12.5% 25%, 25% 25%, 25% 0%, 75% 0%, 75% 25%, 87.5% 25%, 87.5% 50%, 100% 50%, 100% 100%, 0% 100%)' }}></div>
        <div className="pixel-cloud absolute top-[15%] right-[15%] w-20 h-10 bg-white/20"
             style={{ clipPath: 'polygon(0% 50%, 10% 50%, 10% 30%, 20% 30%, 20% 10%, 80% 10%, 80% 30%, 90% 30%, 90% 50%, 100% 50%, 100% 100%, 0% 100%)' }}></div>
        <div className="pixel-cloud absolute bottom-[20%] left-[20%] w-12 h-6 bg-white/20"
             style={{ clipPath: 'polygon(0% 50%, 16% 50%, 16% 16%, 33% 16%, 33% 0%, 66% 0%, 66% 16%, 83% 16%, 83% 50%, 100% 50%, 100% 100%, 0% 100%)' }}></div>
      </div>
      
      {/* Pixel art ground */}
      <div className="absolute bottom-0 w-full h-[60px] bg-[#7AA953]" 
           style={{ borderTop: '4px solid #5C8344' }}></div>
      
      {/* Title with pixel art styling */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-5xl font-bold text-white mb-4 tracking-wider" style={{ fontFamily: 'Press Start 2P, monospace', textShadow: '4px 4px 0 #000' }}>
          <div className="mb-8 transform hover:scale-105 transition-transform duration-200">
            {/* Pixel art dino */}
            <div className="w-24 h-24 mx-auto relative">
              <img 
                src="/game/sprites/dinoRun1.png" 
                alt="Dino" 
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated', transform: 'scale(3)', filter: 'drop-shadow(2px 2px 0 #000)' }}
              />
            </div>
          </div>
          <span className="inline-block px-6 py-3 bg-[#8b2f97]/80 rounded-lg border-4 border-[#5e1b68] border-t-[#a44baf] border-l-[#a44baf]">
            DINO RUNNER
          </span>
        </h1>
        <p className="text-[#f8cd75] text-lg font-pixel mt-4" style={{ textShadow: '2px 2px 0 #000' }}>Jump and dodge obstacles!</p>
      </div>
      
      {/* High Score - pixel art style */}
      {highScore > 0 && (
        <div className="mb-8 transform hover:scale-105 transition-all duration-200">
          <div className="bg-[#332e58] border-4 border-b-[#221e40] border-r-[#221e40] border-t-[#4f4580] border-l-[#4f4580] px-6 py-3 rounded-none">
            <p className="text-[#ffcb54] font-bold text-xl" style={{ fontFamily: 'Press Start 2P, monospace', textShadow: '2px 2px 0 #000', letterSpacing: '1px' }}>
              HIGH SCORE: {highScore}
            </p>
          </div>
        </div>
      )}
      
      {/* Play Button - pixel art style */}
      <button 
        onClick={onStartGame}
        className="group relative bg-[#43b049] hover:bg-[#4cc254] active:bg-[#328c39] 
          px-8 py-4 rounded-none transform hover:scale-105 active:translate-y-1
          transition-all duration-100 border-4 border-b-[#328c39] border-r-[#328c39] border-t-[#5ac561] border-l-[#5ac561]"
        style={{ boxShadow: '4px 4px 0 #000' }}
      >
        <div className="flex items-center space-x-3">
          <img 
            src="/game/sprites/dinoRun2.png" 
            alt="Dino" 
            className="w-8 h-8 object-contain group-hover:animate-bounce"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-white font-bold text-xl" style={{ fontFamily: 'Press Start 2P, monospace', letterSpacing: '1px', textShadow: '2px 2px 0 #000' }}>
            PLAY NOW
          </span>
        </div>
      </button>
      
      {/* Instructions - pixel art style */}
      <div className="mt-12 text-[#b3aedc] text-center px-4 py-3 bg-black/30 border-2 border-[#4a4173]">
        <p className="mb-2" style={{ fontFamily: 'VT323, monospace', fontSize: '1.2rem' }}>
          <span className="text-[#f8cd75]">SPACE</span> or <span className="text-[#f8cd75]">CLICK</span> to jump
        </p>
        <p style={{ fontFamily: 'VT323, monospace', fontSize: '1.2rem' }}>
          Press <span className="text-[#f8cd75]">ESC</span> to pause the game
        </p>
      </div>

      {/* Additional pixel art decorations */}
      <div className="absolute bottom-[60px] left-[10%] w-12 h-16" style={{ imageRendering: 'pixelated' }}>
        <img 
          src="/game/sprites/obstacleLarge.png" 
          alt="Cactus" 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="absolute bottom-[60px] right-[15%] w-8 h-12" style={{ imageRendering: 'pixelated' }}>
        <img 
          src="/game/sprites/obstacleSmall.png" 
          alt="Small Cactus" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default MainMenu;