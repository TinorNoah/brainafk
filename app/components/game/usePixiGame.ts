import { useEffect, useState, useRef, RefObject, useCallback } from 'react';
import * as PIXI from 'pixi.js';

export type GameState = 'menu' | 'ready' | 'playing' | 'over';

export const usePixiGame = (
  containerRef: RefObject<HTMLDivElement>,
  onClose: () => void
) => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameScore, setGameScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  
  // Game instance and components
  const appRef = useRef<PIXI.Application | null>(null);
  const dinoRef = useRef<PIXI.Graphics | null>(null);
  const groundRef = useRef<PIXI.Graphics | null>(null);
  const obstaclesRef = useRef<PIXI.Graphics[]>([]);
  const textRef = useRef<PIXI.Text | null>(null);
  
  // Game mechanics
  const isJumpingRef = useRef(false);
  const velocityRef = useRef(0);
  const gameSpeedRef = useRef(5);
  const gravityRef = useRef(0.6);
  const scoreRef = useRef(0);
  const lastObstacleTimeRef = useRef(0);
  const gameStateRef = useRef(gameState);
  
  // Keep gameStateRef in sync with gameState
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  
  // Game loop function needs to be forward-declared to be used in setupGame and startActualGame
  const gameLoopRef = useRef<(ticker: PIXI.Ticker) => void>();
  
  // Jump function
  const jump = useCallback(() => {
    if (isJumpingRef.current) return;
    isJumpingRef.current = true;
    velocityRef.current = -12;
  }, []);
  
  // Clean up function to properly dispose PIXI resources
  const cleanupGame = useCallback(() => {
    try {
      // Only proceed if appRef.current exists
      if (appRef.current) {
        // Check if stage exists before removing listeners
        if (appRef.current.stage) {
          appRef.current.stage.eventMode = 'none';
          appRef.current.stage.removeAllListeners();
        }
        
        // Destroy all graphics if they exist
        if (dinoRef.current) {
          dinoRef.current.destroy();
          dinoRef.current = null;
        }
        
        if (groundRef.current) {
          groundRef.current.destroy();
          groundRef.current = null;
        }
        
        // Clear obstacle array
        if (obstaclesRef.current.length) {
          obstaclesRef.current.forEach(obs => {
            if (obs) obs.destroy();
          });
          obstaclesRef.current = [];
        }
        
        if (textRef.current) {
          textRef.current.destroy();
          textRef.current = null;
        }
        
        try {
          // Use proper method to safely destroy the app
          // Fix: Check if app exists and use a try-catch to handle destruction
          if (appRef.current) {
            appRef.current.destroy();
          }
        } catch (e) {
          console.warn("Error during app destruction, continuing cleanup", e);
        }
        appRef.current = null;
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }, []);
  
  // End game function - Declare before it's used in functions below
  const endGame = useCallback(() => {
    if (!appRef.current) return;
    
    const app = appRef.current;
    
    // Stop the game loop
    if (gameLoopRef.current) {
      app.ticker.remove(gameLoopRef.current);
    }
    
    // Create game over text
    const gameOverText = new PIXI.Text({
      text: 'Game Over',
      style: {
        fontFamily: 'Press Start 2P, Arial',
        fontSize: 28,
        fill: 0x000000,
        align: 'center',
      }
    });
    gameOverText.anchor.set(0.5);
    gameOverText.x = app.screen.width / 2;
    gameOverText.y = app.screen.height / 3;
    app.stage.addChild(gameOverText);
    textRef.current = gameOverText;
    
    // Score text
    const scoreText = new PIXI.Text({
      text: `Final Score: ${scoreRef.current}`,
      style: {
        fontFamily: 'Press Start 2P, Arial',
        fontSize: 16,
        fill: 0x000000,
        align: 'center',
      }
    });
    scoreText.anchor.set(0.5);
    scoreText.x = app.screen.width / 2;
    scoreText.y = app.screen.height / 2;
    app.stage.addChild(scoreText);
    
    // Restart instructions
    const restartText = new PIXI.Text({
      text: 'Press SPACE or CLICK to Play Again',
      style: {
        fontFamily: 'Press Start 2P, Arial',
        fontSize: 12,
        fill: 0x000000,
        align: 'center',
      }
    });
    restartText.anchor.set(0.5);
    restartText.x = app.screen.width / 2;
    restartText.y = app.screen.height / 2 + 40;
    app.stage.addChild(restartText);
    
    // Check if current score is higher than high score
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('dinoGameHighScore', scoreRef.current.toString());
    }
    
    setGameState('over');
  }, [highScore]);
  
  // Setup the game loop first so it can be referenced elsewhere
  useEffect(() => {
    // Define game loop with proper ticker parameter
    gameLoopRef.current = (_ticker: PIXI.Ticker) => {  // Added underscore to indicate unused parameter
      if (!dinoRef.current || !groundRef.current || gameStateRef.current !== 'playing' || !appRef.current) return;
      
      const app = appRef.current;
      const dino = dinoRef.current;
      const groundY = app.screen.height - 50;
      
      // Update dino position (jumping)
      if (isJumpingRef.current) {
        dino.y += velocityRef.current;
        velocityRef.current += gravityRef.current;
        
        if (dino.y >= groundY - 60) { // 60 is dino height
          dino.y = groundY - 60;
          isJumpingRef.current = false;
        }
      }
      
      // Generate obstacles
      const now = Date.now();
      if (now - lastObstacleTimeRef.current > 1500) {
        const obstacle = new PIXI.Graphics();
        obstacle.beginFill(0x00CC00);
        
        const width = 20 + Math.random() * 30;
        const height = 40 + Math.random() * 20;
        
        obstacle.drawRect(0, 0, width, height);
        obstacle.endFill();
        obstacle.x = app.screen.width;
        obstacle.y = groundY - height;
        
        app.stage.addChild(obstacle);
        obstaclesRef.current.push(obstacle);
        lastObstacleTimeRef.current = now;
      }
      
      // Move and check collision with obstacles
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obstacle = obstaclesRef.current[i];
        
        // Move obstacle
        obstacle.x -= gameSpeedRef.current;
        
        // Check collision
        const dinoRight = dino.x + 40;
        const dinoBottom = dino.y + 60;
        const obsRight = obstacle.x + obstacle.width;
        const obsBottom = obstacle.y + obstacle.height;
        
        if (
          dino.x < obsRight &&
          dinoRight > obstacle.x &&
          dino.y < obsBottom && 
          dinoBottom > obstacle.y
        ) {
          endGame();
          return;
        }
        
        // Remove off-screen obstacles and increase score
        if (obstacle.x + obstacle.width < 0) {
          app.stage.removeChild(obstacle);
          obstaclesRef.current.splice(i, 1);
          
          // Update score
          scoreRef.current += 1;
          setGameScore(scoreRef.current);
          
          // Increase game speed every 5 points
          if (scoreRef.current % 5 === 0) {
            gameSpeedRef.current += 0.5;
          }
        }
      }
    };
  }, [endGame]);
  
  // Start actual gameplay (transition from ready to playing)
  const startActualGame = useCallback(() => {
    if (!appRef.current) return;
    
    const app = appRef.current;
    
    // Clear text
    if (textRef.current) {
      app.stage.removeChild(textRef.current);
      textRef.current = null;
    }
    
    // Remove all other text
    app.stage.children.forEach(child => {
      if (child instanceof PIXI.Text) {
        app.stage.removeChild(child);
      }
    });
    
    // Reset obstacles
    obstaclesRef.current.forEach(obs => app.stage.removeChild(obs));
    obstaclesRef.current = [];
    
    // Start game loop
    setGameState('playing');
    lastObstacleTimeRef.current = Date.now();
    
    // Add game loop to ticker if it exists
    if (gameLoopRef.current) {
      app.ticker.add(gameLoopRef.current);
    }
  }, []);
  
  // Setup game - initialize game elements
  const setupGame = useCallback(() => {
    if (!appRef.current) return;
    
    const app = appRef.current;
    
    // Reset game variables
    isJumpingRef.current = false;
    velocityRef.current = 0;
    gameSpeedRef.current = 5;
    scoreRef.current = 0;
    setGameScore(0);
    obstaclesRef.current = [];
    
    // Clear the stage
    app.stage.removeChildren();
    
    // Create ground
    const ground = new PIXI.Graphics();
    ground.setStrokeStyle({ width: 2, color: 0x000000 });
    ground.moveTo(0, app.screen.height - 50);
    ground.lineTo(app.screen.width, app.screen.height - 50);
    ground.stroke();
    app.stage.addChild(ground);
    groundRef.current = ground;
    
    // Create dino character
    const dino = new PIXI.Graphics();
    dino.beginFill(0x000000);
    dino.drawRect(0, 0, 40, 60);
    dino.endFill();
    dino.x = 50;
    dino.y = app.screen.height - 50 - 60; // Position above ground
    app.stage.addChild(dino);
    dinoRef.current = dino;
    
    // Main text for game state
    const stateText = new PIXI.Text({
      text: 'DINO RUNNER',
      style: {
        fontFamily: 'Press Start 2P, Arial',
        fontSize: 28,
        fill: 0x000000,
        align: 'center',
      }
    });
    stateText.anchor.set(0.5);
    stateText.x = app.screen.width / 2;
    stateText.y = app.screen.height / 3;
    app.stage.addChild(stateText);
    textRef.current = stateText;
    
    // Add instructions
    const instructionsText = new PIXI.Text({
      text: 'PRESS SPACE OR CLICK TO START',
      style: {
        fontFamily: 'Press Start 2P, Arial',
        fontSize: 16,
        fill: 0x000000,
        align: 'center',
      }
    });
    instructionsText.anchor.set(0.5);
    instructionsText.x = app.screen.width / 2;
    instructionsText.y = app.screen.height / 2;
    app.stage.addChild(instructionsText);
    
    // Create event handlers for the game
    app.stage.eventMode = 'static';
    app.stage.cursor = 'pointer';
    
    // Remove existing listeners to prevent duplicates
    app.stage.removeAllListeners();
    
    // Add pointerdown event to start the game - use ref for current state
    app.stage.on('pointerdown', () => {
      if (gameStateRef.current === 'ready') {
        startActualGame();
      }
    });
    
    // Set game state
    setGameState('ready');
  }, [startActualGame]);
  
  // Menu control - transition from menu to ready state
  const startGame = useCallback(() => {
    setupGame();
  }, [setupGame]);
  
  // Load high score from localStorage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('dinoGameHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);
  
  // Main effect to set up the game - use gameStateRef for event handlers
  useEffect(() => {
    // Store the current containerRef value to use in cleanup
    const currentContainer = containerRef.current;
    
    if (!currentContainer) return;
    
    // Check if WebGL is supported first
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (e) {
        return false;
      }
    };
    
    // If WebGL isn't supported, mark it and return early
    if (!checkWebGLSupport()) {
      setIsWebGLSupported(false);
      return;
    }
    
    try {
      // Use safer creation of PIXI Application with better error handling
      let app: PIXI.Application;
      
      try {
        // Create a new PIXI Application using PixiJS v8 approach
        app = new PIXI.Application();
        
        // Initialize the application with proper settings
        // Use WebGL preference which is correct in PIXI.js v8
        app.init({
          width: currentContainer.clientWidth,
          height: currentContainer.clientHeight,
          backgroundColor: 0xFFFFFF,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          // Correct value for preference - "webgl" is valid
          preference: 'webgl'
        });
      } catch (e) {
        console.warn("Error creating WebGL renderer, trying fallback", e);
        
        // Try with a default setup without preference
        app = new PIXI.Application();
        app.init({
          width: currentContainer.clientWidth,
          height: currentContainer.clientHeight,
          backgroundColor: 0xFFFFFF,
          // Remove preference to let PIXI choose the best available renderer
          resolution: 1
        });
      }
      
      // Handle WebGL context loss
      const handleContextLost = () => {
        console.warn("WebGL context was lost, trying to recover");
        
        // Try to reinitialize the application
        try {
          if (appRef.current) {
            // Clean up old app
            cleanupGame();
            
            // Create new app with fallback setup
            const newApp = new PIXI.Application();
            newApp.init({
              width: currentContainer.clientWidth,
              height: currentContainer.clientHeight,
              backgroundColor: 0xFFFFFF,
              // Use no preference to let PIXI choose best available renderer
              resolution: 1
            });
            
            appRef.current = newApp;
            
            // Re-add the canvas to the container
            if (newApp.canvas && currentContainer) {
              while (currentContainer.firstChild) {
                currentContainer.removeChild(currentContainer.firstChild);
              }
              currentContainer.appendChild(newApp.canvas);
            }
            
            // Go back to menu state
            setGameState('menu');
          }
        } catch (e) {
          console.error("Failed to recover from WebGL context loss", e);
          setIsWebGLSupported(false);
        }
      };
      
      // Add context lost listener to the canvas
      if (app.canvas) {
        app.canvas.addEventListener('webglcontextlost', handleContextLost);
      }
      
      // Store the app reference first before accessing canvas
      appRef.current = app;
      
      // Access the canvas using the proper property in v8
      const pixiCanvas = app.canvas;
      
      // Safety check for canvas existence
      if (!pixiCanvas) {
        throw new Error("Failed to get PIXI canvas element");
      }
      
      // Clear the container first to avoid duplicate canvases
      while (currentContainer.firstChild) {
        currentContainer.removeChild(currentContainer.firstChild);
      }
      
      // Now append the canvas - only after the app is fully initialized
      currentContainer.appendChild(pixiCanvas);
      
      // Responsive handling - with better error handling
      const handleResize = () => {
        if (!currentContainer || !appRef.current) return;
        
        try {
          // Fix the resize method call to match the expected parameters
          appRef.current.renderer.resize(
            currentContainer.clientWidth,
            currentContainer.clientHeight
          );
          
          // Reposition elements
          if (groundRef.current) {
            groundRef.current.clear();
            groundRef.current.setStrokeStyle({ width: 2, color: 0x000000 });
            groundRef.current.moveTo(0, appRef.current.screen.height - 50);
            groundRef.current.lineTo(appRef.current.screen.width, appRef.current.screen.height - 50);
            groundRef.current.stroke();
          }
        } catch (e) {
          console.warn("Error handling resize, continuing", e);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Handle key presses - use gameStateRef to avoid dependency issues
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          if (gameStateRef.current === 'ready') {
            startActualGame();
          } else if (gameStateRef.current === 'over') {
            setupGame();
          } else if (gameStateRef.current === 'playing') {
            jump();
          }
        }
        
        if (e.code === 'Escape') {
          onClose();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      
      // Handle click events on container
      const handleGameClick = () => {
        if (gameStateRef.current === 'ready') {
          startActualGame();
        } else if (gameStateRef.current === 'over') {
          setupGame();
        } else if (gameStateRef.current === 'playing') {
          jump();
        }
      };

      currentContainer.addEventListener('click', handleGameClick);
      
      // Clean up
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        if (currentContainer) {
          currentContainer.removeEventListener('click', handleGameClick);
        }
        if (app.canvas) {
          app.canvas.removeEventListener('webglcontextlost', handleContextLost);
        }
        cleanupGame();
      };
    } catch (error) {
      console.error("Error initializing PIXI:", error);
      setIsWebGLSupported(false);
      return () => {}; // Return empty cleanup function if initialization fails
    }
  }, [containerRef, onClose, cleanupGame, jump, setupGame, startActualGame]);
  
  return { 
    gameState, 
    gameScore, 
    highScore,
    startGame,
    isWebGLSupported
  };
};
