import {
  GRAVITY,
  INITIAL_GAME_SPEED,
  JUMP_INITIAL_VELOCITY,
  DINO_INITIAL_X,
  DINO_WIDTH,
  DINO_HEIGHT,
  GROUND_Y_OFFSET,
  MAX_OBSTACLE_INTERVAL,
  MAX_GAME_SPEED,
  SCORE_INCREMENT_INTERVAL,
  GAME_SPEED_INCREMENT,
  DINO_ANIMATION_FRAME_DURATION,
  DINO_HITBOX_INSET_X,
  DINO_HITBOX_INSET_WIDTH,
  OBSTACLE_HITBOX_INSET_X,
  OBSTACLE_HITBOX_INSET_WIDTH,
  DINO_CHARACTERS,
  DinoCharacterType,
} from '../config/constants';
import { playSound } from '../utils';
import { GameEngineState, ObstacleState } from '../types';

// --- Core Game Logic ---
export function createInitialGameState(character: DinoCharacterType = DINO_CHARACTERS.DOUX): GameEngineState {
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
      character: character,
      crouching: false,
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
    // Preserve the character when restarting
    const selectedCharacter = state.dino.character as DinoCharacterType;
    
    const initialState = createInitialGameState(selectedCharacter);
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
  // Preserve the character when resetting
  const selectedCharacter = state.dino.character as DinoCharacterType;
  
  const initialState = createInitialGameState(selectedCharacter);
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

export function changeCharacter(state: GameEngineState, character: DinoCharacterType): GameEngineState {
  return {
    ...state,
    dino: {
      ...state.dino,
      character: character,
    }
  };
}

export function triggerJump(state: GameEngineState): GameEngineState {
  if (state.status === 'playing' && !state.dino.isJumping && !state.dino.crouching) {
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

export function toggleCrouch(state: GameEngineState, isCrouching: boolean): GameEngineState {
  if (state.status === 'playing' && !state.dino.isJumping) {
    return {
      ...state,
      dino: {
        ...state.dino,
        crouching: isCrouching,
        height: isCrouching ? DINO_HEIGHT * 0.6 : DINO_HEIGHT,
        y: state.groundY - (isCrouching ? DINO_HEIGHT * 0.6 : DINO_HEIGHT),
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

// ... existing functions ...

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

// Optimize obstacle generation to correctly use the cactus sprite sheet
export function generateObstacle(state: GameEngineState, canvasWidth: number): ObstacleState {
  const isLarge = Math.random() > 0.5;
  const type = isLarge ? 'large' : 'small';
  
  // Calculate dimensions based on type - scale according to the type
  const baseWidth = isLarge ? 34 : 24;
  const baseHeight = isLarge ? 70 : 50;
  const scale = 0.8 + Math.random() * 0.4; // Random scale between 0.8 and 1.2
  
  // Calculate appropriate cactus type from sprite sheet
  let cactusType: number;
  
  if (isLarge) {
    // Use one of the larger cactus types (3, 4, 5 in the sheet)
    cactusType = Math.floor(Math.random() * 3) + 3; // Results in 3, 4, or 5
  } else {
    // Use one of the smaller cactus types (0, 1, 2 in the sheet)
    cactusType = Math.floor(Math.random() * 3); // Results in 0, 1, or 2
  }

  return {
    x: canvasWidth,
    y: state.groundY - (baseHeight * scale),
    width: baseWidth * scale,
    height: baseHeight * scale,
    type: type,
    cactusType: cactusType, // Set the cactus type for sprite sheet rendering
  };
}

function generateObstacles(state: GameEngineState, deltaTime: number, canvasWidth: number): void {
  const currentTime = Date.now();
  
  // Dynamically adjust obstacle interval based on game speed
  // As the game gets faster, obstacles appear more frequently
  const dynamicInterval = MAX_OBSTACLE_INTERVAL - (state.gameSpeed - INITIAL_GAME_SPEED);
  
  if (currentTime - state.lastObstacleTime > dynamicInterval) {
    state.obstacles.push(generateObstacle(state, canvasWidth));
    state.lastObstacleTime = currentTime;
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

// Optimize collision detection for better performance
export function checkCollision(state: GameEngineState): boolean {
  const dino = state.dino;
  
  // Apply hitbox adjustments for more accurate collisions
  const dinoHitbox = {
    x: dino.x + DINO_HITBOX_INSET_X,
    y: dino.y,
    width: dino.width - DINO_HITBOX_INSET_WIDTH,
    height: dino.height
  };
  
  // Fast path: if there are no obstacles, we can skip collision detection
  if (state.obstacles.length === 0) return false;
  
  // Check collision with each obstacle
  for (const obstacle of state.obstacles) {
    // Only check collisions with obstacles in front of or under the dino
    if (obstacle.x > dinoHitbox.x + dinoHitbox.width) {
      continue; // Skip obstacles that are completely ahead
    }
    
    if (obstacle.x + obstacle.width < dinoHitbox.x) {
      continue; // Skip obstacles that are completely behind
    }
    
    // Apply hitbox adjustments for obstacles
    const obstacleHitbox = {
      x: obstacle.x + OBSTACLE_HITBOX_INSET_X,
      y: obstacle.y,
      width: obstacle.width - OBSTACLE_HITBOX_INSET_WIDTH,
      height: obstacle.height
    };
    
    // Check if hitboxes overlap
    if (
      dinoHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
      dinoHitbox.x + dinoHitbox.width > obstacleHitbox.x &&
      dinoHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
      dinoHitbox.y + dinoHitbox.height > obstacleHitbox.y
    ) {
      return true; // Collision detected
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
  generateObstacles(newState, deltaTime, canvasWidth);  // Call the function to generate obstacles
  updateObstacles(newState, deltaTime);
  updateScoreAndSpeed(newState, deltaTime);

  // Check for collisions
  if (checkCollision(newState)) {
    playSound('die');
    return { ...newState, status: 'over' };
  }

  return newState;
}
