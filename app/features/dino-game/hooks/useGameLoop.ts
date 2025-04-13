import { useRef, useCallback, useEffect } from 'react';

interface UseGameLoopOptions {
  onUpdate: (deltaTime: number) => void;
  isActive: boolean;
  isPaused: boolean;
  isGameOver?: boolean;
  targetFps?: number;
}

export const useGameLoop = ({
  onUpdate,
  isActive,
  isPaused,
  isGameOver = false,
  targetFps = 60
}: UseGameLoopOptions) => {
  const frameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameIntervalRef = useRef<number>(1000 / targetFps);
  const accumulatorRef = useRef<number>(0);

  const gameLoop = useCallback((timestamp: number) => {
    // Initialize time on first frame
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
      frameIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Calculate time since last frame
    const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
    accumulatorRef.current += deltaTime;

    // Update at fixed time steps for physics stability
    const frameInterval = frameIntervalRef.current / 1000; // Convert to seconds
    
    // When paused or game over, we still want to render but not update game physics
    if (!isPaused && !isGameOver) {
      while (accumulatorRef.current >= frameInterval) {
        onUpdate(frameInterval);
        accumulatorRef.current -= frameInterval;
      }
    } else {
      // When paused or game over, still call update but with a flag to only render
      onUpdate(0); // Pass 0 as deltaTime to indicate we should only render
      accumulatorRef.current = 0; // Reset accumulator when paused or game over
    }

    lastTimeRef.current = timestamp;

    // Continue the loop even when paused or game over as long as the game is active
    if (isActive) {
      frameIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      // Reset timing variables when stopping
      lastTimeRef.current = 0;
      accumulatorRef.current = 0;
    }
  }, [onUpdate, isActive, isPaused, isGameOver]);

  // Start/stop game loop based on active state only (not pause state)
  useEffect(() => {
    if (isActive) {
      // Reset timing variables when starting
      lastTimeRef.current = 0;
      accumulatorRef.current = 0;
      frameIdRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = 0;
      }
    };
  }, [isActive, gameLoop]);

  // Expose methods to manually control the loop
  return {
    start: () => {
      if (!frameIdRef.current) {
        lastTimeRef.current = 0;
        accumulatorRef.current = 0;
        frameIdRef.current = requestAnimationFrame(gameLoop);
      }
    },
    stop: () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = 0;
        lastTimeRef.current = 0;
        accumulatorRef.current = 0;
      }
    }
  };
};