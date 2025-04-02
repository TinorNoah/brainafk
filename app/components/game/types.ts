export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
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
  jumping: boolean;
  gravity: number;
  velocityY: number;
  gameSpeed: number;
  lastObstacleTime: number;
}
