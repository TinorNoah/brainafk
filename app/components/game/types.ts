export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  sprite?: HTMLImageElement; // Optional sprite property
}

export interface GameState {
  isActive: boolean;
  isStarted: boolean;
  isGameOver: boolean;
  score: number;
  groundY: number;
}

export interface GameRefs {
  dino: GameObject;
  obstacles: GameObject[];
  clouds: { x: number; y: number; speed: number; width: number; height: number; sprite?: HTMLImageElement }[]; // Added sprite
  jumping: boolean;
  gravity: number;
  velocityY: number;
  gameSpeed: number;
  lastObstacleTime: number;
  dinoRunFrame: number; // Track current running frame
  dinoFrameTime: number; // Time since last frame change
  sprites: { // Store loaded sprites
    dinoRun1?: HTMLImageElement;
    dinoRun2?: HTMLImageElement;
    dinoJump?: HTMLImageElement;
    obstacleCactus?: HTMLImageElement;
    cloud?: HTMLImageElement;
  };
}
