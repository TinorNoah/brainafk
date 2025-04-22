import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect, useRef } from "react";
import Star from "~/components/ui/Star";
import SplashScreen from "~/features/splash-screen/SplashScreen";
import { useColorScheme } from "~/hooks/useColorScheme";
import { animate } from "animejs";

export const meta: MetaFunction = () => {
  return [
    { title: "Tinor - Personal Website" },
    { name: "description", content: "Welcome to my personal space on the web. Connect with me through various social platforms!" },
  ];
};

export default function Index() {
  // Use our custom hook for color scheme management
  const { colorMode, toggleColorMode } = useColorScheme();
  
  const [hoverIcon, setHoverIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stars, setStars] = useState<React.ReactNode[]>([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
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
  
  // Set pageLoaded after initial render
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  useEffect(() => {
    if (buttonRef.current) {
      animate(
        {
          targets: buttonRef.current,
          scale: [0.7, 1],
          opacity: [0, 1],
        },
        {
          duration: 900,
          easing: "easeOutElastic(1, .8)",
        }
      );
    }
  }, []);
  
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
    return <SplashScreen onComplete={() => setIsLoading(false)} />;
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
      
      {/* Bargraph Page Button (top left) */}
      <div className="fixed top-4 left-4 z-20">
        <a
          ref={buttonRef}
          href="/bargraph"
          className="inline-block px-4 py-2 bg-gray-900/80 border border-pink-500/40 shadow-lg rounded-full text-sm relative overflow-visible group transition-all duration-300 hover:shadow-pink-500/30 hover:border-blue-400/60"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span className="relative z-10 flex items-center chrome-gradient font-bold">
            AI API PRICE
          </span>
          {/* Tooltip on hover */}
          {showTooltip && (
            <span className="absolute top-full left-0 mt-2 w-56 bg-gray-900 text-white text-xs rounded-lg shadow-lg px-4 py-2 z-20 border border-pink-400/40 animate-fade-in"
              style={{ minWidth: '12rem', maxWidth: '16rem' }}
            >
              Explore and compare the latest AI model API pricing for input and output tokens, with interactive charts and filters.
            </span>
          )}
        </a>
      </div>

      <div className="container mx-auto px-4 py-16 flex flex-col items-center relative z-10">
        {/* Fun animated header with bouncy effect for the Tinor text */}
        <div className="mb-8 text-center">
          <h1 className="text-6xl md:text-7xl font-bold chrome-gradient transition-all duration-300 hover:scale-105 cursor-pointer">
            {Array.from("TINOR").map((letter, index) => (
              <span 
                key={index} 
                className={`inline-block ${pageLoaded ? 'bouncy-entrance' : 'opacity-0'}`}
                style={{ 
                  '--delay': `${index * 0.05}s` // Use CSS variable
                } as React.CSSProperties}
                data-text={letter}
              >
                {letter}
              </span>
            ))}
          </h1>
          <div className="mt-2 text-2xl font-medium text-gray-300">
            Welcome to my digital playground!
          </div>
        </div>
        
        {/* Brief intro */}
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
