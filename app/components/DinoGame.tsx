import React, { useState, useEffect, useRef } from 'react';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DinoGameProps {
  onClose: () => void;
}

const DinoGame: React.FC<DinoGameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  // Game state references
  const gameActive = useRef(true);
  const dino = useRef<GameObject>({ x: 50, y: 200, width: 40, height: 60 });
  const obstacles = useRef<GameObject[]>([]);
  const jumping = useRef(false);
  const gravity = useRef(0.6);
  const velocityY = useRef(0);
  const gameSpeed = useRef(5);
  const animationFrameId = useRef<number | null>(null);
  const lastObstacleTime = useRef(0);
  
  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !jumping.current) {
        jump();
      }
      
      if (e.code === 'Escape') {
        onClose();
      }
      
      if (gameOver && e.code === 'Space') {
        resetGame();
      }
    };
    
    const handleTap = () => {
      if (!jumping.current) {
        jump();
      }
      
      if (gameOver) {
        resetGame();
      }
    };
    
    const jump = () => {
      if (!jumping.current) {
        jumping.current = true;
        velocityY.current = -12;
      }
    };
    
    const resetGame = () => {
      dino.current.y = 200;
      obstacles.current = [];
      jumping.current = false;
      velocityY.current = 0;
      gameSpeed.current = 5;
      setScore(0);
      setGameOver(false);
      gameActive.current = true;
      lastObstacleTime.current = 0;
      
      if (animationFrameId.current === null) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
      }
    };
    
    canvas.addEventListener('click', handleTap);
    window.addEventListener('keydown', handleKeyDown);
    
    // Start game loop
    const gameLoop = (timestamp: number) => {
      if (!gameActive.current) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update dino position
      if (jumping.current) {
        dino.current.y += velocityY.current;
        velocityY.current += gravity.current;
        
        if (dino.current.y >= 200) {
          dino.current.y = 200;
          jumping.current = false;
        }
      }
      
      // Generate obstacles
      if (timestamp - lastObstacleTime.current > 1500) {
        obstacles.current.push({
          x: canvas.width,
          y: 210,
          width: 20 + Math.random() * 30,
          height: 40 + Math.random() * 20
        });
        lastObstacleTime.current = timestamp;
      }
      
      // Move and draw obstacles
      obstacles.current.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed.current;
        
        // Draw obstacle
        ctx.fillStyle = 'green';
        ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
        
        // Collision detection
        if (
          dino.current.x < obstacle.x + obstacle.width &&
          dino.current.x + dino.current.width > obstacle.x &&
          dino.current.y > obstacle.y - obstacle.height
        ) {
          gameActive.current = false;
          setGameOver(true);
        }
        
        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
          obstacles.current.splice(index, 1);
          setScore(prev => prev + 1);
          
          // Increase game speed every 5 points
          if (score > 0 && score % 5 === 0) {
            gameSpeed.current += 0.5;
          }
        }
      });
      
      // Draw dino
      ctx.fillStyle = 'black';
      ctx.fillRect(dino.current.x, dino.current.y - dino.current.height, dino.current.width, dino.current.height);
      
      // Draw ground
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 210, canvas.width, 2);
      
      // Draw score
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 20, 30);
      
      if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 80, 100);
        ctx.font = '16px Arial';
        ctx.fillText('Press Space to Play Again', canvas.width / 2 - 100, 130);
        ctx.fillText('Press ESC to Exit', canvas.width / 2 - 70, 160);
      }
      
      // Continue game loop
      if (!gameOver) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
      }
    };
    
    resetGame();
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('click', handleTap);
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      
      gameActive.current = false;
    };
  }, [onClose, score, gameOver]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-white rounded-lg p-4 shadow-xl w-[600px] max-w-[95vw]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Dino Game</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            &times;
          </button>
        </div>
        
        <div className="border border-gray-300 rounded">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={250} 
            className="bg-white"
          />
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          Press Space or tap to jump. Avoid the obstacles!
        </div>
      </div>
    </div>
  );
};

export default DinoGame;
