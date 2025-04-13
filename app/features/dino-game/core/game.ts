import {
  GRAVITY,
  INITIAL_GAME_SPEED,
  JUMP_INITIAL_VELOCITY,
  DINO_INITIAL_X,
  DINO_WIDTH,
  DINO_HEIGHT,
  GROUND_Y_OFFSET,
  MIN_OBSTACLE_INTERVAL,
  MAX_OBSTACLE_INTERVAL,
  OBSTACLE_SPEED_FACTOR,
  MAX_GAME_SPEED,
  SCORE_INCREMENT_INTERVAL,
  GAME_SPEED_INCREMENT,
  DINO_ANIMATION_FRAME_DURATION,
  DINO_HITBOX_INSET_X,
  DINO_HITBOX_INSET_WIDTH,
  OBSTACLE_HITBOX_INSET_X,
  OBSTACLE_HITBOX_INSET_WIDTH,
} from '../config/constants';
import { playSound } from '../utils';
import { CloudState } from '../types';

// --- Types ---
export interface DinoState {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  runFrame: number;
  frameTime: number;
}

export interface ObstacleState {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'small' | 'large';
}

export interface GameEngineState {
  status: 'ready' | 'playing' | 'paused' | 'over';
  dino: DinoState;
  obstacles: ObstacleState[];
  clouds: CloudState[];
  score: number;
  gameSpeed: number;
  groundY: number;
  lastObstacleTime: number;
  gameStartTime: number;
  spritesLoaded: boolean;
  gravity: number;
  obstacleInterval: number;
}

// --- Core Game Logic ---
export function createInitialGameState(): GameEngineState {
  return {
    status: 'ready',
    dino: {
      x: DINO_INITIAL_X,
      y: 0, // Will be set when groundY is set
      width: DINO_WIDTH,
      height: DINO_HEIGHT,
      velocityY: 0,
      isJumping: false,
      runFrame: 1,
      frameTime: 0,
    },
    obstacles: [],
    clouds: [],
    score: 0,
    gameSpeed: INITIAL_GAME_SPEED,
    groundY: 0,
    lastObstacleTime: 0,
    gameStartTime: 0,
    spritesLoaded: false,
    gravity: GRAVITY,
    obstacleInterval: MAX_OBSTACLE_INTERVAL,
  };
}

export function setGround(state: GameEngineState, canvasHeight: number): void {
  state.groundY = canvasHeight - GROUND_Y_OFFSET;
  if (!state.dino.isJumping) {
    state.dino.y = state.groundY - state.dino.height;
  }
}

export function startGame(state: GameEngineState): GameEngineState {
  if (state.status === 'ready' || state.status === 'over') {
    const initialState = createInitialGameState();
    return {
      ...initialState,
      status: 'playing',
      groundY: state.groundY,
      dino: {
        ...initialState.dino,
        y: state.groundY - DINO_HEIGHT,
      },
      gameStartTime: Date.now(),
      lastObstacleTime: Date.now(),
      spritesLoaded: state.spritesLoaded,
      gravity: state.gravity,
      obstacleInterval: state.obstacleInterval,
      clouds: [],
    };
  }
  return state;
}

export function resetGame(state: GameEngineState): GameEngineState {
  const initialState = createInitialGameState();
  return {
    ...initialState,
    status: 'ready',
    groundY: state.groundY,
    dino: {
      ...initialState.dino,
      y: state.groundY - DINO_HEIGHT,
    },
    spritesLoaded: state.spritesLoaded,
    gravity: state.gravity,
    obstacleInterval: state.obstacleInterval,
    clouds: [],
  };
}

export function triggerJump(state: GameEngineState): GameEngineState {
  if (state.status === 'playing' && !state.dino.isJumping) {
    playSound('jump');
    return {
      ...state,
      dino: {
        ...state.dino,
        isJumping: true,
        velocityY: JUMP_INITIAL_VELOCITY,
      },
    };
  }
  return state;
}

export function togglePause(state: GameEngineState): GameEngineState {
  if (state.status === 'playing') {
    console.log('Game paused');
    return { ...state, status: 'paused' };
  }
  if (state.status === 'paused') {
    console.log('Game resumed');
    return { ...state, status: 'playing' };
  }
  return state;
}

function applyGravity(state: GameEngineState, deltaTime: number): void {
  if (!state.dino.isJumping) return;

  state.dino.velocityY += GRAVITY * deltaTime;
  state.dino.y += state.dino.velocityY * deltaTime;

  if (state.dino.y >= state.groundY - state.dino.height) {
    state.dino.y = state.groundY - state.dino.height;
    state.dino.isJumping = false;
    state.dino.velocityY = 0;
  }
}

function updateDinoAnimation(state: GameEngineState, deltaTime: number): void {
  if (state.dino.isJumping) {
    state.dino.runFrame = 1;
    state.dino.frameTime = 0;
    return;
  }

  state.dino.frameTime += deltaTime * 1000; // Convert to milliseconds
  if (state.dino.frameTime >= DINO_ANIMATION_FRAME_DURATION) {
    state.dino.runFrame = state.dino.runFrame === 1 ? 2 : 1;
    state.dino.frameTime = 0;
  }
}

function generateObstacle(state: GameEngineState, canvasWidth: number): void {
  const now = Date.now();
  const speedFactor = Math.min(state.gameSpeed, MAX_GAME_SPEED);
  const dynamicInterval = Math.max(
    MIN_OBSTACLE_INTERVAL,
    MAX_OBSTACLE_INTERVAL - (speedFactor * OBSTACLE_SPEED_FACTOR)
  );

  if (state.obstacles.length === 0 || now - state.lastObstacleTime > dynamicInterval) {
    const isLarge = Math.random() > 0.5;
    const height = isLarge ? DINO_HEIGHT * 1.5 : DINO_HEIGHT;
    const width = isLarge ? DINO_WIDTH : DINO_WIDTH * 0.7;

    state.obstacles.push({
      x: canvasWidth,
      y: state.groundY - height,
      width,
      height,
      type: isLarge ? 'large' : 'small',
    });
    state.lastObstacleTime = now;
  }
}

function updateObstacles(state: GameEngineState, deltaTime: number): void {
  for (let i = state.obstacles.length - 1; i >= 0; i--) {
    const obstacle = state.obstacles[i];
    obstacle.x -= state.gameSpeed * deltaTime;
    if (obstacle.x + obstacle.width < 0) {
      state.obstacles.splice(i, 1);
    }
  }
}

function checkCollisions(state: GameEngineState): boolean {
  const dino = state.dino;
  const dinoHitbox = {
    left: dino.x + DINO_HITBOX_INSET_X,
    right: dino.x + dino.width - DINO_HITBOX_INSET_WIDTH,
    top: dino.y,
    bottom: dino.y + dino.height,
  };

  for (const obstacle of state.obstacles) {
    const obsHitbox = {
      left: obstacle.x + OBSTACLE_HITBOX_INSET_X,
      right: obstacle.x + obstacle.width - OBSTACLE_HITBOX_INSET_WIDTH,
      top: obstacle.y,
      bottom: obstacle.y + obstacle.height,
    };

    if (
      dinoHitbox.right > obsHitbox.left &&
      dinoHitbox.left < obsHitbox.right &&
      dinoHitbox.bottom > obsHitbox.top &&
      dinoHitbox.top < obsHitbox.bottom
    ) {
      return true;
    }
  }
  return false;
}

function updateScoreAndSpeed(state: GameEngineState, deltaTime: number): void {
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

export function updateGame(state: GameEngineState, deltaTime: number, canvasWidth: number): GameEngineState {
  if (state.status !== 'playing') {
    return state;
  }

  // Create a new state object for immutability
  const newState = { ...state };

  // Update game mechanics
  applyGravity(newState, deltaTime);
  updateDinoAnimation(newState, deltaTime);
  generateObstacle(newState, canvasWidth);
  updateObstacles(newState, deltaTime);
  updateScoreAndSpeed(newState, deltaTime);

  // Check for collisions
  if (checkCollisions(newState)) {
    playSound('die');
    return { ...newState, status: 'over' };
  }

  return newState;
}
