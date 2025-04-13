import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, GameRefs } from './types';

// Define button properties outside component for reuse
// Remove fixed sizes, they will be calculated dynamically
const resumeButton = {
  // width: 180, // Removed
  // height: 50, // Removed
  text: 'RESUME (ESC)',
};

interface Canvas2DGameProps {
  isActive: boolean;
  onGameOver: (score: number) => void;
}

// Simple function to play sounds - assumes audio files are in /sounds/
const playSound = (soundName: 'jump' | 'gameOver' | 'score') => {
  // Basic check for user interaction before playing sound
  // More robust handling might be needed depending on browser policies
  try {
    const audio = new Audio(`/sounds/${soundName}.wav`); // Adjust path/extension as needed
    audio.play().catch(e => console.warn(`Could not play sound "${soundName}":`, e));
  } catch (e) {
    console.error("Error playing sound:", e);
  }
};

// Function to load an image
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const Canvas2DGame: React.FC<Canvas2DGameProps> = ({ isActive, onGameOver }) => {
  // Remove unused score state
  const [, setScore] = useState(0);
  // Re-add pause state
  const [isPaused, setIsPaused] = useState(false);
  // Store button position
  const resumeButtonPos = useRef({ x: 0, y: 0 });
  const [spritesLoaded, setSpritesLoaded] = useState(false); // Track sprite loading

  // Game state management
  const gameState = useRef<GameState>({
    isActive: false,
    isStarted: false,
    isGameOver: false,
    score: 0,
    groundY: 0,
  });
  
  // Game objects - Added clouds, animation state, and sprites ref
  const gameRefs = useRef<GameRefs>({
    dino: { x: 50, y: 0, width: 44, height: 47 }, // Adjust dimensions based on sprite
    obstacles: [],
    clouds: [],
    jumping: false,
    gravity: 0.6,
    velocityY: 0,
    gameSpeed: 5,
    lastObstacleTime: 0,
    dinoRunFrame: 1, // Start with frame 1
    dinoFrameTime: 0, // Time accumulator for animation
    sprites: {}, // Initialize empty sprite object
  });
  
  // Animation frame request ID for cleanup
  const animationFrameId = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Make the dino jump - Added sound
  const jump = useCallback(() => {
    const refs = gameRefs.current;
    if (refs.jumping || isPaused || gameState.current.isGameOver || !gameState.current.isStarted) return; // Prevent jumping when paused/over/not started
    
    refs.jumping = true;
    refs.velocityY = -12;
    playSound('jump'); // Play jump sound
  }, [isPaused]); // Added isPaused dependency
  
  // Draw ready screen - Use sprites and scale context dynamically
  const drawReadyScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spritesLoaded) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const refs = gameRefs.current;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(dpr, dpr);

    const scaledWidth = canvas.width / dpr;
    const scaledHeight = canvas.height / dpr;
    const centerX = scaledWidth / 2;

    // Clear canvas
    ctx.clearRect(0, 0, scaledWidth, scaledHeight);
    
    // Draw ground
    ctx.beginPath();
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.moveTo(0, gameState.current.groundY);
    ctx.lineTo(scaledWidth, gameState.current.groundY);
    ctx.stroke();
    ctx.lineWidth = 1;
    
    // Draw dino
    const dinoSprite = refs.sprites.dinoRun1;
    if (dinoSprite) {
      ctx.drawImage(dinoSprite, refs.dino.x, refs.dino.y, refs.dino.width, refs.dino.height);
    } else {
      ctx.fillStyle = '#DDDDDD';
      ctx.fillRect(refs.dino.x, refs.dino.y, refs.dino.width, refs.dino.height);
    }
    
    // --- Dynamic Text & Background ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title Text
    const titleFontSize = Math.max(20, Math.min(scaledHeight * 0.08, scaledWidth * 0.1)); // Dynamic font size
    ctx.font = `bold ${titleFontSize}px Arial, sans-serif`;
    const titleText = 'DINO RUNNER';
    const titleMetrics = ctx.measureText(titleText);
    const titleWidth = titleMetrics.width;
    const titleBgPadding = titleFontSize * 0.3; // Dynamic padding
    const titleBgWidth = titleWidth + titleBgPadding * 2;
    const titleBgHeight = titleFontSize + titleBgPadding;
    const titleY = scaledHeight * 0.35; // Relative Y position

    ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
    ctx.fillRect(centerX - titleBgWidth / 2, titleY - titleBgHeight / 2, titleBgWidth, titleBgHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(titleText, centerX, titleY);
    
    // Instructions Text
    const instructionFontSize = Math.max(12, Math.min(scaledHeight * 0.04, scaledWidth * 0.05)); // Dynamic font size
    ctx.font = `bold ${instructionFontSize}px Arial, sans-serif`;
    const instructionText = 'PRESS SPACE OR CLICK TO START';
    const instructionMetrics = ctx.measureText(instructionText);
    const instructionWidth = instructionMetrics.width;
    const instructionBgPadding = instructionFontSize * 0.3; // Dynamic padding
    const instructionBgWidth = instructionWidth + instructionBgPadding * 2;
    const instructionBgHeight = instructionFontSize + instructionBgPadding;
    const instructionY = scaledHeight * 0.55; // Relative Y position

    ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
    ctx.fillRect(centerX - instructionBgWidth / 2, instructionY - instructionBgHeight / 2, instructionBgWidth, instructionBgHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(instructionText, centerX, instructionY);
    
    // Reset alignment
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.restore();
  }, [spritesLoaded]);
  
  // Draw pause screen - Add Resume Button and scale context dynamically
  const drawPauseScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(dpr, dpr);

    const scaledWidth = canvas.width / dpr;
    const scaledHeight = canvas.height / dpr;
    const centerX = scaledWidth / 2;

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, scaledWidth, scaledHeight);

    // --- Dynamic Text & Button ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // PAUSED text
    const pausedFontSize = Math.max(24, Math.min(scaledHeight * 0.1, scaledWidth * 0.12)); // Dynamic font size
    ctx.font = `bold ${pausedFontSize}px Arial, sans-serif`;
    ctx.fillStyle = 'white';
    const pausedY = scaledHeight * 0.4; // Relative Y
    ctx.fillText('PAUSED', centerX, pausedY);

    // Calculate dynamic button dimensions
    const buttonWidth = Math.max(120, Math.min(scaledWidth * 0.4, 250)); // Dynamic width
    const buttonHeight = Math.max(40, Math.min(scaledHeight * 0.1, 70)); // Dynamic height
    const buttonFontSize = Math.max(14, Math.min(buttonHeight * 0.4, buttonWidth * 0.1)); // Dynamic font size

    // Calculate button position (relative to scaled canvas)
    resumeButtonPos.current.x = centerX - buttonWidth / 2;
    resumeButtonPos.current.y = scaledHeight * 0.55; // Relative Y

    // Draw Resume Button background
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(
      resumeButtonPos.current.x,
      resumeButtonPos.current.y,
      buttonWidth,
      buttonHeight
    );
    // Draw Button border
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = Math.max(2, buttonHeight * 0.06); // Dynamic border
    ctx.strokeRect(
       resumeButtonPos.current.x,
       resumeButtonPos.current.y,
       buttonWidth,
       buttonHeight
    );

    // Draw Button text
    ctx.font = `bold ${buttonFontSize}px Arial, sans-serif`;
    ctx.fillStyle = 'white';
    // Adjust text position vertically within the button
    ctx.fillText(resumeButton.text, centerX, resumeButtonPos.current.y + buttonHeight / 2);

    // Reset alignment & line width
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.lineWidth = 1;

    ctx.restore();
  }, []);

  // Draw Game Over Screen - Dynamic sizing and positioning
  const drawGameOverScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    // Remove previous logs
    // console.log(`[drawGameOverScreen] Canvas: ${canvas.width}x${canvas.height}, DPR: ${dpr}`);

    ctx.save();
    ctx.scale(dpr, dpr);

    const scaledWidth = canvas.width / dpr;
    const scaledHeight = canvas.height / dpr;
    const centerX = scaledWidth / 2;

    // Remove previous logs
    // console.log(`[drawGameOverScreen] Scaled: ${scaledWidth}x${scaledHeight}, CenterX: ${centerX}`);

    // --- Common Text Settings ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; // Center text vertically around the Y coordinate

    // --- Game Over Text ---
    const gameOverFontSize = Math.max(20, Math.min(scaledHeight * 0.09, scaledWidth * 0.11)); // Dynamic font size
    ctx.font = `bold ${gameOverFontSize}px Arial, sans-serif`;
    const gameOverText = 'Game Over';
    const gameOverMetrics = ctx.measureText(gameOverText);
    const gameOverWidth = gameOverMetrics.width;
    const gameOverBgPadding = gameOverFontSize * 0.3;
    const gameOverBgWidth = gameOverWidth + gameOverBgPadding * 2;
    const gameOverBgHeight = gameOverFontSize + gameOverBgPadding;
    const gameOverY = scaledHeight * 0.35; // Relative Y position

    // Optional: Log calculated position
    // console.log(`[drawGameOverScreen] GameOver Text - Pos: (${centerX}, ${gameOverY})`);

    // Background
    ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
    ctx.fillRect(centerX - gameOverBgWidth / 2, gameOverY - gameOverBgHeight / 2, gameOverBgWidth, gameOverBgHeight);

    // Draw Text
    ctx.fillStyle = '#FF0000';
    ctx.fillText(gameOverText, centerX, gameOverY);

    // --- Final Score Text ---
    const scoreFontSize = Math.max(14, Math.min(scaledHeight * 0.05, scaledWidth * 0.06)); // Dynamic font size
    ctx.font = `bold ${scoreFontSize}px Arial, sans-serif`;
    const scoreText = `Final Score: ${gameState.current.score}`;
    const scoreMetrics = ctx.measureText(scoreText);
    const scoreWidth = scoreMetrics.width;
    const scoreBgPadding = scoreFontSize * 0.3;
    const scoreBgWidth = scoreWidth + scoreBgPadding * 2;
    const scoreBgHeight = scoreFontSize + scoreBgPadding;
    const scoreY = scaledHeight * 0.5; // Relative Y position

    // Optional: Log calculated position
    // console.log(`[drawGameOverScreen] Score Text - Pos: (${centerX}, ${scoreY})`);

    // Background
    ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
    ctx.fillRect(centerX - scoreBgWidth / 2, scoreY - scoreBgHeight / 2, scoreBgWidth, scoreBgHeight);

    // Draw Text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(scoreText, centerX, scoreY);

    // --- Restart Instructions Text ---
    const restartFontSize = Math.max(10, Math.min(scaledHeight * 0.035, scaledWidth * 0.045)); // Dynamic font size
    ctx.font = `bold ${restartFontSize}px Arial, sans-serif`;
    const restartText = 'Press SPACE or CLICK to Play Again';
    const restartMetrics = ctx.measureText(restartText);
    const restartWidth = restartMetrics.width;
    const restartBgPadding = restartFontSize * 0.3;
    const restartBgWidth = restartWidth + restartBgPadding * 2;
    const restartBgHeight = restartFontSize + restartBgPadding;
    const restartY = scaledHeight * 0.65; // Relative Y position

    // Optional: Log calculated position
    // console.log(`[drawGameOverScreen] Restart Text - Pos: (${centerX}, ${restartY})`);

    // Background
    ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
    ctx.fillRect(centerX - restartBgWidth / 2, restartY - restartBgHeight / 2, restartBgWidth, restartBgHeight);

    // Draw Text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(restartText, centerX, restartY);

    // Reset text alignment and baseline (good practice)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic'; // Default baseline

    ctx.restore();
  }, []); // Dependency array remains empty

  // Game over handling - Updated to call drawGameOverScreen
  const gameOver = useCallback(() => {
    // Prevent multiple calls if already game over
    if (gameState.current.isGameOver) return;

    gameState.current.isGameOver = true;
    playSound('gameOver'); // Play game over sound

    // Cancel animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    // Draw the game over screen
    drawGameOverScreen();

    // Report score to parent
    onGameOver(gameState.current.score);

  }, [onGameOver, drawGameOverScreen]); // Added drawGameOverScreen dependency
  
  // Main game loop - Use sprites, animation, and scale context
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
    if (!canvas || !spritesLoaded) return; // Wait for sprites
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    const state = gameState.current;
    const refs = gameRefs.current;

    ctx.save();
    ctx.scale(dpr, dpr);

    const scaledWidth = canvas.width / dpr;
    const scaledHeight = canvas.height / dpr;

    // Clear canvas
    ctx.clearRect(0, 0, scaledWidth, scaledHeight);

    // --- Draw Background Elements (Clouds) ---
    // Use cloud sprite if available
    const cloudSprite = refs.sprites.cloud;
    refs.clouds.forEach((cloud, index) => {
      // Move cloud
      cloud.x -= cloud.speed * refs.gameSpeed * 0.1;

      // Draw cloud sprite or fallback ellipse
      if (cloudSprite) {
        ctx.drawImage(cloudSprite, cloud.x, cloud.y, cloud.width, cloud.height);
      } else {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)'; // Light grey fallback for clouds
        ctx.beginPath();
        ctx.ellipse(cloud.x + cloud.width / 2, cloud.y + cloud.height / 2, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // If cloud is off-screen, remove it
      if (cloud.x + cloud.width < 0) {
        refs.clouds.splice(index, 1);
      }
    });

    // Generate new clouds periodically (use scaledWidth)
    if (Math.random() < 0.01 && refs.clouds.length < 5) { // Limit cloud count
       const cloudY = 50 + Math.random() * (scaledHeight / 4); // Use scaledHeight
       const cloudWidth = cloudSprite ? cloudSprite.width * (0.5 + Math.random() * 0.5) : 40 + Math.random() * 60; // Scale sprite or use random size
       const cloudHeight = cloudSprite ? cloudSprite.height * (cloudWidth / cloudSprite.width) : 20 + Math.random() * 30; // Maintain aspect ratio or use random size
       const cloudSpeed = 0.5 + Math.random() * 0.5; // Vary cloud speed slightly
       refs.clouds.push({
         x: scaledWidth, // Start from scaledWidth
         y: cloudY,
         width: cloudWidth,
         height: cloudHeight,
         speed: cloudSpeed,
         sprite: cloudSprite // Store sprite ref
       });
    }
    // --- End Background ---

    // Draw ground (use scaledWidth and visible color)
    ctx.beginPath();
    ctx.strokeStyle = '#CCCCCC'; // Light grey for ground line
    ctx.lineWidth = 2;
    ctx.moveTo(0, state.groundY);
    ctx.lineTo(scaledWidth, state.groundY);
    ctx.stroke();
    ctx.lineWidth = 1; // Reset line width

    // Update dino position (jumping)
    if (refs.jumping) {
      refs.dino.y += refs.velocityY;
      refs.velocityY += refs.gravity;

      if (refs.dino.y >= state.groundY - refs.dino.height) {
        refs.dino.y = state.groundY - refs.dino.height;
        refs.jumping = false;
      }
    }

    // --- Dino Animation ---
    let currentDinoSprite = refs.sprites.dinoRun1; // Default sprite
    if (refs.jumping) {
      currentDinoSprite = refs.sprites.dinoJump || refs.sprites.dinoRun1; // Use jump sprite or fallback
      refs.dinoRunFrame = 1; // Reset run frame when jumping
      refs.dinoFrameTime = 0;
    } else {
      // Update frame time (assuming 60fps, deltaTime is ~16.67ms)
      refs.dinoFrameTime += 16.67; // Approximate delta time
      const frameDuration = 100; // ms per frame (adjust for desired speed)

      if (refs.dinoFrameTime >= frameDuration) {
        refs.dinoRunFrame = refs.dinoRunFrame === 1 ? 2 : 1; // Toggle between 1 and 2
        refs.dinoFrameTime = 0; // Reset timer
      }
      currentDinoSprite = refs.dinoRunFrame === 1 ? refs.sprites.dinoRun1 : refs.sprites.dinoRun2;
    }
    // --- End Dino Animation ---

    // Draw dino sprite or fallback rectangle
    if (currentDinoSprite) {
      ctx.drawImage(
        currentDinoSprite,
        refs.dino.x,
        refs.dino.y,
        refs.dino.width,
        refs.dino.height
      );
    } else {
      ctx.fillStyle = '#DDDDDD'; // Light grey fallback for dino
      ctx.fillRect(refs.dino.x, refs.dino.y, refs.dino.width, refs.dino.height);
    }

    // Generate obstacles - Use cactus sprite (use scaledWidth)
    const now = Date.now();
    const obstacleSpawnInterval = Math.max(800, 2000 - refs.gameSpeed * 100);
    const obstacleSprite = refs.sprites.obstacleCactus;

    if (now - refs.lastObstacleTime > obstacleSpawnInterval) {
      // Use sprite dimensions if available, otherwise random
      const width = obstacleSprite ? obstacleSprite.width * (0.8 + Math.random() * 0.4) : 20 + Math.random() * 30; // Scale sprite slightly
      const height = obstacleSprite ? obstacleSprite.height * (width / obstacleSprite.width) : 40 + Math.random() * 20; // Maintain aspect ratio

      refs.obstacles.push({
        x: scaledWidth, // Start from scaledWidth
        y: state.groundY - height,
        width,
        height,
        sprite: obstacleSprite // Store sprite ref
      });

      refs.lastObstacleTime = now;
    }

    // Move and draw obstacles - Use sprites
    for (let i = refs.obstacles.length - 1; i >= 0; i--) {
      const obstacle = refs.obstacles[i];

      // Move obstacle
      obstacle.x -= refs.gameSpeed;

      // Draw obstacle sprite or fallback rectangle
      if (obstacle.sprite) {
        ctx.drawImage(
          obstacle.sprite,
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );
      } else {
        ctx.fillStyle = '#99FF99'; // Light green fallback for obstacles
        ctx.fillRect(
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );
      }

      // Check collision (adjust hitboxes slightly if needed for sprites)
      const dinoHitbox = {
          x: refs.dino.x + 5, // Example: slightly inset hitbox
          y: refs.dino.y,
          width: refs.dino.width - 10,
          height: refs.dino.height
      };
      const obstacleHitbox = {
          x: obstacle.x + 2,
          y: obstacle.y,
          width: obstacle.width - 4,
          height: obstacle.height
      };

      if (
        dinoHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
        dinoHitbox.x + dinoHitbox.width > obstacleHitbox.x &&
        dinoHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
        dinoHitbox.y + dinoHitbox.height > obstacleHitbox.y
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

        // Play score sound every 5 points
        if (state.score % 5 === 0) {
          playSound('score');
          refs.gameSpeed += 0.2; // Slightly reduced speed increase
        }
      }
    }

    // Draw score with improved visibility (ensure text fillStyle is visible)
    ctx.fillStyle = 'rgba(50, 50, 50, 0.7)'; // Dark semi-transparent background for score
    ctx.fillRect(10, 10, 150, 30);
    ctx.fillStyle = '#FFFFFF'; // White text for score
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(`SCORE: ${state.score}`, 20, 30);

    ctx.restore();
    // --- End Normal Game Logic ---

    // Request the next frame ONLY if the game should continue running
    // Check all conditions again before requesting
    if (!isPaused && !gameState.current.isGameOver && gameState.current.isStarted && gameState.current.isActive) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else {
       animationFrameId.current = null; // Ensure null if loop shouldn't continue
    }
  }, [gameOver, isPaused, spritesLoaded]); // Add spritesLoaded dependency

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
    gameRefs.current.clouds = []; // Reset clouds
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
    gameRefs.current.clouds = []; // Reset clouds
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

    // Draw the initial ready screen (will use sprites if loaded and scale)
    drawReadyScreen();
  }, [drawReadyScreen]);

  // Initialize game - runs once, load sprites, handle resize with DPR
  useEffect(() => {
    // Load all sprites
    Promise.all([
      loadImage('/sprites/dino-run-1.png'),
      loadImage('/sprites/dino-run-2.png'),
      loadImage('/sprites/dino-jump.png'),
      loadImage('/sprites/obstacle-cactus.png'),
      loadImage('/sprites/cloud.png'),
    ]).then(([dinoRun1, dinoRun2, dinoJump, obstacleCactus, cloud]) => {
      gameRefs.current.sprites = { dinoRun1, dinoRun2, dinoJump, obstacleCactus, cloud };
      // Update dino dimensions based on loaded sprite (optional, could keep fixed)
      // gameRefs.current.dino.width = dinoRun1.width;
      // gameRefs.current.dino.height = dinoRun1.height;
      setSpritesLoaded(true);
      console.log("Sprites loaded successfully");
    }).catch(error => {
      console.error("Failed to load sprites:", error);
      // Proceed without sprites, maybe set a flag to use fallbacks
      setSpritesLoaded(true); // Still set to true to allow game start with fallbacks
    });

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Ensure context is 2d, disable alpha for potential performance gain
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
        console.error("Failed to get 2D context");
        return;
    }
    
    // Resize canvas to parent container, considering devicePixelRatio
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();

      // Remove previous logs
      // console.log(`[resizeCanvas] Parent Rect: ${rect.width}x${rect.height}, DPR: ${dpr}`);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      // Update ground position based on logical canvas height (before scaling)
      // Ensure groundY is always based on the potentially new height
      const logicalHeight = rect.height;
      gameState.current.groundY = logicalHeight - 50;
      
      // Update dino position immediately after groundY changes
      if (!gameRefs.current.jumping) {
          gameRefs.current.dino.y = gameState.current.groundY - gameRefs.current.dino.height;
      }

      // Redraw the current state after resize
      // The drawing functions now use dynamic sizes based on the new canvas dimensions
      if (gameState.current.isStarted && !isPaused && !gameState.current.isGameOver) {
          // If game is running, the next gameLoop call will handle redraw using new dimensions
          // console.log("[resizeCanvas] Game running, loop will redraw.");
          // Optionally force a redraw if needed, but gameLoop should handle it
          // requestAnimationFrame(gameLoop); 
      } else if (isPaused) {
          // console.log("[resizeCanvas] Game paused, redrawing pause screen.");
          drawPauseScreen();
      } else if (gameState.current.isGameOver) {
          // console.log("[resizeCanvas] Game over, redrawing game over screen.");
          drawGameOverScreen();
      } else { // Ready state
          // console.log("[resizeCanvas] Game ready, redrawing ready screen.");
          drawReadyScreen();
      }
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
  }, [drawReadyScreen, drawPauseScreen, drawGameOverScreen, isPaused, gameLoop]); // Added gameLoop to dependencies as resize might need to restart it if running
  
  // Game state changes based on isActive prop
  useEffect(() => {
    gameState.current.isActive = isActive;
    if (isActive && spritesLoaded) { // Also check if sprites are loaded before resetting
      // If becoming active, reset to ready state
      resetGame();
    } else if (!isActive) {
      // If becoming inactive, ensure loop stops and cleanup
      setIsPaused(true); // Effectively pause it
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
  }, [isActive, resetGame, spritesLoaded]); // Add spritesLoaded dependency
  
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
      const dpr = window.devicePixelRatio || 1;
      const scaledWidth = canvas.width / dpr; // Need these for button calculation
      const scaledHeight = canvas.height / dpr;

      if (isPaused) {
        // Check if click is within the Resume button bounds (use logical coordinates)
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Recalculate button dimensions dynamically for hit testing
        const buttonWidth = Math.max(120, Math.min(scaledWidth * 0.4, 250));
        const buttonHeight = Math.max(40, Math.min(scaledHeight * 0.1, 70));
        const btnX = scaledWidth / 2 - buttonWidth / 2; // Recalculate X
        const btnY = scaledHeight * 0.55; // Use the same relative Y as in drawPauseScreen

        // Compare logical click coordinates with logical button coordinates
        if (
          clickX >= btnX &&
          clickX <= btnX + buttonWidth &&
          clickY >= btnY &&
          clickY <= btnY + buttonHeight
        ) {
          // console.log("Resume button clicked (logical coords)");
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
  }, [isPaused, jump, resetGame, startGame, togglePause, spritesLoaded]); // Add spritesLoaded dependency

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full outline-none bg-blue-200" // Changed background to light blue
      tabIndex={0} // Make canvas focusable for keyboard events
      style={{ 
          opacity: spritesLoaded ? 1 : 0.5, 
          transition: 'opacity 0.3s',
          imageRendering: 'pixelated', // Helps prevent browser anti-aliasing on sprites
          display: 'block' // Prevents potential extra space below canvas
      }}
    />
  );
};

export default Canvas2DGame;
