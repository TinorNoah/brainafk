import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GameCanvasProps } from '../types';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameInput } from '../hooks/useGameInput';
import { loadImage } from '../utils';
import { SPRITE_PATHS } from '../config/constants';
import * as GameEngine from '../core/game';
import { drawGame } from '../core/rendering';

interface Sprites {
  dinoRun1?: HTMLImageElement;
  dinoRun2?: HTMLImageElement;
  dinoJump?: HTMLImageElement;
  obstacleSmall?: HTMLImageElement;
  obstacleLarge?: HTMLImageElement;
  cloud?: HTMLImageElement;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ isActive, onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameEngine.GameEngineState>(GameEngine.createInitialGameState());
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const spritesRef = useRef<Sprites>({});

  // Game Actions
  const handleStart = useCallback(() => {
    setGameState((prev) => GameEngine.startGame(prev));
  }, []);

  const handleReset = useCallback(() => {
    setGameState((prev) => GameEngine.resetGame(prev));
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  const handleJump = useCallback(() => {
    setGameState((prev) => GameEngine.triggerJump(prev));
  }, []);

  const handleTogglePause = useCallback(() => {
    setGameState((prev) => GameEngine.togglePause(prev));
  }, []);

  // Game Loop Update
  const update = useCallback((deltaTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const scaledWidth = canvas.width / (window.devicePixelRatio || 1);

    // Only update game state if not paused (deltaTime > 0)
    if (deltaTime > 0) {
      setGameState((prev) => {
        const newState = GameEngine.updateGame(prev, deltaTime, scaledWidth);

        // Handle score updates and game over
        if (Math.floor(newState.score) !== Math.floor(prev.score)) {
          onScoreUpdate(Math.floor(newState.score));
        }
        if (newState.status === 'over' && prev.status !== 'over') {
          onGameOver(Math.floor(newState.score));
        }
        return newState;
      });
    }

    // Always render, even when paused
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawGame(ctx, canvas, gameState, spritesRef.current);
    }
  }, [gameState, onGameOver, onScoreUpdate]);

  // Game loop hook
  useGameLoop({
    onUpdate: update,
    isActive: isActive,
    isPaused: gameState.status === 'paused',
    isGameOver: gameState.status === 'over',
  });

  // Input handling
  useGameInput({
    canvasRef,
    gameState: {
      isActive: isActive,
      isStarted: gameState.status === 'playing' || gameState.status === 'paused',
      isGameOver: gameState.status === 'over',
    },
    isPaused: gameState.status === 'paused',
    onJump: handleJump,
    onStart: handleStart,
    onReset: handleReset,
    onTogglePause: handleTogglePause,
  });

  // Canvas setup useEffect with proper dependencies and cleanup
  useEffect(() => {
    // Load sprites
    const spritePromises = [
      loadImage(SPRITE_PATHS.dinoRun1).then(img => spritesRef.current.dinoRun1 = img),
      loadImage(SPRITE_PATHS.dinoRun2).then(img => spritesRef.current.dinoRun2 = img),
      loadImage(SPRITE_PATHS.dinoJump).then(img => spritesRef.current.dinoJump = img),
      loadImage(SPRITE_PATHS.obstacleSmall).then(img => spritesRef.current.obstacleSmall = img),
      loadImage(SPRITE_PATHS.obstacleLarge).then(img => spritesRef.current.obstacleLarge = img),
    ];

    Promise.all(spritePromises)
      .then(() => {
        setSpritesLoaded(true);
        setGameState(prev => ({ ...prev, spritesLoaded: true }));
      })
      .catch(error => {
        console.error("Failed to load sprites:", error);
        setSpritesLoaded(true); // Continue without sprites
        setGameState(prev => ({ ...prev, spritesLoaded: true }));
      });

    // Canvas setup
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      setGameState(prev => {
        const newState = { ...prev };
        GameEngine.setGround(newState, rect.height);
        return newState;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setGameState]); // Add setGameState as dependency since it's used in the effect

  // Reset game state when becoming active
  useEffect(() => {
    if (isActive && spritesLoaded) {
      setGameState(prev => GameEngine.resetGame(prev));
      onScoreUpdate(0);
    }
  }, [isActive, spritesLoaded, onScoreUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full outline-none"
      tabIndex={0}
      style={{
        opacity: spritesLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s',
        backgroundColor: '#97C4FF',
        imageRendering: 'pixelated',
      }}
    />
  );
};

export default GameCanvas;