import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { BASE64_ASSETS, BASE64_SOUNDS } from './base64Assets';

const saveBase64AsFile = (base64Data: string, filePath: string) => {
  // Remove data URL prefix to get just the Base64 data
  const base64 = base64Data.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');
  writeFileSync(filePath, buffer);
};

// Create directories if they don't exist
const createDirs = () => {
  const dirs = [
    'public/game/sprites',
    'public/game/sounds'
  ];
  
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
};

// Save all assets
const saveAllAssets = () => {
  createDirs();
  
  // Save sprites
  Object.entries(BASE64_ASSETS).forEach(([name, data]) => {
    const filePath = join(process.cwd(), 'public/game/sprites', `${name}.png`);
    saveBase64AsFile(data, filePath);
    console.log(`Saved sprite: ${filePath}`);
  });
  
  // Save sounds
  Object.entries(BASE64_SOUNDS).forEach(([name, data]) => {
    const filePath = join(process.cwd(), 'public/game/sounds', `${name}.wav`);
    saveBase64AsFile(data, filePath);
    console.log(`Saved sound: ${filePath}`);
  });
};

// Run immediately since this is an ES module
saveAllAssets();