import { SOUND_PATHS } from '../config/constants';

// Audio cache to prevent reloading sounds
const audioCache: { [key: string]: HTMLAudioElement } = {};

/**
 * Plays a game sound effect with error handling and caching
 */
export const playSound = (soundName: keyof typeof SOUND_PATHS) => {
  try {
    // Use cached audio if available
    if (!audioCache[soundName]) {
      audioCache[soundName] = new Audio(SOUND_PATHS[soundName]);
    }
    
    const audio = audioCache[soundName];
    // Reset and play
    audio.currentTime = 0;
    const playPromise = audio.play();
    
    // Handle play() promise to avoid uncaught rejection errors
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn(`Could not play sound "${soundName}":`, error);
      });
    }
  } catch (error) {
    console.error("Error playing sound:", error);
  }
};

/**
 * Loads an image and returns a promise
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    // Enable cross-origin loading if needed
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
};

/**
 * Preloads all game sounds
 */
export const preloadSounds = () => {
  Object.entries(SOUND_PATHS).forEach(([name, path]) => {
    const audio = new Audio(path);
    audioCache[name] = audio;
  });
};

/**
 * Formats a score number with proper spacing
 */
export const formatScore = (score: number): string => {
  return Math.floor(score).toString().padStart(5, '0');
};

/**
 * Checks if the game is running in a mobile browser
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};