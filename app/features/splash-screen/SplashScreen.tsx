import React, { useEffect, useRef, useState } from 'react';
import { createTimeline, stagger } from 'animejs';
import Star from '~/components/ui/Star';

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * Animated splash screen component with the "TINOR" text animation
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stars, setStars] = useState<React.ReactNode[]>([]);
  const letterRefs = useRef<HTMLElement[]>([]);

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

  // Animate letters using anime.js timeline
  useEffect(() => {
    const timeline = createTimeline();
    // entrance with pronounced rubbery bounce
    timeline
      .add(
        letterRefs.current,
        {
          delay: stagger(300), // tighter exit stagger
          keyframes: [
            { translateY: '-100vh', opacity: 0, scaleY: 1, scaleX: 1 },
            { translateY: '15vh', opacity: 1, scaleY: 0.7, scaleX: 1.3, duration: 600, easing: 'easeOutQuad' },
            { translateY: '-5vh', scaleY: 1.2, scaleX: 0.8, duration: 400, easing: 'easeInOutQuad' },
            { translateY: '0vh', scaleY: 1, scaleX: 1, duration: 400, easing: 'easeOutBounce' },
          ],
        }
      )
      .add(
        letterRefs.current,
        {
          translateY: ['0vh', '50vh'],
          opacity: [1, 0],
          duration: 400,
          easing: 'easeInQuad',
          delay: stagger(150),
          onComplete: () => {
            if (onComplete) onComplete();
          },
        }
      );
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Stars background */}
      {stars}

      {/* Title animation */}
      <div className="text-center z-10">
        <h1 className="text-7xl font-bold chrome-gradient relative">
          {Array.from('TINOR').map((letter, index) => (
            <span
              key={index}
              ref={el => { if (el) letterRefs.current[index] = el; }}
              style={{
                display: 'inline-block',
                opacity: 0,
                transform: 'translateY(-100vh)',
              }}
            >
              {letter}
            </span>
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