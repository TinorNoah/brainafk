import { GameEngineState } from '../types';
import { 
  CLOUD_LIMIT, 
  CLOUD_SPAWN_CHANCE,
  SCORE_INCREMENT_INTERVAL,
  GAME_SPEED_INCREMENT,
  MAX_GAME_SPEED
} from '../config/constants';
import { playSound } from '../utils';

/**
 * Update dino jump physics
 * @returns true if dino landed this frame, false otherwise
 */
export function updateDinoJump(state: GameEngineState, deltaTime: number): boolean {
  if (!state.dino.isJumping) return false;
  
  state.dino.velocityY += state.gravity * deltaTime;
  state.dino.y += state.dino.velocityY * deltaTime;
  
  if (state.dino.y >= state.groundY - state.dino.height) {
    state.dino.y = state.groundY - state.dino.height;
    state.dino.isJumping = false;
    state.dino.velocityY = 0;
    return true;
  }
  
  return false;
}

/**
 * Update dino animation frame
 */
export function updateDinoAnimation(state: GameEngineState, deltaTime: number): void {
  if (state.dino.isJumping) {
    state.dino.runFrame = 1;
    state.dino.frameTime = 0;
    return;
  }
  
  state.dino.frameTime += deltaTime * 1000; // Convert to milliseconds
  
  if (state.dino.frameTime >= 100) { // Animation frame duration in ms
    state.dino.runFrame = state.dino.runFrame === 1 ? 2 : 1;
    state.dino.frameTime = 0;
  }
}

/**
 * Generate new clouds based on probability
 */
export function generateCloud(state: GameEngineState, canvasWidth: number, canvasHeight: number): void {
  if (Math.random() < CLOUD_SPAWN_CHANCE && state.clouds.length < CLOUD_LIMIT) {
    const y = Math.random() * (canvasHeight / 3);
    const speed = 0.2 + Math.random() * 0.3;
    
    state.clouds.push({
      x: canvasWidth,
      y,
      width: 68,
      height: 28,
      speed
    });
  }
}

/**
 * Update cloud positions and remove off-screen clouds
 */
export function updateClouds(state: GameEngineState, deltaTime: number): void {
  for (let i = state.clouds.length - 1; i >= 0; i--) {
    const cloud = state.clouds[i];
    cloud.x -= cloud.speed * deltaTime;
    
    if (cloud.x + cloud.width < 0) {
      state.clouds.splice(i, 1);
    }
  }
}

/**
 * Generate a new obstacle if enough time has passed
 */
export function generateObstacle(state: GameEngineState, canvasWidth: number): void {
  const now = Date.now();
  if (state.obstacles.length === 0 || now - state.lastObstacleTime > state.obstacleInterval) {
    const isLarge = Math.random() > 0.5;
    const height = isLarge ? state.dino.height * 1.5 : state.dino.height;
    const width = isLarge ? state.dino.width : state.dino.width * 0.7;

    state.obstacles.push({
      x: canvasWidth,
      y: state.groundY - height,
      width,
      height,
      type: isLarge ? 'large' : 'small'
    });
    
    state.lastObstacleTime = now;
  }
}

/**
 * Update obstacle positions and remove off-screen obstacles
 */
export function updateObstacles(state: GameEngineState, deltaTime: number): void {
  for (let i = state.obstacles.length - 1; i >= 0; i--) {
    const obstacle = state.obstacles[i];
    obstacle.x -= state.gameSpeed * deltaTime;
    
    if (obstacle.x + obstacle.width < 0) {
      state.obstacles.splice(i, 1);
    }
  }
}

/**
 * Check for collisions between dino and obstacles
 */
export function checkCollision(state: GameEngineState): boolean {
  const dino = state.dino;
  
  for (const obstacle of state.obstacles) {
    if (
      dino.x < obstacle.x + obstacle.width &&
      dino.x + dino.width > obstacle.x &&
      dino.y < obstacle.y + obstacle.height &&
      dino.y + dino.height > obstacle.y
    ) {
      playSound('die');
      return true;
    }
  }
  
  return false;
}

/**
 * Update score based on time/distance and potentially increase game speed
 */
export function updateScore(state: GameEngineState, deltaTime: number): void {
  const prevScore = Math.floor(state.score);
  state.score += state.gameSpeed * deltaTime * 0.01;
  const newScore = Math.floor(state.score);

  if (Math.floor(prevScore / SCORE_INCREMENT_INTERVAL) < Math.floor(newScore / SCORE_INCREMENT_INTERVAL)) {
    if (state.gameSpeed < MAX_GAME_SPEED) {
      state.gameSpeed += GAME_SPEED_INCREMENT;
    }
    
    if (newScore > 0 && newScore % 100 === 0) {
      playSound('milestone');
    }
  }
}