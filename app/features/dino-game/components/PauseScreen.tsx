import React from 'react';

interface PauseScreenProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  resumeButtonPos: { x: number; y: number };
}

/**
 * Displays the game's pause screen with a resume button
 */
const PauseScreen: React.FC<PauseScreenProps> = ({ ctx, canvas, resumeButtonPos }) => {
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
  resumeButtonPos.x = centerX - buttonWidth / 2;
  resumeButtonPos.y = scaledHeight * 0.55; // Relative Y

  // Draw Resume Button background
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(
    resumeButtonPos.x,
    resumeButtonPos.y,
    buttonWidth,
    buttonHeight
  );
  // Draw Button border
  ctx.strokeStyle = '#388E3C';
  ctx.lineWidth = Math.max(2, buttonHeight * 0.06); // Dynamic border
  ctx.strokeRect(
     resumeButtonPos.x,
     resumeButtonPos.y,
     buttonWidth,
     buttonHeight
  );

  // Draw Button text
  ctx.font = `bold ${buttonFontSize}px Arial, sans-serif`;
  ctx.fillStyle = 'white';
  // Adjust text position vertically within the button
  ctx.fillText('RESUME (ESC)', centerX, resumeButtonPos.y + buttonHeight / 2);

  // Reset alignment & line width
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineWidth = 1;

  ctx.restore();
  
  return null; // This component doesn't render any React elements
};

export default PauseScreen;