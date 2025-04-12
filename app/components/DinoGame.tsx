import React, { useRef, useState, useEffect } from 'react';
import GameUI from './game/GameUI';
import MainMenu from './game/MainMenu';
import Canvas2DGame from './game/Canvas2DGame';

interface DinoGameProps {
  onClose: () => void;
}

const DinoGame: React.FC<DinoGameProps> = ({ onClose }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'ready' | 'playing' | 'over'>('menu');
  const [gameScore, setGameScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Load high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('dinoGameHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);
  
  // Start game from menu
  const startGame = () => {
    setGameState('ready');
  };
  
  // Handle game over
  const handleGameOver = (score: number) => {
    setGameState('over');
    setGameScore(score);
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('dinoGameHighScore', score.toString());
    }
  };
  
  // Convert gameState to the props needed by GameUI
  const isStarted = gameState === 'playing';
  const isGameOver = gameState === 'over';
  const isReady = gameState === 'ready';
  const isMenu = gameState === 'menu';
  
  // Handle Canvas2DGame active state
  const isGameActive = gameState === 'ready' || gameState === 'playing' || gameState === 'over';

  // Handle escape key for closing the game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only close with Escape if we're in the menu or if we pressed Escape twice
      if (e.code === 'Escape' && isMenu) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, isMenu]);

  return (
    <GameUI 
      onClose={onClose} 
      isStarted={isStarted} 
      isGameOver={isGameOver} 
      isReady={isReady}
    >
      {isMenu && (
        <MainMenu 
          onStartGame={startGame} 
          highScore={highScore}
        />
      )}
      
      <div 
        ref={gameContainerRef} 
        className={`w-full h-full flex items-center justify-center ${isMenu ? 'opacity-0' : 'opacity-100'}`}
        style={{ position: 'relative' }}
      >
        {/* Score display */}
        {isStarted && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-gray-800/70 text-white py-1 px-3 rounded-lg pixel-box">
              <span className="pixel-text">SCORE: {gameScore}</span>
            </div>
          </div>
        )}
        
        {/* 2D Canvas Game (more reliable than WebGL) */}
        <Canvas2DGame 
          isActive={isGameActive}
          onGameOver={handleGameOver}
        />
      </div>
    </GameUI>
  );
};

export default DinoGame;
