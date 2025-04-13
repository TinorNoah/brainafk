import React from 'react';

interface GameOverScreenProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  score: number;
}

/**
 * Displays the game over screen with final score
 */
const GameOverScreen: React.FC<GameOverScreenProps> = ({ ctx, canvas, score }) => {
  const dpr = window.devicePixelRatio || 1;

  ctx.save();
  ctx.scale(dpr, dpr);

  const scaledWidth = canvas.width / dpr;
  const scaledHeight = canvas.height / dpr;
  const centerX = scaledWidth / 2;

  // Common text settings
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle'; // Center text vertically around the Y coordinate

  // Game Over Text
  // Increased multipliers for larger text
  const gameOverFontSize = Math.max(24, Math.min(scaledHeight * 0.12, scaledWidth * 0.15)); 
  ctx.font = `bold ${gameOverFontSize}px Arial, sans-serif`;
  const gameOverText = 'Game Over';
  const gameOverMetrics = ctx.measureText(gameOverText);
  const gameOverWidth = gameOverMetrics.width;
  const gameOverBgPadding = gameOverFontSize * 0.3;
  const gameOverBgWidth = gameOverWidth + gameOverBgPadding * 2;
  const gameOverBgHeight = gameOverFontSize + gameOverBgPadding;
  const gameOverY = scaledHeight * 0.3; // Adjusted Y position slightly higher

  // Background
  ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
  ctx.fillRect(centerX - gameOverBgWidth / 2, gameOverY - gameOverBgHeight / 2, gameOverBgWidth, gameOverBgHeight);

  // Draw text
  ctx.fillStyle = '#FF0000';
  ctx.fillText(gameOverText, centerX, gameOverY);

  // Final Score Text
  // Increased multipliers for larger text
  const scoreFontSize = Math.max(16, Math.min(scaledHeight * 0.07, scaledWidth * 0.08)); 
  ctx.font = `bold ${scoreFontSize}px Arial, sans-serif`;
  const scoreText = `Final Score: ${score}`;
  const scoreMetrics = ctx.measureText(scoreText);
  const scoreWidth = scoreMetrics.width;
  const scoreBgPadding = scoreFontSize * 0.3;
  const scoreBgWidth = scoreWidth + scoreBgPadding * 2;
  const scoreBgHeight = scoreFontSize + scoreBgPadding;
  const scoreY = scaledHeight * 0.5; // Kept Y position

  // Background
  ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
  ctx.fillRect(centerX - scoreBgWidth / 2, scoreY - scoreBgHeight / 2, scoreBgWidth, scoreBgHeight);

  // Draw text
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(scoreText, centerX, scoreY);

  // Restart Instructions Text
  // Increased multipliers for larger text
  const restartFontSize = Math.max(12, Math.min(scaledHeight * 0.045, scaledWidth * 0.055)); 
  ctx.font = `bold ${restartFontSize}px Arial, sans-serif`;
  const restartText = 'Press SPACE or CLICK to Play Again';
  const restartMetrics = ctx.measureText(restartText);
  const restartWidth = restartMetrics.width;
  const restartBgPadding = restartFontSize * 0.3;
  const restartBgWidth = restartWidth + restartBgPadding * 2;
  const restartBgHeight = restartFontSize + restartBgPadding;
  const restartY = scaledHeight * 0.7; // Adjusted Y position slightly lower

  // Background
  ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
  ctx.fillRect(centerX - restartBgWidth / 2, restartY - restartBgHeight / 2, restartBgWidth, restartBgHeight);

  // Draw text
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(restartText, centerX, restartY);

  // Reset text alignment and baseline (good practice)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic'; // Default baseline

  ctx.restore();
  
  return null; // This component doesn't render any React elements
};

export default GameOverScreen;