import { useState, useEffect } from 'react';

type ColorScheme = 'light' | 'dark';

/**
 * A hook to handle color scheme preferences
 * Detects the user's system preference and allows for manual toggling
 */
export function useColorScheme(initialScheme?: ColorScheme) {
  // Initialize with the provided scheme or detect from system preferences
  const [colorMode, setColorMode] = useState<ColorScheme>(() => {
    // If a specific scheme is provided, use that
    if (initialScheme) return initialScheme;
    
    // Check for system preference if in browser environment
    if (typeof window !== 'undefined') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
      return systemPreference;
    }
    
    // Default to dark if not in browser or preference can't be determined
    return 'dark';
  });
  
  // Listen for changes in color scheme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setColorMode(e.matches ? 'dark' : 'light');
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Toggle function
  const toggleColorMode = () => {
    setColorMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
    isDark: colorMode === 'dark',
    isLight: colorMode === 'light'
  };
}

export default useColorScheme;