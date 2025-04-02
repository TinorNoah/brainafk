import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Tinor Noah - Personal Website" },
    { name: "description", content: "Welcome to my personal space on the web. Connect with me through various social platforms!" },
  ];
};

export default function Index() {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [hoverIcon, setHoverIcon] = useState<string | null>(null);
  
  // Check system preference on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setColorMode('dark');
    }
    
    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setColorMode(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleColorMode = () => {
    setColorMode(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const socialLinks = [
    { name: 'Discord', url: 'https://discord.gg/ukdfjvYsKa', icon: '👾', color: 'bg-indigo-500' },
    { name: 'Instagram', url: 'https://www.instagram.com/tinor_noah/', icon: '📸', color: 'bg-pink-500' },
    { name: 'YouTube', url: 'https://www.youtube.com/@tinornoah', icon: '🎬', color: 'bg-red-500' },
    { name: 'Twitter', url: 'https://x.com/home', icon: '🐦', color: 'bg-blue-400' },
    { name: 'Facebook', url: 'https://www.facebook.com/ronit.lohan.1', icon: '👍', color: 'bg-blue-600' },
    { name: 'Reddit', url: 'https://www.reddit.com/user/TinorNoah/', icon: '🤖', color: 'bg-orange-500' },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colorMode === 'light' ? 'from-blue-100 via-purple-50 to-pink-100' : 'from-gray-900 via-purple-900 to-gray-800'} transition-all duration-500`}>
      {/* Theme toggle button */}
      <button 
        onClick={toggleColorMode}
        className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-xl transition-transform hover:rotate-12"
        aria-label="Toggle theme"
      >
        {colorMode === 'light' ? '🌙' : '☀️'}
      </button>
      
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        {/* Fun animated header */}
        <div className="mb-8 text-center">
          <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
            Tinor Noah
          </h1>
          <div className="mt-2 text-2xl font-medium text-gray-700 dark:text-gray-300">
            Welcome to my digital playground!
          </div>
        </div>
        
        {/* Brief intro */}
        <div className="max-w-2xl text-center mb-12 p-6 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="text-xl text-gray-700 dark:text-gray-300">
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
                p-5 rounded-lg shadow-lg flex flex-col items-center justify-center 
                text-white transition-all duration-300 hover:shadow-xl`}
              onMouseEnter={() => setHoverIcon(link.name)}
              onMouseLeave={() => setHoverIcon(null)}
            >
              <span className="text-4xl mb-2">{link.icon}</span>
              <span className="font-medium">{link.name}</span>
            </a>
          ))}
        </div>
        
        {/* Contact CTA */}
        <div className="mt-16">
          <a 
            href="mailto:tinornoah@gmail.com" 
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-full hover:shadow-lg transition-all duration-300"
          >
            <span className="mr-2 group-hover:animate-bounce">✉️</span>
            <span>Get In Touch</span>
          </a>
        </div>
        
        {/* Footer */}
        <footer className="mt-20 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Tinor Noah. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
