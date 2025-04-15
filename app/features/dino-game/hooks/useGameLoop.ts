import { useRef, useEffect, useCallback } from 'react';

interface GameLoopProps {
  onUpdate: (deltaTime: number) => void;
  isActive: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  fps?: number;
}

export function useGameLoop({
  onUpdate,
  isActive,
  isPaused,
  isGameOver,
  fps = 60
}: GameLoopProps): void {
  // Use refs to avoid recreating the animation frame loop on every render
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const activeRef = useRef(isActive);
  const pausedRef = useRef(isPaused);
  const gameOverRef = useRef(isGameOver);
  
  // Target frame time in ms (e.g. 16.67ms for 60fps)
  const frameTime = useRef(1000 / fps);
  
  // Track accumulated time to handle frame drops more gracefully
  const accumulatedTimeRef = useRef(0);
  
  // Keep refs updated with latest props
  useEffect(() => {
    activeRef.current = isActive;
    pausedRef.current = isPaused;
    gameOverRef.current = isGameOver;
  }, [isActive, isPaused, isGameOver]);
  
  // Optimized animation loop using fixed timestep for consistent physics
  const animationLoop = useCallback((time: number) => {
    if (!activeRef.current) {
      previousTimeRef.current = undefined;
      accumulatedTimeRef.current = 0;
      requestRef.current = requestAnimationFrame(animationLoop);
      return;
    }
    
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animationLoop);
      return;
    }
    
    const deltaMS = time - previousTimeRef.current;
    previousTimeRef.current = time;
    
    // Skip frames if the tab was inactive (deltaMS too large)
    if (deltaMS > 200) {
      requestRef.current = requestAnimationFrame(animationLoop);
      return;
    }
    
    // Accumulate time since last frame
    accumulatedTimeRef.current += deltaMS;
    
    // Fixed time step: process as many updates as needed to catch up
    // This creates more consistent physics/gameplay regardless of frame rate
    const targetFrameTime = frameTime.current;
    let updateCount = 0;
    
    // If game is paused, we only want to render once
    if (!pausedRef.current && !gameOverRef.current) {
      while (accumulatedTimeRef.current >= targetFrameTime) {
        // Convert to seconds for physics calculations (fixed timestep)
        const fixedDeltaTime = targetFrameTime / 1000;
        
        // Update game state with fixed delta time
        onUpdate(fixedDeltaTime);
        
        accumulatedTimeRef.current -= targetFrameTime;
        updateCount++;
        
        // Safety valve: prevent spiral of death if updates take too long
        if (updateCount > 5) {
          accumulatedTimeRef.current = 0;
          break;
        }
      }
    } else {
      // When paused/game over, just render with delta=0 (no physics updates)
      onUpdate(0);
    }
    
    // Request next frame
    requestRef.current = requestAnimationFrame(animationLoop);
  }, [onUpdate]);
  
  // Set up and clean up animation frame
  useEffect(() => {
    if (!isActive) return;
    
    requestRef.current = requestAnimationFrame(animationLoop);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, animationLoop]);
}