import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GameCanvasProps, GameEngineState } from '../types';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameInput } from '../hooks/useGameInput';
import { loadImage } from '../utils';
import { SPRITE_PATHS, DINO_CHARACTERS, DinoCharacterType } from '../config/constants';
import * as GameEngine from '../core/game';
import { drawGame } from '../core/rendering';

const GameCanvas: React.FC<GameCanvasProps> = ({ isActive, onGameOver, onScoreUpdate, selectedCharacter = DINO_CHARACTERS.DOUX }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [gameState, setGameState] = useState<GameEngineState>(() => {
    const initialState = GameEngine.createInitialGameState(selectedCharacter as DinoCharacterType);
    return initialState;
  });
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const spritesRef = useRef<Record<string, HTMLImageElement>>({});
  
  // Update character if it changes
  useEffect(() => {
    if (selectedCharacter !== gameState.dino.character) {
      setGameState((prevState: GameEngineState) => 
        GameEngine.changeCharacter(prevState, selectedCharacter as DinoCharacterType)
      );
    }
  }, [selectedCharacter, gameState.dino.character]);

  // Game Actions - memoize callbacks for better performance
  const handleStart = useCallback(() => {
    setGameState((prev: GameEngineState) => GameEngine.startGame(prev));
  }, []);

  const handleReset = useCallback(() => {
    setGameState((prev: GameEngineState) => GameEngine.resetGame(prev));
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  const handleJump = useCallback(() => {
    setGameState((prev: GameEngineState) => GameEngine.triggerJump(prev));
  }, []);

  const handleTogglePause = useCallback(() => {
    setGameState((prev: GameEngineState) => GameEngine.togglePause(prev));
  }, []);

  const handleCrouch = useCallback((isCrouching: boolean) => {
    setGameState((prev: GameEngineState) => GameEngine.toggleCrouch(prev, isCrouching));
  }, []);

  // Game Loop Update with optimizations
  const update = useCallback((deltaTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get context once and store it
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: false }); // alpha: false is faster
    }
    
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    const scaledWidth = canvas.width / (window.devicePixelRatio || 1);

    // Performance optimization: limit state updates
    // Skip update if deltaTime is too large (prevents big jumps after tab becomes active again)
    if (deltaTime > 0.1) deltaTime = 0.016; // Cap to a reasonable value (~60 FPS)
    
    // Only update game state if not paused (deltaTime > 0)
    if (deltaTime > 0 && gameState.status === 'playing') {
      setGameState((prev: GameEngineState) => {
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
    drawGame(ctx, canvas, gameState, spritesRef.current);
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
    onCrouch: handleCrouch,
  });

  // Canvas setup useEffect with proper dependencies and cleanup
  useEffect(() => {
    // Load sprites with performance optimizations
    const spritesToLoad = [
      { key: 'dinoRun1', path: SPRITE_PATHS.dinoRun1 },
      { key: 'dinoRun2', path: SPRITE_PATHS.dinoRun2 },
      { key: 'dinoJump', path: SPRITE_PATHS.dinoJump },
      { key: 'obstacleSmall', path: SPRITE_PATHS.obstacleSmall },
      { key: 'obstacleLarge', path: SPRITE_PATHS.obstacleLarge },
      { key: 'dinoSheetDoux', path: SPRITE_PATHS.dinoSheetDoux },
      { key: 'dinoSheetMort', path: SPRITE_PATHS.dinoSheetMort },
      { key: 'dinoSheetTard', path: SPRITE_PATHS.dinoSheetTard },
      { key: 'dinoSheetVita', path: SPRITE_PATHS.dinoSheetVita },
      { key: 'cactusSheet', path: SPRITE_PATHS.cactusSheet },
    ];
    
    Promise.all(
      spritesToLoad.map(sprite => 
        loadImage(sprite.path).then(img => {
          spritesRef.current[sprite.key] = img;
          return { key: sprite.key, success: true };
        }).catch(() => {
          console.warn(`Failed to load sprite: ${sprite.key}`);
          return { key: sprite.key, success: false };
        })
      )
    )
    .then(results => {
      const loadedSprites = results.filter(r => r.success).map(r => r.key);
      console.log("Loaded sprites:", loadedSprites.join(', '));
      setSpritesLoaded(true);
      setGameState((prev: GameEngineState) => ({ ...prev, spritesLoaded: true }));
    });

    // Canvas setup with proper DPI handling
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle resize with debounce
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const parent = canvas.parentElement;
        if (!parent) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();

        // Set canvas dimensions properly for crisp rendering
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        // Reset context reference to get fresh context with new dimensions
        ctxRef.current = null;

        setGameState((prev: GameEngineState) => {
          const newState = { ...prev };
          GameEngine.setGround(newState, rect.height);
          return newState;
        });
      }, 100); // 100ms debounce
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Optimize for mobile: prevent zoom on double-tap
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Reset game state when becoming active
  useEffect(() => {
    if (isActive && spritesLoaded) {
      setGameState((prev: GameEngineState) => {
        // Keep the selected character when resetting
        const newState = GameEngine.resetGame(prev);
        return GameEngine.changeCharacter(newState, selectedCharacter as DinoCharacterType);
      });
      onScoreUpdate(0);
    }
  }, [isActive, spritesLoaded, onScoreUpdate, selectedCharacter]);

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
        touchAction: 'manipulation', // Improves touch response
      }}
    />
  );
};

// Prevent unnecessary re-renders
export default React.memo(GameCanvas);