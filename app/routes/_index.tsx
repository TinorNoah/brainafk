import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";

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

export default function Index() {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('dark');
  const [hoverIcon, setHoverIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stars, setStars] = useState<React.ReactNode[]>([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [splashStage, setSplashStage] = useState<'entering' | 'exiting'>("entering");
  
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
  
  // Updated loading animation with two stages
  useEffect(() => {
    // First stage: Enter the letters (1.5s)
    const enterTimer = setTimeout(() => {
      setSplashStage('exiting');
    }, 1500);
    
    // Second stage: Exit the splash screen after another 1s (total 2.5s)
    const exitTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
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
        <div className={`text-center z-10 ${splashStage === 'exiting' ? 'animate-fall-exit' : ''}`}>
          <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            {Array.from("TINOR").map((letter, index) => (
              <span 
                key={index} 
                className="inline-block animate-fall-from-top" 
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                  opacity: 0
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
        {/* Fun animated header with falling effect - ONLY for the Tinor text */}
        <div className="mb-8 text-center">
          <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 hover:bg-gradient-to-r hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 hover:scale-105 cursor-pointer">
            {Array.from("Tinor").map((letter, index) => (
              <span 
                key={index} 
                className={`inline-block ${pageLoaded ? 'animate-fall-in' : 'opacity-0'}`}
                style={{ 
                  animationDelay: `${index * 0.1}s` 
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
          <div className="mt-2 text-2xl font-medium text-gray-300">
            Welcome to my digital playground!
          </div>
        </div>
        
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
