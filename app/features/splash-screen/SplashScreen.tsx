import React, { useEffect, useState } from 'react';
import AnimatedLetter from './components/AnimatedLetter';
import Star from '~/components/ui/Star';

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * Animated splash screen component with the "TINOR" text animation
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stars, setStars] = useState<React.ReactNode[]>([]);
  const [splashStage, setSplashStage] = useState<'entering' | 'exiting'>('entering');
  
  // Generate stars for background
  useEffect(() => {
    const generatedStars = [];
    for (let i = 0; i < 100; i++) {
      const size = Math.random() * 3 + 1;
      const top = `${Math.random() * 100}%`;
      const left = `${Math.random() * 100}%`;
      const delay = `${Math.random() * 5}s`;
      
      generatedStars.push(
        <Star key={i} size={size} top={top} left={left} delay={delay} />
      );
    }
    setStars(generatedStars);
  }, []);
  
  // Manage animation sequence
  useEffect(() => {
    // First we let the letters fall individually (allow more time for animation)
    // Each letter takes 0.7s to fall, plus 0.15s delay between letters
    // So for all 5 letters: ~1.5s
    // Then we pause for 0.3s to show the complete word
    const enterAndStayDuration = 1.5 + 0.3; // ~1.5s for all letters + 0.3s pause
    
    const startExitTimer = setTimeout(() => {
      setSplashStage('exiting');
    }, enterAndStayDuration * 1000);
    
    // Complete exit animation needs to account for all letters falling in sequence
    // Last letter has a 0.4s delay (4 * 0.1s) and takes 0.3s to fall
    // Buffer of 0.1s
    const exitDuration = (4 * 0.1) + 0.3 + 0.1; // Last letter delay + animation time + buffer
    
    const completeExitTimer = setTimeout(() => {
      onComplete();
    }, (enterAndStayDuration + exitDuration) * 1000);
    
    return () => {
      clearTimeout(startExitTimer);
      clearTimeout(completeExitTimer);
    };
  }, [onComplete]);
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Stars background */}
      {stars}
      
      {/* Title animation */}
      <div className="text-center z-10">
        <h1 className="text-7xl font-bold chrome-gradient relative">
          {Array.from("TINOR").map((letter, index) => (
            <AnimatedLetter
              key={index}
              letter={letter}
              delay={splashStage === 'entering' 
                ? `${index * 0.15}s` 
                : `${index * 0.1}s`}
              stage={splashStage}
            />
          ))}
        </h1>
        <div className="mt-4">
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;