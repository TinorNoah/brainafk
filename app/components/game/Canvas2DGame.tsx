import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, GameRefs } from './types';

// Define button properties outside component for reuse
const resumeButton = {
  width: 180,
  height: 50,
  text: 'RESUME (ESC)',
};

interface Canvas2DGameProps {
  isActive: boolean;
  onGameOver: (score: number) => void;
}

const Canvas2DGame: React.FC<Canvas2DGameProps> = ({ isActive, onGameOver }) => {
  // Remove unused score state
  const [, setScore] = useState(0);
  // Re-add pause state
  const [isPaused, setIsPaused] = useState(false);
  // Store button position
  const resumeButtonPos = useRef({ x: 0, y: 0 });

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Make the dino jump
  const jump = useCallback(() => {
    const refs = gameRefs.current;
    if (refs.jumping) return;
    
    refs.jumping = true;
    refs.velocityY = -12;
  }, []);
  
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
    
    // Draw title with improved visibility
    ctx.fillStyle = 'black';
    ctx.font = 'bold 32px Arial, sans-serif';  // Use a more visible font
    ctx.textAlign = 'center';
    
    // Draw a background for the text to make it more visible
    const titleText = 'DINO RUNNER';
    const titleWidth = ctx.measureText(titleText).width;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(
      canvas.width / 2 - titleWidth / 2 - 10,
      canvas.height / 3 - 30,
      titleWidth + 20,
      40
    );
    
    // Draw the text with a dark color and thicker strokes
    ctx.fillStyle = '#000000';
    ctx.fillText(titleText, canvas.width / 2, canvas.height / 3);
    
    // Draw instructions with improved visibility
    ctx.font = 'bold 18px Arial, sans-serif';
    const instructionText = 'PRESS SPACE OR CLICK TO START';
    const instructionWidth = ctx.measureText(instructionText).width;
    
    // Background for instructions
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(
      canvas.width / 2 - instructionWidth / 2 - 10,
      canvas.height / 2 - 15,
      instructionWidth + 20,
      30
    );
    
    // Draw instruction text
    ctx.fillStyle = '#000000';
    ctx.fillText(instructionText, canvas.width / 2, canvas.height / 2);
    
    // Reset text alignment
    ctx.textAlign = 'left';
  }, []);
  
  // Draw pause screen - Add Resume Button
  const drawPauseScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Slightly darker overlay
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // PAUSED text
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 60);

    // Calculate button position
    resumeButtonPos.current.x = canvas.width / 2 - resumeButton.width / 2;
    resumeButtonPos.current.y = canvas.height / 2 - resumeButton.height / 2 + 10; // Position below PAUSED text

    // Draw Resume Button background
    ctx.fillStyle = '#4CAF50'; // Green background
    ctx.fillRect(
      resumeButtonPos.current.x,
      resumeButtonPos.current.y,
      resumeButton.width,
      resumeButton.height
    );
    // Draw Button border
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = 3;
    ctx.strokeRect(
       resumeButtonPos.current.x,
       resumeButtonPos.current.y,
       resumeButton.width,
       resumeButton.height
    );

    // Draw Button text
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(resumeButton.text, canvas.width / 2, resumeButtonPos.current.y + resumeButton.height / 2 + 6); // Adjust text position

    ctx.textAlign = 'left'; // Reset alignment
    ctx.lineWidth = 1; // Reset line width
  }, []);
  
  // Game over handling
  const gameOver = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    gameState.current.isGameOver = true;
    
    // Draw "Game Over" text with improved visibility
    ctx.textAlign = 'center';
    
    // Background for game over text
    const gameOverText = 'Game Over';
    ctx.font = 'bold 32px Arial, sans-serif';
    const gameOverWidth = ctx.measureText(gameOverText).width;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(
      canvas.width / 2 - gameOverWidth / 2 - 10,
      canvas.height / 3 - 30,
      gameOverWidth + 20,
      40
    );
    
    // Draw game over text
    ctx.fillStyle = '#FF0000';  // Red text for game over
    ctx.fillText(gameOverText, canvas.width / 2, canvas.height / 3);
    
    // Draw score
    const scoreText = `Final Score: ${gameState.current.score}`;
    ctx.font = 'bold 20px Arial, sans-serif';
    const scoreWidth = ctx.measureText(scoreText).width;
    
    // Background for score
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(
      canvas.width / 2 - scoreWidth / 2 - 10,
      canvas.height / 2 - 15,
      scoreWidth + 20,
      30
    );
    
    // Draw score text
    ctx.fillStyle = '#000000';
    ctx.fillText(scoreText, canvas.width / 2, canvas.height / 2);
    
    // Draw restart instructions
    const restartText = 'Press SPACE or CLICK to Play Again';
    ctx.font = 'bold 16px Arial, sans-serif';
    const restartWidth = ctx.measureText(restartText).width;
    
    // Background for restart text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(
      canvas.width / 2 - restartWidth / 2 - 10,
      canvas.height / 2 + 30,
      restartWidth + 20,
      30
    );
    
    // Draw restart text
    ctx.fillStyle = '#000000';
    ctx.fillText(restartText, canvas.width / 2, canvas.height / 2 + 40);
    
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
  
  // Main game loop - Simplified: Only runs game logic if not paused
  const gameLoop = useCallback(() => {
    // If paused, do nothing in this loop iteration. The pause screen is drawn by useEffect or togglePause.
    if (isPaused) {
      // Ensure no frame is requested if we somehow enter here while paused
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    // --- Normal Game Logic (if not paused) ---
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
    // Ensure obstacle generation respects game speed and avoids immediate spawn
    const obstacleSpawnInterval = Math.max(800, 2000 - refs.gameSpeed * 100);
    if (now - refs.lastObstacleTime > obstacleSpawnInterval) {
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
        return; // Stop loop on game over
      }

      // Remove off-screen obstacles and increase score
      if (obstacle.x + obstacle.width < 0) {
        refs.obstacles.splice(i, 1);

        // Update score
        state.score += 1;
        setScore(state.score); // Update React state for potential display elsewhere

        // Increase game speed every 5 points
        if (state.score % 5 === 0) {
          refs.gameSpeed += 0.2; // Slightly reduced speed increase
        }
      }
    }

    // Draw score with improved visibility
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(10, 10, 150, 30);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(`SCORE: ${state.score}`, 20, 30);
    // --- End Normal Game Logic ---

    // Request the next frame ONLY if the game should continue running
    // Check all conditions again before requesting
    if (!isPaused && !gameState.current.isGameOver && gameState.current.isStarted && gameState.current.isActive) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else {
       animationFrameId.current = null; // Ensure null if loop shouldn't continue
    }
  }, [gameOver, isPaused]); // Removed drawPauseScreen dependency

  // Toggle pause state - Focus only on setting the state
  const togglePause = useCallback(() => {
    if (!gameState.current.isStarted || gameState.current.isGameOver) {
      return;
    }
    // Simply toggle the state. useEffect will handle the consequences.
    setIsPaused(prevPaused => !prevPaused);
  }, []); // Removed gameLoop and drawPauseScreen dependencies

  // Effect to manage the animation frame and draw pause screen based on isPaused state
  useEffect(() => {
    if (isPaused) {
      // PAUSED: Cancel any running frame and draw the pause screen
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      drawPauseScreen(); // Draw the pause screen
    } else {
      // RESUMED: If the game should be running, start the loop
      if (gameState.current.isStarted && !gameState.current.isGameOver && gameState.current.isActive) {
        // Ensure no duplicate frames are requested
        if (!animationFrameId.current) {
          console.log("Requesting frame from useEffect on resume..."); // Debug log
          animationFrameId.current = requestAnimationFrame(gameLoop);
        }
      }
    }

    // Cleanup function for when the component unmounts or isPaused changes again
    return () => {
      // Optional: Cancel frame if component unmounts while running?
      // Already handled in the main event listener cleanup.
    };
  }, [isPaused, gameLoop, drawPauseScreen]); // Dependencies: isPaused, gameLoop, drawPauseScreen

  // Start the game loop - Ensure pause state is reset
  const startGame = useCallback(() => {
    // Reset game state refs
    gameState.current.isStarted = true;
    gameState.current.isGameOver = false;
    gameState.current.score = 0;
    gameRefs.current.lastObstacleTime = Date.now();
    gameRefs.current.obstacles = [];
    gameRefs.current.gameSpeed = 5;
    gameRefs.current.velocityY = 0;
    gameRefs.current.jumping = false;
    gameRefs.current.dino.y = gameState.current.groundY - gameRefs.current.dino.height;

    setScore(0); // Reset score display state
    setIsPaused(false); // Ensure game starts unpaused

    // Clear any lingering animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    // Start the game loop
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Reset game to initial state - Ensure pause state is reset
  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset game state refs
    gameState.current.isStarted = false; // Go back to ready state
    gameState.current.isGameOver = false;
    gameState.current.score = 0;
    gameState.current.isActive = true; // Keep it active

    // Reset game objects refs
    gameRefs.current.dino.y = gameState.current.groundY - gameRefs.current.dino.height;
    gameRefs.current.obstacles = [];
    gameRefs.current.jumping = false;
    gameRefs.current.velocityY = 0;
    gameRefs.current.gameSpeed = 5;
    gameRefs.current.lastObstacleTime = 0;

    setScore(0); // Reset score display state
    setIsPaused(false); // Ensure game resets unpaused

    // Clear any lingering animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    // Draw the initial ready screen
    drawReadyScreen();
  }, [drawReadyScreen]);

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
    if (isActive) {
      // If becoming active, reset to ready state
      resetGame();
    } else {
      // If becoming inactive, ensure loop stops and cleanup
      setIsPaused(true); // Effectively pause it
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
  }, [isActive, resetGame]); // Removed drawReadyScreen dependency here, resetGame handles it
  
  // Handle keyboard and touch events - Added button click detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.current.isActive) return;

      // ESC toggles pause/resume
      if (e.code === 'Escape') {
        togglePause();
        return; // Handled
      }

      // Other controls only work if NOT paused
      if (!isPaused) {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
           // Prevent default browser behavior for Space/Enter if needed
           // e.preventDefault();
          if (!gameState.current.isStarted) {
            startGame();
          } else if (!gameState.current.isGameOver) {
            jump();
          } else { // isGameOver
            resetGame();
          }
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!gameState.current.isActive) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isPaused) {
        // Check if click is within the Resume button bounds
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        const btn = resumeButtonPos.current;
        const btnWidth = resumeButton.width;
        const btnHeight = resumeButton.height;

        if (
          clickX >= btn.x &&
          clickX <= btn.x + btnWidth &&
          clickY >= btn.y &&
          clickY <= btn.y + btnHeight
        ) {
          console.log("Resume button clicked"); // Debug log
          togglePause(); // Resume game
          return; // Handled
        }
      } else {
        // Handle normal game actions if not paused
        if (!gameState.current.isStarted) {
          startGame();
        } else if (!gameState.current.isGameOver) {
          jump();
        } else { // isGameOver
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const currentCanvas = canvasRef.current;
    if (currentCanvas) {
      // Use MouseEvent for click coordinates
      currentCanvas.addEventListener('click', handleClick as EventListener);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (currentCanvas) {
        currentCanvas.removeEventListener('click', handleClick as EventListener);
      }
      // Ensure loop stops on unmount
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPaused, jump, resetGame, startGame, togglePause]); // Removed gameLoop dependency here

  return (
    <canvas
      ref={canvasRef}
      className="bg-white w-full h-full outline-none"
      tabIndex={0} // Make canvas focusable for keyboard events
    />
  );
};

export default Canvas2DGame;
