import React from 'react';
import { GameEngineState } from '../types';

interface ReadyScreenProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  gameState: GameEngineState;
  spritesLoaded: boolean;
}

/**
 * Displays the game's ready/start screen
 */
const ReadyScreen: React.FC<ReadyScreenProps> = ({
  ctx, canvas, gameState, spritesLoaded
}) => {
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
  ctx.moveTo(0, gameState.groundY);
  ctx.lineTo(scaledWidth, gameState.groundY);
  ctx.stroke();
  ctx.lineWidth = 1;
  
  // Draw dino
  if (spritesLoaded && gameState.sprites) {
    const sprite = gameState.dino.runFrame === 1 ? 
      gameState.sprites.dinoRun1 : 
      gameState.sprites.dinoRun2;
    
    if (sprite) {
      ctx.drawImage(
        sprite,
        gameState.dino.x,
        gameState.dino.y,
        gameState.dino.width,
        gameState.dino.height
      );
    }
  } else {
    ctx.fillStyle = '#DDDDDD';
    ctx.fillRect(gameState.dino.x, gameState.dino.y, gameState.dino.width, gameState.dino.height);
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
  
  return null; // This component doesn't render any React elements
};

export default ReadyScreen;