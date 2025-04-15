import { GameEngineState } from '../types';
import { DINO_CHARACTERS, DINO_SPRITE_SHEET, CACTUS_SPRITE_SHEET } from '../config/constants';

interface RenderingSprites {
  dinoRun1?: HTMLImageElement;
  dinoRun2?: HTMLImageElement;
  dinoJump?: HTMLImageElement;
  obstacleSmall?: HTMLImageElement;
  obstacleLarge?: HTMLImageElement;
  cloud?: HTMLImageElement;
  // New sprite sheets
  dinoSheetDoux?: HTMLImageElement;
  dinoSheetMort?: HTMLImageElement;
  dinoSheetTard?: HTMLImageElement;
  dinoSheetVita?: HTMLImageElement;
  // Cactus sprite sheet
  cactusSheet?: HTMLImageElement;
}

// --- Main Drawing Function ---

// Track last status for logging changes
let lastStatus = '';

// Helper function to get the appropriate sprite sheet based on character
function getDinoSpriteSheet(character: string, sprites: RenderingSprites): HTMLImageElement | undefined {
  switch (character) {
    case DINO_CHARACTERS.DOUX:
      return sprites.dinoSheetDoux;
    case DINO_CHARACTERS.MORT:
      return sprites.dinoSheetMort;
    case DINO_CHARACTERS.TARD:
      return sprites.dinoSheetTard;
    case DINO_CHARACTERS.VITA:
      return sprites.dinoSheetVita;
    default:
      return sprites.dinoSheetDoux;
  }
}

// Helper function to draw a sprite from a sprite sheet
function drawSpriteFromSheet(
  ctx: CanvasRenderingContext2D,
  spriteSheet: HTMLImageElement,
  frameIndex: number,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  // Calculate the position of the frame in the sprite sheet
  const srcX = (frameIndex % 24) * DINO_SPRITE_SHEET.WIDTH;
  const srcY = 0;
  
  ctx.drawImage(
    spriteSheet,
    srcX,
    srcY,
    DINO_SPRITE_SHEET.WIDTH,
    DINO_SPRITE_SHEET.HEIGHT,
    x,
    y,
    width,
    height
  );
}

// Helper function to draw a cactus from the sprite sheet
function drawCactusFromSheet(
  ctx: CanvasRenderingContext2D,
  cactusSheet: HTMLImageElement,
  cactusType: number,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  // Calculate the position of the cactus in the sprite sheet
  // Each cactus is 32x32 pixels in the sprite sheet
  const srcX = cactusType * CACTUS_SPRITE_SHEET.WIDTH;
  const srcY = 0;
  
  // Debug info
  console.log(`Drawing cactus type ${cactusType} from position ${srcX},${srcY}`);
  
  ctx.drawImage(
    cactusSheet,
    srcX,
    srcY,
    CACTUS_SPRITE_SHEET.WIDTH,
    CACTUS_SPRITE_SHEET.HEIGHT,
    x,
    y,
    width,
    height
  );
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: GameEngineState,
  sprites: RenderingSprites
): void {
  const dpr = window.devicePixelRatio || 1;
  ctx.save();
  ctx.scale(dpr, dpr);

  const scaledWidth = canvas.width / dpr;
  const scaledHeight = canvas.height / dpr;

  // Clear canvas
  ctx.clearRect(0, 0, scaledWidth, scaledHeight);

  // Only log when game status changes to avoid console spam
  if (lastStatus !== state.status) {
    console.log('Game status changed to:', state.status);
    lastStatus = state.status;
  }

  // Draw background (sky gradient)
  const gradient = ctx.createLinearGradient(0, 0, 0, state.groundY);
  gradient.addColorStop(0, '#97C4FF');
  gradient.addColorStop(1, '#BCD7FF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, scaledWidth, scaledHeight);

  // Draw ground
  ctx.fillStyle = '#7AA953';
  ctx.fillRect(0, state.groundY, scaledWidth, scaledHeight - state.groundY);

  // Draw ground line
  ctx.beginPath();
  ctx.strokeStyle = '#5C8344';
  ctx.lineWidth = 2;
  ctx.moveTo(0, state.groundY);
  ctx.lineTo(scaledWidth, state.groundY);
  ctx.stroke();

  // Draw dino based on character type
  const spriteSheet = getDinoSpriteSheet(state.dino.character, sprites);
  
  if (spriteSheet) {
    // Use sprite sheet if available
    let frameIndex;
    if (state.dino.isJumping) {
      frameIndex = DINO_SPRITE_SHEET.JUMP_FRAME;
    } else if (state.dino.crouching) {
      frameIndex = state.dino.runFrame === 1 
        ? DINO_SPRITE_SHEET.CROUCH_FRAMES[0] 
        : DINO_SPRITE_SHEET.CROUCH_FRAMES[1];
    } else {
      frameIndex = state.dino.runFrame === 1 
        ? DINO_SPRITE_SHEET.RUN_FRAMES[0] 
        : DINO_SPRITE_SHEET.RUN_FRAMES[1];
    }
    
    drawSpriteFromSheet(
      ctx,
      spriteSheet,
      frameIndex,
      state.dino.x,
      state.dino.y,
      state.dino.width,
      state.dino.height
    );
  } else {
    // Fallback to original sprites if sheet not loaded
    const dinoSprite = state.dino.isJumping
      ? sprites.dinoJump
      : state.dino.runFrame === 1
      ? sprites.dinoRun1
      : sprites.dinoRun2;

    if (dinoSprite) {
      ctx.drawImage(
        dinoSprite,
        state.dino.x,
        state.dino.y,
        state.dino.width,
        state.dino.height
      );
    } else {
      // Fallback rectangle if sprite not loaded
      ctx.fillStyle = '#535353';
      ctx.fillRect(
        state.dino.x,
        state.dino.y,
        state.dino.width,
        state.dino.height
      );
    }
  }

  // Draw obstacles
  for (const obstacle of state.obstacles) {
    // Use cactus sprite sheet if available
    if (sprites.cactusSheet && obstacle.cactusType !== undefined) {
      drawCactusFromSheet(
        ctx,
        sprites.cactusSheet,
        obstacle.cactusType,
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );
    } 
    // Fallback to individual sprites if cactus sheet is not available
    else {
      const obstacleSprite =
        obstacle.type === 'large' ? sprites.obstacleLarge : sprites.obstacleSmall;

      if (obstacleSprite) {
        ctx.drawImage(
          obstacleSprite,
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height
        );
      } else {
        // Fallback rectangle if no sprite is loaded
        ctx.fillStyle = '#535353';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    }
  }

  // Draw clouds
  for (const cloud of state.clouds) {
    if (sprites.cloud) {
      ctx.drawImage(
        sprites.cloud,
        cloud.x,
        cloud.y,
        cloud.width,
        cloud.height
      );
    } else {
      // Fallback for cloud
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
    }
  }

  // Draw score - moved from right to left
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#535353';
  ctx.textAlign = 'left'; // Changed from 'right' to 'left'
  ctx.fillText(`Score: ${Math.floor(state.score)}`, 20, 30); // Changed position from (scaledWidth - 20, 30) to (20, 30)

  // Draw game state overlays
  switch (state.status) {
    case 'ready': {
      drawReadyScreen(ctx, scaledWidth, scaledHeight);
      break;
    }
    case 'paused': {
      drawPauseScreen(ctx, canvas, scaledWidth, scaledHeight);
      break;
    }
    case 'over': {
      drawGameOverScreen(ctx, scaledWidth, scaledHeight, state.score);
      break;
    }
  }

  ctx.restore();
}

function drawReadyScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, width, height);

  // Ready text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.font = 'bold 30px Arial';
  ctx.fillText('PRESS SPACE TO START', width / 2, height / 2);
}

function drawPauseScreen(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): void {
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;

  // PAUSED text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const pausedFontSize = Math.max(24, Math.min(height * 0.1, width * 0.12)); // Dynamic font size
  ctx.font = `bold ${pausedFontSize}px Arial, sans-serif`;
  ctx.fillStyle = 'white';
  const pausedY = height * 0.4; // Relative Y
  ctx.fillText('PAUSED', centerX, pausedY);

  // Calculate dynamic button dimensions
  const buttonWidth = Math.max(120, Math.min(width * 0.4, 250)); // Dynamic width
  const buttonHeight = Math.max(40, Math.min(height * 0.1, 70)); // Dynamic height
  const buttonFontSize = Math.max(14, Math.min(buttonHeight * 0.4, buttonWidth * 0.1)); // Dynamic font size

  // Calculate button position
  const buttonX = centerX - buttonWidth / 2;
  const buttonY = height * 0.55; // Relative Y

  // Draw Resume Button background
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(
    buttonX,
    buttonY,
    buttonWidth,
    buttonHeight
  );
  
  // Draw Button border
  ctx.strokeStyle = '#388E3C';
  ctx.lineWidth = Math.max(2, buttonHeight * 0.06); // Dynamic border
  ctx.strokeRect(
    buttonX,
    buttonY,
    buttonWidth,
    buttonHeight
  );

  // Draw Button text
  ctx.font = `bold ${buttonFontSize}px Arial, sans-serif`;
  ctx.fillStyle = 'white';
  // Adjust text position vertically within the button
  ctx.fillText('RESUME (ESC)', centerX, buttonY + buttonHeight / 2);
  
  // Reset alignment & line width
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineWidth = 1;
}

function drawGameOverScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  score: number
): void {
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  
  // Game Over text
  const gameOverFontSize = Math.max(30, Math.min(height * 0.12, width * 0.15));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.font = `bold ${gameOverFontSize}px Arial`;
  ctx.fillText('GAME OVER', centerX, height * 0.35);

  // Score text
  const scoreFontSize = Math.max(20, Math.min(height * 0.08, width * 0.1));
  ctx.font = `bold ${scoreFontSize}px Arial`;
  ctx.fillText(`Score: ${Math.floor(score)}`, centerX, height * 0.47);
  
  // Calculate dynamic button dimensions
  const buttonWidth = Math.max(120, Math.min(width * 0.4, 250)); // Dynamic width
  const buttonHeight = Math.max(40, Math.min(height * 0.1, 70)); // Dynamic height
  const buttonFontSize = Math.max(14, Math.min(buttonHeight * 0.4, buttonWidth * 0.1)); // Dynamic font size

  // Calculate button position
  const buttonX = centerX - buttonWidth / 2;
  const buttonY = height * 0.6; // Relative Y

  // Draw Restart Button background
  ctx.fillStyle = '#4285F4'; // Google blue
  ctx.fillRect(
    buttonX,
    buttonY,
    buttonWidth,
    buttonHeight
  );
  
  // Draw Button border
  ctx.strokeStyle = '#3367D6'; // Darker blue
  ctx.lineWidth = Math.max(2, buttonHeight * 0.06); // Dynamic border
  ctx.strokeRect(
    buttonX,
    buttonY,
    buttonWidth,
    buttonHeight
  );

  // Draw Button text
  ctx.font = `bold ${buttonFontSize}px Arial, sans-serif`;
  ctx.fillStyle = 'white';
  // Adjust text position vertically within the button
  ctx.fillText('RESTART (SPACE)', centerX, buttonY + buttonHeight / 2);
  
  // Reset alignment & line width
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineWidth = 1;
}