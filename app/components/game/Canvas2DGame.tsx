import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, GameRefs } from './types';

interface Canvas2DGameProps {
  isActive: boolean;
  onGameOver: (score: number) => void;
}

const Canvas2DGame: React.FC<Canvas2DGameProps> = ({ isActive, onGameOver }) => {
  // Remove unused score state
  const [, setScore] = useState(0);
  
  // Game state management
  const gameState = useRef<GameState>({
    isActive: false,
    isStarted: false,
    isGameOver: false,
    score: 0,
    groundY: 0,
  });
  
  // Game objects
  const gameRefs = useRef<GameRefs>({
    dino: { x: 50, y: 0, width: 40, height: 60 },
    obstacles: [],
    jumping: false,
    gravity: 0.6,
    velocityY: 0,
    gameSpeed: 5,
    lastObstacleTime: 0,
  });
  
  // Animation frame request ID for cleanup
  const animationFrameId = useRef<number | null>(null);

  // Draw ready screen - defined early to avoid dependency issues
  const drawReadyScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.beginPath();
    ctx.moveTo(0, gameState.current.groundY);
    ctx.lineTo(canvas.width, gameState.current.groundY);
    ctx.stroke();
    
    // Draw dino
    ctx.fillStyle = 'black';
    ctx.fillRect(
      gameRefs.current.dino.x,
      gameRefs.current.dino.y,
      gameRefs.current.dino.width,
      gameRefs.current.dino.height
    );
    
    // Draw title
    ctx.fillStyle = 'black';
    ctx.font = '28px "Press Start 2P", Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DINO RUNNER', canvas.width / 2, canvas.height / 3);
    
    // Draw instructions
    ctx.font = '16px "Press Start 2P", Arial';
    ctx.fillText('PRESS SPACE OR CLICK TO START', canvas.width / 2, canvas.height / 2);
    
    // Reset text alignment
    ctx.textAlign = 'left';
  }, []);
  
  // Game over handling
  const gameOver = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    gameState.current.isGameOver = true;
    
    // Draw "Game Over" text
    ctx.fillStyle = 'black';
    ctx.font = '28px "Press Start 2P", Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 3);
    
    // Draw score
    ctx.font = '16px "Press Start 2P", Arial';
    ctx.fillText(`Final Score: ${gameState.current.score}`, canvas.width / 2, canvas.height / 2);
    
    // Draw restart instructions
    ctx.font = '12px "Press Start 2P", Arial';
    ctx.fillText('Press SPACE or CLICK to Play Again', canvas.width / 2, canvas.height / 2 + 40);
    
    // Reset text alignment
    ctx.textAlign = 'left';
    
    // Report score to parent
    onGameOver(gameState.current.score);
    
    // Cancel animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, [onGameOver]);
  
  // Make the dino jump
  const jump = useCallback(() => {
    const refs = gameRefs.current;
    if (refs.jumping) return;
    
    refs.jumping = true;
    refs.velocityY = -12;
  }, []);
  
  // Main game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const state = gameState.current;
    const refs = gameRefs.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.beginPath();
    ctx.moveTo(0, state.groundY);
    ctx.lineTo(canvas.width, state.groundY);
    ctx.stroke();
    
    // Update dino position (jumping)
    if (refs.jumping) {
      refs.dino.y += refs.velocityY;
      refs.velocityY += refs.gravity;
      
      if (refs.dino.y >= state.groundY - refs.dino.height) {
        refs.dino.y = state.groundY - refs.dino.height;
        refs.jumping = false;
      }
    }
    
    // Draw dino
    ctx.fillStyle = 'black';
    ctx.fillRect(
      refs.dino.x, 
      refs.dino.y, 
      refs.dino.width, 
      refs.dino.height
    );
    
    // Generate obstacles
    const now = Date.now();
    if (now - refs.lastObstacleTime > 1500) {
      const width = 20 + Math.random() * 30;
      const height = 40 + Math.random() * 20;
      
      refs.obstacles.push({
        x: canvas.width,
        y: state.groundY - height,
        width,
        height
      });
      
      refs.lastObstacleTime = now;
    }
    
    // Move and draw obstacles
    ctx.fillStyle = '#00CC00';
    for (let i = refs.obstacles.length - 1; i >= 0; i--) {
      const obstacle = refs.obstacles[i];
      
      // Move obstacle
      obstacle.x -= refs.gameSpeed;
      
      // Draw obstacle
      ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );
      
      // Check collision
      if (
        refs.dino.x < obstacle.x + obstacle.width &&
        refs.dino.x + refs.dino.width > obstacle.x &&
        refs.dino.y < obstacle.y + obstacle.height &&
        refs.dino.y + refs.dino.height > obstacle.y
      ) {
        gameOver();
        return;
      }
      
      // Remove off-screen obstacles and increase score
      if (obstacle.x + obstacle.width < 0) {
        refs.obstacles.splice(i, 1);
        
        // Update score
        state.score += 1;
        setScore(state.score);
        
        // Increase game speed every 5 points
        if (state.score % 5 === 0) {
          refs.gameSpeed += 0.5;
        }
      }
    }
    
    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '16px "Press Start 2P", Arial';
    ctx.fillText(`SCORE: ${state.score}`, 20, 30);
    
    // Continue game loop
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameOver]);
  
  // Start the game loop
  const startGame = useCallback(() => {
    gameState.current.isStarted = true;
    gameRefs.current.lastObstacleTime = Date.now();
    
    // Start game loop
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    gameLoop();
  }, [gameLoop]);
  
  // Reset game to initial state
  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const refs = gameRefs.current;
    
    // Reset game state
    gameState.current = {
      isActive: gameState.current.isActive,
      isStarted: false,
      isGameOver: false,
      score: 0,
      groundY: canvas.height - 50,
    };
    
    // Reset game objects
    refs.dino.y = gameState.current.groundY - refs.dino.height;
    refs.obstacles = [];
    refs.jumping = false;
    refs.velocityY = 0;
    refs.gameSpeed = 5;
    refs.lastObstacleTime = 0;
    
    setScore(0);
    
    // Draw ready screen
    drawReadyScreen();
  }, [drawReadyScreen]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize game - runs once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize canvas to parent container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      
      // Update ground position based on canvas height
      gameState.current.groundY = canvas.height - 50;
      gameRefs.current.dino.y = gameState.current.groundY - gameRefs.current.dino.height;
    };
    
    // Initial resize
    resizeCanvas();
    
    // Add resize event listener
    window.addEventListener('resize', resizeCanvas);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);
  
  // Game state changes based on isActive prop
  useEffect(() => {
    gameState.current.isActive = isActive;
    
    // Reset game when it becomes active
    if (isActive) {
      resetGame();
      if (!gameState.current.isStarted) {
        drawReadyScreen();
      }
    }
  }, [isActive, resetGame, drawReadyScreen]);
  
  // Handle keyboard and touch events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.current.isActive) return;
      
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (!gameState.current.isStarted) {
          startGame();
        } else if (!gameState.current.isGameOver) {
          jump();
        } else {
          resetGame();
        }
      }
    };
    
    const handleClick = () => {
      if (!gameState.current.isActive) return;
      
      if (!gameState.current.isStarted) {
        startGame();
      } else if (!gameState.current.isGameOver) {
        jump();
      } else {
        resetGame();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Store the current ref value to use in cleanup
    const currentCanvas = canvasRef.current;
    if (currentCanvas) {
      currentCanvas.addEventListener('click', handleClick);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (currentCanvas) {
        currentCanvas.removeEventListener('click', handleClick);
      }
    };
  }, [jump, resetGame, startGame]);
  
  return (
    <canvas
      ref={canvasRef}
      className="bg-white w-full h-full outline-none"
      tabIndex={0}
    />
  );
};

export default Canvas2DGame;
