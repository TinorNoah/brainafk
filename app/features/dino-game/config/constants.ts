// Game physics constants
export const GRAVITY = 1200.0; // Increased for better jump feel
export const JUMP_INITIAL_VELOCITY = -600; // Adjusted for new gravity
export const GROUND_Y_OFFSET = 100; // Increased for more game space

// Game speed settings
export const INITIAL_GAME_SPEED = 400;
export const MAX_GAME_SPEED = 800;
export const GAME_SPEED_INCREMENT = 20;
export const SCORE_INCREMENT_INTERVAL = 100; // Score milestones every 100 points

// Additional speed boosts at milestone scores
export const SPEED_MILESTONE_BOOSTS = [
  { score: 50, boost: 3 },
  { score: 100, boost: 5 },
  { score: 200, boost: 8 },
  { score: 500, boost: 10 }
];

// Animation timings
export const DINO_ANIMATION_FRAME_DURATION = 100; // In milliseconds

// Game entity dimensions
export const DINO_INITIAL_X = 80;
export const DINO_WIDTH = 60;
export const DINO_HEIGHT = 64;

// Collision detection adjustments
export const DINO_HITBOX_INSET_X = 10;
export const DINO_HITBOX_INSET_WIDTH = 20;
export const OBSTACLE_HITBOX_INSET_X = 5;
export const OBSTACLE_HITBOX_INSET_WIDTH = 10;

// Cloud generation settings
export const CLOUD_LIMIT = 5;
export const CLOUD_SPAWN_CHANCE = 0.05; // Increased from 0.03

// Obstacle generation settings
export const MIN_OBSTACLE_INTERVAL = 800; // Minimum time between obstacles
export const MAX_OBSTACLE_INTERVAL = 2000; // Maximum time between obstacles
export const OBSTACLE_SPEED_FACTOR = 1.5;
export const OBSTACLE_PATTERN_CHANCE = 0.3; // Chance to generate a pattern instead of single obstacle

// Obstacle types
export const OBSTACLE_TYPES = {
  SMALL_CACTUS: 'small-cactus',
  LARGE_CACTUS: 'large-cactus',
  CACTUS_GROUP: 'cactus-group',
} as const; // Added 'as const'

// Obstacle patterns (arrays of obstacle configurations to create interesting sequences)
export const OBSTACLE_PATTERNS = [
  // Pattern 1: Three small cacti in a row
  [
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 0, scale: 0.8 },
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 50, scale: 0.8 },
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 100, scale: 0.8 }
  ],
  // Pattern 2: Small and large cactus combination
  [
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 0, scale: 0.7 },
    { type: OBSTACLE_TYPES.LARGE_CACTUS, offsetX: 80, scale: 1 }
  ],
  // Pattern 3: Large cactus followed by two small ones
  [
    { type: OBSTACLE_TYPES.LARGE_CACTUS, offsetX: 0, scale: 1 },
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 100, scale: 0.6 },
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 140, scale: 0.7 }
  ]
];

// Sprite paths
export const SPRITE_PATHS = {
  dinoRun1: '/game/dino-run-0.png',
  dinoRun2: '/game/dino-run-1.png',
  dinoJump: '/game/dino-jump.png',
  obstacleSmall: '/game/cactus-small.png',
  obstacleLarge: '/game/cactus-large.png',
  cloud: '/game/cloud.png',
};

// Sound paths
export const SOUND_PATHS = {
  jump: '/game/jump.mp3',
  die: '/game/die.mp3',
  milestone: '/game/point.mp3',
};