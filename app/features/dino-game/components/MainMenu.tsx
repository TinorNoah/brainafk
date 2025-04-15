import React, { useState, useEffect } from 'react';
import { MainMenuProps } from '../types';
import { DINO_CHARACTERS, DinoCharacterType } from '../config/constants';

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, highScore, onCharacterSelect, selectedCharacter }) => {
  // Add a simple animation effect for the dino character
  const [bounce, setBounce] = useState(false);
  
  useEffect(() => {
    // Create bouncing animation for the dino
    const interval = setInterval(() => {
      setBounce(prev => !prev);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden" 
         style={{ 
           imageRendering: 'pixelated',
           background: 'radial-gradient(circle at center, #282448 0%, #181425 70%)'
         }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stars */}
        <div className="absolute w-2 h-2 bg-white rounded-full opacity-75 top-[10%] left-[20%] animate-pulse"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-50 top-[15%] left-[70%] animate-pulse" 
             style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute w-2 h-2 bg-white rounded-full opacity-75 top-[80%] left-[85%] animate-pulse"
             style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-50 top-[30%] left-[10%] animate-pulse"
             style={{ animationDelay: '0.7s' }}></div>
        
        {/* Pixel art clouds */}
        <div className="pixel-cloud absolute top-[10%] left-[5%] w-16 h-8 bg-white/20" 
             style={{ clipPath: 'polygon(0% 50%, 12.5% 50%, 12.5% 25%, 25% 25%, 25% 0%, 75% 0%, 75% 25%, 87.5% 25%, 87.5% 50%, 100% 50%, 100% 100%, 0% 100%)' }}></div>
        <div className="pixel-cloud absolute top-[15%] right-[15%] w-20 h-10 bg-white/20"
             style={{ clipPath: 'polygon(0% 50%, 10% 50%, 10% 30%, 20% 30%, 20% 10%, 80% 10%, 80% 30%, 90% 30%, 90% 50%, 100% 50%, 100% 100%, 0% 100%)' }}></div>
        <div className="pixel-cloud absolute bottom-[20%] left-[20%] w-12 h-6 bg-white/20"
             style={{ clipPath: 'polygon(0% 50%, 16% 50%, 16% 16%, 33% 16%, 33% 0%, 66% 0%, 66% 16%, 83% 16%, 83% 50%, 100% 50%, 100% 100%, 0% 100%)' }}></div>
      </div>
      
      {/* Pixel art ground with extra details */}
      <div className="absolute bottom-0 w-full h-[60px]">
        {/* Add slight gradient to ground */}
        <div className="absolute bottom-0 w-full h-[60px] bg-gradient-to-b from-[#8eb85f] to-[#7AA953]"></div>
        <div className="absolute bottom-0 w-full h-[4px] bg-[#5C8344]"></div>
        
        {/* Add some grass details */}
        <div className="absolute bottom-[60px] left-[10%] w-[8px] h-[10px] bg-[#a0cf6c]"
             style={{ clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }}></div>
        <div className="absolute bottom-[60px] left-[25%] w-[6px] h-[8px] bg-[#a0cf6c]"
             style={{ clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }}></div>
        <div className="absolute bottom-[60px] left-[56%] w-[8px] h-[10px] bg-[#a0cf6c]"
             style={{ clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }}></div>
        <div className="absolute bottom-[60px] left-[78%] w-[6px] h-[8px] bg-[#a0cf6c]"
             style={{ clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }}></div>
      </div>
      
      {/* Title with enhanced pixel art styling */}
      <div className="text-center mb-10 relative z-10">
        <div className={`mb-10 transform transition-all duration-700 ease-in-out ${bounce ? 'translate-y-[-10px]' : 'translate-y-[0px]'}`}>
          {/* Larger dino character with enhanced animation */}
          <div className="w-32 h-32 mx-auto relative">
            <img 
              src={`/game/sprites/dino-characters/DinoSprites_${selectedCharacter}.gif`}
              alt="Dino" 
              className="w-full h-full object-contain"
              style={{ 
                imageRendering: 'pixelated', 
                transform: 'scale(2.5)',
                filter: 'drop-shadow(3px 3px 2px rgba(0,0,0,0.5))'
              }}
            />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-wider relative" 
            style={{ 
              fontFamily: 'Press Start 2P, monospace', 
              textShadow: '4px 4px 0 #000, -2px -2px 0 #8b2f97, 2px 2px 0 #8b2f97' 
            }}>
          <span className="inline-block px-8 py-4 bg-gradient-to-r from-[#8b2f97] to-[#a44baf] rounded-lg border-4 border-[#5e1b68] border-t-[#a44baf] border-l-[#a44baf]">
            DINO RUNNER
          </span>
        </h1>
        <p className="text-[#f8cd75] text-xl font-pixel mt-4" 
           style={{ 
             textShadow: '2px 2px 0 #000', 
             fontFamily: 'VT323, monospace',
             letterSpacing: '1px' 
           }}>
          Jump and dodge obstacles!
        </p>
      </div>
      
      {/* Enhanced Character Selection */}
      <div className="mb-8 bg-[#332e58]/90 backdrop-blur-sm border-4 border-b-[#221e40] border-r-[#221e40] border-t-[#4f4580] border-l-[#4f4580] p-5 rounded-lg max-w-md">
        <h2 className="text-white font-bold mb-4 text-center" 
            style={{ 
              fontFamily: 'Press Start 2P, monospace', 
              textShadow: '2px 2px 0 #000', 
              letterSpacing: '1px', 
              fontSize: '1.1rem' 
            }}>
          SELECT CHARACTER
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.values(DINO_CHARACTERS).map(character => (
            <button 
              key={character}
              onClick={() => onCharacterSelect(character as DinoCharacterType)}
              className={`p-3 rounded-lg transition-all duration-300 ${
                selectedCharacter === character 
                  ? 'bg-gradient-to-br from-[#8b2f97] to-[#4f4580] border-2 border-[#c04bd1] scale-110 shadow-lg shadow-purple-900/50' 
                  : 'bg-[#221e40] hover:bg-[#2d2851] border-2 border-[#332e58] hover:border-[#4f4580]'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                  {/* Using animated GIFs with enhanced styling */}
                  <div className={selectedCharacter === character ? 'animate-pulse-subtle' : ''}>
                    <img 
                      src={`/game/sprites/dino-characters/DinoSprites_${character}.gif`}
                      alt={`Character ${character}`}
                      className="object-contain"
                      style={{ 
                        imageRendering: 'pixelated',
                        transform: 'scale(1.8)',
                        width: '100%',
                        height: 'auto'
                      }}
                    />
                  </div>
                </div>
                <span className={`text-xs font-bold uppercase mt-2 tracking-wider ${
                  selectedCharacter === character ? 'text-[#f8cd75]' : 'text-white'
                }`}>
                  {character}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced High Score display */}
      {highScore > 0 && (
        <div className="mb-6 transform hover:scale-105 transition-all duration-300">
          <div className="bg-gradient-to-r from-[#332e58] to-[#4f4580] border-4 border-b-[#221e40] border-r-[#221e40] border-t-[#4f4580] border-l-[#4f4580] px-8 py-4 rounded-lg relative overflow-hidden">
            {/* Trophy icon */}
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl text-[#ffcb54]">🏆</span>
            <p className="text-[#ffcb54] font-bold text-xl ml-7" 
               style={{ 
                 fontFamily: 'Press Start 2P, monospace', 
                 textShadow: '2px 2px 0 #000', 
                 letterSpacing: '1px' 
               }}>
              HIGH SCORE: <span className="text-[#ffea94]">{highScore}</span>
            </p>
            {/* Add subtle shine animation */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
              <div className="absolute top-0 -left-full w-[50%] h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-[45deg] animate-shine"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Play Button */}
      <button 
        onClick={onStartGame}
        className="group relative bg-gradient-to-r from-[#43b049] to-[#5ac561] hover:from-[#4cc254] hover:to-[#68d470] active:from-[#328c39] active:to-[#43b049]
          px-10 py-5 rounded-lg transform hover:scale-105 active:translate-y-1
          transition-all duration-200 border-4 border-b-[#328c39] border-r-[#328c39] border-t-[#5ac561] border-l-[#5ac561] mt-2"
        style={{ boxShadow: '0 8px 0 #276e2c, 0 15px 20px rgba(0, 0, 0, .35)' }}
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src={`/game/sprites/dino-characters/DinoSprites_${selectedCharacter}.gif`}
              alt="Dino" 
              className="w-10 h-10 object-contain group-hover:animate-bounce"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <span className="text-white font-bold text-2xl" 
                style={{ 
                  fontFamily: 'Press Start 2P, monospace', 
                  letterSpacing: '1px', 
                  textShadow: '2px 2px 0 #1e5922'
                }}>
            PLAY NOW
          </span>
        </div>
        
        {/* Play button highlight effect */}
        <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
      </button>
      
      {/* Enhanced Instructions */}
      <div className="mt-8 text-center px-5 py-4 bg-black/40 backdrop-blur-sm border-2 border-[#4a4173] rounded-lg max-w-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#332e58]/60 p-3 rounded-md flex flex-col items-center">
            <div className="inline-block px-3 py-1 bg-[#4a4173] rounded-md mb-2">
              <span className="text-[#f8cd75] font-bold" style={{ fontFamily: 'VT323, monospace', fontSize: '1.2rem' }}>
                SPACE
              </span>
            </div>
            <p className="text-white" style={{ fontFamily: 'VT323, monospace', fontSize: '1.2rem' }}>to jump</p>
          </div>
          <div className="bg-[#332e58]/60 p-3 rounded-md flex flex-col items-center">
            <div className="inline-block px-3 py-1 bg-[#4a4173] rounded-md mb-2">
              <span className="text-[#f8cd75] font-bold" style={{ fontFamily: 'VT323, monospace', fontSize: '1.2rem' }}>
                DOWN
              </span>
            </div>
            <p className="text-white" style={{ fontFamily: 'VT323, monospace', fontSize: '1.2rem' }}>to crouch</p>
          </div>
          <div className="bg-[#332e58]/60 p-3 rounded-md flex flex-col items-center">
            <div className="inline-block px-3 py-1 bg-[#4a4173] rounded-md mb-2">
              <span className="text-[#f8cd75] font-bold" style={{ fontFamily: 'VT323, monospace', fontSize: '1.2rem' }}>
                ESC
              </span>
            </div>
            <p className="text-white" style={{ fontFamily: 'VT323, monospace', fontSize: '1.2rem' }}>to pause</p>
          </div>
        </div>
      </div>

      {/* Improved obstacle decorations */}
      <div className="absolute bottom-[60px] left-[5%] w-16 h-20" style={{ imageRendering: 'pixelated' }}>
        <img 
          src="/game/sprites/Cactus_Sprite_Sheet.png" 
          alt="Cactus" 
          className="w-full h-full object-cover"
          style={{
            objectFit: 'none',
            objectPosition: '0 0',
            width: '100%',
            height: '100%'
          }}
        />
      </div>
      <div className="absolute bottom-[60px] right-[5%] w-16 h-20" style={{ imageRendering: 'pixelated' }}>
        <img 
          src="/game/sprites/Cactus_Sprite_Sheet.png" 
          alt="Cactus" 
          className="w-full h-full object-cover"
          style={{
            objectFit: 'none',
            objectPosition: '-96px 0', /* Show the third cactus type */
            width: '100%',
            height: '100%'
          }}
        />
      </div>
    </div>
  );
};

export default MainMenu;