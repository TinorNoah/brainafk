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
}

export const useGameInput = ({
  canvasRef,
  gameState,
  isPaused,
  onJump,
  onStart,
  onReset,
  onTogglePause,
}: UseGameInputOptions) => {
  // Keyboard input handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!gameState.isActive) return;

      // Prevent default actions for game controls
      if (['Space', 'ArrowUp', 'Enter'].includes(e.code)) {
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
        }
      }
    },
    [gameState, isPaused, onJump, onStart, onReset, onTogglePause]
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
    const canvas = canvasRef.current;
    
    if (canvas) {
      canvas.addEventListener('mousedown', handlePointerDown);
      canvas.addEventListener('touchstart', handlePointerDown as EventListener);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
        canvas.removeEventListener('mousedown', handlePointerDown);
        canvas.removeEventListener('touchstart', handlePointerDown as EventListener);
      }
    };
  }, [handleKeyDown, handlePointerDown, canvasRef]);
};