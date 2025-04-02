import { useState, useRef, useEffect, useCallback } from 'react';
import { GameObject, GameState, GameRefs } from './types';

const useGameEngine = (onClose: () => void) => {
  const [gameState, setGameState] = useState<GameState>({
    isActive: true,
    isStarted: false,
    isGameOver: false,
    score: 0,
    groundY: 0,
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  
  // Game state references that don't need to trigger re-renders
  const gameRefs = useRef<GameRefs>({
    dino: { x: 50, y: 0, width: 40, height: 60 },
    obstacles: [],
    jumping: false,
    gravity: 0.6,
    velocityY: 0,
    gameSpeed: 5,
    lastObstacleTime: 0
  });
  
  // Reset the game to initial state
  const resetGame = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const groundY = canvas.height - 50;
    
    gameRefs.current = {
      ...gameRefs.current,
      dino: { x: 50, y: groundY, width: 40, height: 60 },
      obstacles: [],
      jumping: false,
      velocityY: 0,
      gameSpeed: 5,
      lastObstacleTime: 0
    };
    
    setGameState(prev => ({
      ...prev,
      isActive: true,
      isGameOver: false,
      score: 0,
      groundY
    }));
    
    if (animationFrameId.current === null) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
  }, []);
  
  // Start the game
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isStarted: true
    }));
    resetGame();
  }, [resetGame]);
  
  // Handle jumping
  const jump = useCallback(() => {
    if (!gameRefs.current.jumping) {
      gameRefs.current.jumping = true;
      gameRefs.current.velocityY = -12;
    }
  }, []);
  
  // Handle input
  const handleInput = useCallback((type: 'click' | 'key', key?: string) => {
    const { isStarted, isGameOver } = gameState;
    
    // Handle game start
    if (!isStarted) {
      startGame();
      return;
    }
    
    // Handle jumping or restarting
    if ((type === 'click' || key === 'Space' || key === 'ArrowUp')) {
      if (isGameOver) {
        resetGame();
      } else if (!gameRefs.current.jumping) {
        jump();
      }
    }
    
    // Handle closing the game
    if (key === 'Escape') {
      onClose();
    }
  }, [gameState, jump, onClose, resetGame, startGame]);
  
  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!canvasRef.current || !gameState.isActive) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { dino, obstacles, gravity, velocityY } = gameRefs.current;
    const { groundY } = gameState;
    
    // Update dino position when jumping
    if (gameRefs.current.jumping) {
      dino.y += gameRefs.current.velocityY;
      gameRefs.current.velocityY += gravity;
      
      if (dino.y >= groundY) {
        dino.y = groundY;
        gameRefs.current.jumping = false;
      }
    }
    
    // Generate obstacles with timing based on canvas width
    if (timestamp - gameRefs.current.lastObstacleTime > 1500 * (600 / canvas.width)) {
      obstacles.push({
        x: canvas.width,
        y: groundY,
        width: 20 + Math.random() * 30,
        height: 40 + Math.random() * 20
      });
      gameRefs.current.lastObstacleTime = timestamp;
    }
    
    // Draw ground
    ctx.fillStyle = 'black';
    ctx.fillRect(0, groundY, canvas.width, 2);
    
    // Draw dino
    ctx.fillStyle = 'black';
    ctx.fillRect(dino.x, dino.y - dino.height, dino.width, dino.height);
    
    // Process obstacles
    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];
      
      // Move obstacle
      obstacle.x -= gameRefs.current.gameSpeed * (canvas.width / 600);
      
      // Draw obstacle
      ctx.fillStyle = 'green';
      ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
      
      // Collision detection
      if (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y > obstacle.y - obstacle.height
      ) {
        setGameState(prev => ({
          ...prev,
          isActive: false,
          isGameOver: true
        }));
        return; // Stop the game loop
      }
      
      // Remove off-screen obstacles
      if (obstacle.x + obstacle.width < 0) {
        obstacles.splice(i, 1);
        i--;
        
        // Update score
        setGameState(prev => {
          const newScore = prev.score + 1;
          
          // Increase game speed every 5 points
          if (newScore > 0 && newScore % 5 === 0) {
            gameRefs.current.gameSpeed += 0.5;
          }
          
          return {
            ...prev,
            score: newScore
          };
        });
      }
    }
    
    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    
    // Game over screen
    if (gameState.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 80, 300, 160);
      
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = '20px Arial';
      ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 10);
      ctx.font = '16px Arial';
      ctx.fillText('Press Space to Play Again', canvas.width / 2, canvas.height / 2 + 40);
      ctx.fillText('Press ESC to Exit', canvas.width / 2, canvas.height / 2 + 70);
      ctx.textAlign = 'left';
    } else {
      // Continue game loop if game is active
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, onClose]);
  
  // Draw start screen
  const drawStartScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    const groundY = canvas.height - 50;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, groundY, canvas.width, 2);
    
    // Update dino position
    gameRefs.current.dino.y = groundY;
    
    // Draw dino
    const { dino } = gameRefs.current;
    ctx.fillStyle = 'black';
    ctx.fillRect(dino.x, dino.y - dino.height, dino.width, dino.height);
    
    // Draw start message
    ctx.fillStyle = 'black';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DINO RUNNER', canvas.width / 2, canvas.height / 3);
    
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE or CLICK to Start', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '18px Arial';
    ctx.fillText('Avoid obstacles by jumping', canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('Press ESC to exit', canvas.width / 2, canvas.height / 2 + 70);
    
    // Reset text alignment
    ctx.textAlign = 'left';
    
    // Request next animation frame if game hasn't started
    if (!gameState.isStarted) {
      animationFrameId.current = requestAnimationFrame(drawStartScreen);
    }
  }, [gameState.isStarted]);
  
  // Set up and clean up event listeners and animation frames
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Set initial ground level based on canvas height
    const canvas = canvasRef.current;
    const groundY = canvas.height - 50;
    gameRefs.current.dino.y = groundY;
    
    setGameState(prev => ({
      ...prev,
      groundY
    }));
    
    // Set up event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      handleInput('key', e.code);
    };
    
    const handleClick = () => {
      handleInput('click');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleClick);
    
    // Start drawing
    if (!gameState.isStarted) {
      drawStartScreen();
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('click', handleClick);
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [drawStartScreen, gameState.isStarted, handleInput]);
  
  return {
    canvasRef,
    gameState,
    startGame,
    resetGame,
    handleInput
  };
};

export default useGameEngine;
