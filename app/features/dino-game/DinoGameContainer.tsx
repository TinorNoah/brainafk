import React, { useRef, useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import MainMenu from './components/MainMenu';
import { preloadSounds } from './utils';
import { DINO_CHARACTERS, DinoCharacterType } from './config/constants';

interface DinoGameContainerProps {
  onClose: () => void;
}

type GameState = 'menu' | 'playing' | 'over';

const DinoGameContainer: React.FC<DinoGameContainerProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<DinoCharacterType>(DINO_CHARACTERS.DOUX); // Default character
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Load high score on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('dinoGameHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    // Load selected character from localStorage if available
    const savedCharacter = localStorage.getItem('dinoGameCharacter') as DinoCharacterType | null;
    if (savedCharacter && Object.values(DINO_CHARACTERS).includes(savedCharacter)) {
      setSelectedCharacter(savedCharacter as DinoCharacterType);
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
  
  const handleCharacterSelect = (character: DinoCharacterType) => {
    setSelectedCharacter(character);
    localStorage.setItem('dinoGameCharacter', character);
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
        <MainMenu 
          onStartGame={handleStartGame} 
          highScore={highScore} 
          onCharacterSelect={handleCharacterSelect}
          selectedCharacter={selectedCharacter}
        />
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
            selectedCharacter={selectedCharacter}
          />
        </div>
      )}
    </GameUI>
  );
};

export default DinoGameContainer;