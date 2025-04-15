import { useEffect, useCallback } from 'react';

interface UseGameInputOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gameState: {
    isActive: boolean;
    isStarted: boolean;
    isGameOver: boolean;
  };
  isPaused: boolean;
  onJump: () => void;
  onStart: () => void;
  onReset: () => void;
  onTogglePause: () => void;
  onCrouch?: (isCrouching: boolean) => void;
}

export const useGameInput = ({
  canvasRef,
  gameState,
  isPaused,
  onJump,
  onStart,
  onReset,
  onTogglePause,
  onCrouch,
}: UseGameInputOptions) => {
  // Keyboard input handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!gameState.isActive) return;

      // Prevent default actions for game controls
      if (['Space', 'ArrowUp', 'Enter', 'ArrowDown', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        e.preventDefault();
      }

      // ESC toggles pause only during gameplay
      if (e.code === 'Escape' && gameState.isStarted && !gameState.isGameOver) {
        console.log('ESC pressed, toggling pause. Current isPaused:', isPaused);
        onTogglePause();
        return;
      }

      // Other controls only work if not paused
      if (!isPaused) {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
          if (!gameState.isStarted) {
            onStart();
          } else if (!gameState.isGameOver) {
            onJump();
          } else {
            onReset();
          }
        } else if (e.code === 'ArrowDown' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
          // Handle crouch when down arrow is pressed
          onCrouch?.(true);
        }
      }
    },
    [gameState, isPaused, onJump, onStart, onReset, onTogglePause, onCrouch]
  );

  // Keyboard key up handler for releasing crouch
  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!gameState.isActive || isPaused || !gameState.isStarted || gameState.isGameOver) return;

      if (e.code === 'ArrowDown' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        onCrouch?.(false);
      }
    },
    [gameState, isPaused, onCrouch]
  );

  // Mouse/touch input handler
  const handlePointerDown = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      if (!gameState.isActive) return;

      if (!isPaused) {
        if (!gameState.isStarted) {
          onStart();
        } else if (!gameState.isGameOver) {
          onJump();
        } else {
          onReset();
        }
      }
    },
    [gameState, isPaused, onJump, onStart, onReset]
  );

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const canvas = canvasRef.current;
    
    if (canvas) {
      canvas.addEventListener('mousedown', handlePointerDown);
      canvas.addEventListener('touchstart', handlePointerDown as EventListener);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      if (canvas) {
        canvas.removeEventListener('mousedown', handlePointerDown);
        canvas.removeEventListener('touchstart', handlePointerDown as EventListener);
      }
    };
  }, [handleKeyDown, handleKeyUp, handlePointerDown, canvasRef]);
};