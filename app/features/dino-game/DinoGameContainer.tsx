import React, { useRef, useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import MainMenu from './components/MainMenu';
import { preloadSounds } from './utils';

interface DinoGameContainerProps {
  onClose: () => void;
}

type GameState = 'menu' | 'playing' | 'over';

const DinoGameContainer: React.FC<DinoGameContainerProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Load high score on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('dinoGameHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    // Preload game sounds
    preloadSounds();
  }, []);

  // Handle game state changes
  const handleGameOver = (finalScore: number) => {
    setGameState('over');
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('dinoGameHighScore', finalScore.toString());
    }
  };

  const handleStartGame = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setGameState('playing');
      setScore(0);
      setIsTransitioning(false);
    }, 300);
  };

  const handleCloseGame = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const isPlaying = gameState === 'playing';
  const isGameOver = gameState === 'over';

  return (
    <GameUI
      onClose={handleCloseGame}
      isStarted={isPlaying}
      isGameOver={isGameOver}
      isReady={gameState === 'menu'}
    >
      {gameState === 'menu' ? (
        <MainMenu onStartGame={handleStartGame} highScore={highScore} />
      ) : (
        <div 
          ref={gameContainerRef}
          className={`w-full h-full relative transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Score display */}
          {isPlaying && (
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="bg-black/70 text-white py-1 px-3 rounded">
                <span className="font-mono text-lg">Score: {Math.floor(score)}</span>
              </div>
            </div>
          )}

          <GameCanvas
            isActive={Boolean(gameState === 'playing' || gameState === 'over')}
            onGameOver={handleGameOver}
            onScoreUpdate={setScore}
          />
        </div>
      )}
    </GameUI>
  );
};

export default DinoGameContainer;