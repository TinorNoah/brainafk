import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect, lazy, Suspense } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Tinor - Personal Website" },
    { name: "description", content: "Welcome to my personal space on the web. Connect with me through various social platforms!" },
  ];
};

// Star component for the twinkling background
const Star = ({ size, top, left, delay }: { size: number, top: string, left: string, delay: string }) => (
  <div 
    className="absolute rounded-full bg-white animate-twinkle"
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      top, 
      left, 
      animationDelay: delay,
      opacity: Math.random() * 0.7 + 0.3
    }}
  />
);

// Lazy load the DinoGame component to reduce initial load time
const DinoGame = lazy(() => import('~/components/DinoGame'));

export default function Index() {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('dark');
  const [hoverIcon, setHoverIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stars, setStars] = useState<React.ReactNode[]>([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [splashStage, setSplashStage] = useState<'entering' | 'exiting'>("entering");
  const [showDinoGame, setShowDinoGame] = useState(false);
  
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
  
  // Updated loading animation sequence with reduced delay
  useEffect(() => {
    // First we let the letters fall individually (allow more time for animation)
    // Each letter takes 0.7s to fall, plus 0.15s delay between letters
    // So for all 5 letters: ~1.5s
    // Then we pause for ONLY 0.3s (reduced from 0.8s) to show the complete word
    
    const enterAndStayDuration = 1.5 + 0.3; // ~1.5s for all letters + 0.3s pause
    
    const startExitTimer = setTimeout(() => {
      setSplashStage('exiting');
    }, enterAndStayDuration * 1000);
    
    // Complete exit animation needs to account for all letters falling in sequence
    // Last letter has a 0.4s delay (4 * 0.1s) and takes 0.3s to fall
    // Buffer reduced from 0.2s to 0.1s
    const exitDuration = (4 * 0.1) + 0.3 + 0.1; // Last letter delay + animation time + buffer (reduced)
    
    const completeExitTimer = setTimeout(() => {
      setIsLoading(false);
    }, (enterAndStayDuration + exitDuration) * 1000);
    
    return () => {
      clearTimeout(startExitTimer);
      clearTimeout(completeExitTimer);
    };
  }, []);
  
  // Listen for changes in color scheme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setColorMode(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Set pageLoaded after initial render
  useEffect(() => {
    setPageLoaded(true);
  }, []);
  
  const toggleColorMode = () => {
    setColorMode(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const socialLinks = [
    { 
      name: 'Discord', 
      url: 'https://discord.gg/ukdfjvYsKa', 
      icon: '/discord.svg', 
      color: 'bg-[#5865F2]/20 border border-[#5865F2]/50 hover:bg-[#5865F2]/30' 
    },
    { 
      name: 'Instagram', 
      url: 'https://www.instagram.com/tinor_noah/', 
      icon: '/instagram.svg', 
      color: 'bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-yellow-500/20 border border-pink-500/50 hover:from-purple-500/30 hover:via-pink-500/30 hover:to-yellow-500/30' 
    },
    { 
      name: 'YouTube', 
      url: 'https://www.youtube.com/@tinornoah', 
      icon: '/youtube.svg', 
      color: 'bg-red-600/20 border border-red-600/50 hover:bg-red-600/30' 
    },
    { 
      name: 'X', 
      url: 'https://x.com/home', 
      icon: '/x.svg', 
      color: 'bg-neutral-800 border border-neutral-700 hover:bg-neutral-700',
      iconClass: 'filter invert brightness-0 invert' 
    },
    { 
      name: 'Facebook', 
      url: 'https://www.facebook.com/ronit.lohan.1', 
      icon: '/facebook.svg', 
      color: 'bg-[#1877F2]/20 border border-[#1877F2]/50 hover:bg-[#1877F2]/30' 
    },
    { 
      name: 'Reddit', 
      url: 'https://www.reddit.com/user/TinorNoah/', 
      icon: '/reddit.svg', 
      color: 'bg-orange-600/20 border border-orange-600/50 hover:bg-orange-600/30' 
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {stars}
        <div className="text-center z-10">
          <h1 className="text-7xl font-bold chrome-gradient relative">
            {Array.from("TINOR").map((letter, index) => {
              // Fix animation implementation to avoid style conflicts
              let className = ""; 
              let style = {};
              
              if (splashStage === 'entering') {
                className = "fall-from-top";
                // Use customStyle instead of direct animationDelay
                style = { 
                  '--delay': `${index * 0.15}s`,
                } as React.CSSProperties;
              } else {
                className = "fall-down";
                style = { 
                  '--delay': `${index * 0.1}s`,
                } as React.CSSProperties;
              }
              
              return (
                <span 
                  key={index} 
                  className={className}
                  style={style}
                  data-text={letter}
                >
                  {letter}
                </span>
              );
            })}
          </h1>
          <div className="mt-4">
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Stars background */}
      {stars}
      
      {/* Theme toggle button */}
      <button 
        onClick={toggleColorMode}
        className="fixed top-4 right-4 p-3 rounded-full bg-gray-800 border border-gray-600 text-xl transition-all duration-300 hover:rotate-12 hover:bg-gray-700 hover:border-gray-500 z-10 shadow-lg"
        aria-label="Toggle theme"
      >
        {colorMode === 'light' ? '🌙' : '☀️'}
      </button>
      
      <div className="container mx-auto px-4 py-16 flex flex-col items-center relative z-10">
        {/* Fun animated header with bouncy effect for the Tinor text */}
        <div className="mb-8 text-center">
          <h1 className="text-6xl md:text-7xl font-bold chrome-gradient transition-all duration-300 hover:scale-105 cursor-pointer">
            {Array.from("Tinor").map((letter, index) => (
              <span 
                key={index} 
                className={`inline-block ${pageLoaded ? 'bouncy-entrance' : 'opacity-0'} ${
                  index === 0 ? 'relative group' : ''
                }`}
                style={{ 
                  '--delay': `${index * 0.05}s`, // Use CSS variable
                  ...(index === 0 ? {
                    transition: 'all 0.3s ease',
                  } : {})
                } as React.CSSProperties}
                data-text={letter}
                onClick={index === 0 ? () => setShowDinoGame(true) : undefined}
                onKeyDown={index === 0 ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setShowDinoGame(true);
                  }
                } : undefined}
                tabIndex={index === 0 ? 0 : undefined}
                role={index === 0 ? "button" : undefined}
                aria-label={index === 0 ? "Play Dino Game" : undefined}
              >
                {letter}
                {index === 0 && (
                  <>
                    {/* Easter egg hover effect for the T */}
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-md"></span>
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20 pointer-events-none">
                      Click for a surprise!
                    </span>
                  </>
                )}
              </span>
            ))}
          </h1>
          <div className="mt-2 text-2xl font-medium text-gray-300">
            Welcome to my digital playground!
          </div>
        </div>
        
        {/* Dino Game Modal */}
        {showDinoGame && (
          <Suspense fallback={<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">Loading game...</div>}>
            <DinoGame onClose={() => setShowDinoGame(false)} />
          </Suspense>
        )}
        
        {/* Brief intro - removed animation */}
        <div className="max-w-2xl text-center mb-12 p-6 bg-gray-900/70 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="text-xl text-gray-300">
            Hey there! I&apos;m passionate about creating fun and interactive experiences on the web.
            Feel free to explore and connect with me through any of my social platforms below.
          </p>
        </div>
        
        {/* Social media grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-3xl">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link.color} ${hoverIcon === link.name ? 'scale-105' : ''} 
                p-5 rounded-lg shadow-lg relative overflow-hidden
                text-white transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
              onMouseEnter={() => setHoverIcon(link.name)}
              onMouseLeave={() => setHoverIcon(null)}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="w-full flex justify-start mb-2">
                  <img 
                    src={link.icon} 
                    alt={`${link.name} logo`} 
                    className={`w-8 h-8 rotate-[-5deg] transform-gpu ${link.iconClass || ''}`}
                  />
                </div>
                <span className="font-medium">{link.name}</span>
              </div>
            </a>
          ))}
        </div>
        
        {/* Contact CTA */}
        <div className="mt-16">
          <a 
            href="mailto:tinornoah@gmail.com" 
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-blue-500/20 hover:shadow-xl transition-all duration-300 border border-blue-400/30"
          >
            <span className="mr-2 group-hover:animate-bounce">✉️</span>
            <span>Get In Touch</span>
          </a>
        </div>
      </div>
    </div>
  );
}
