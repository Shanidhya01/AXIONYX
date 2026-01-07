import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. Initialize state from LocalStorage immediately
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (targetTheme) => {
      // Remove both to prevent conflicts
      root.classList.remove('light', 'dark');
      root.classList.add(targetTheme);
    };

    // 2. Persist to storage
    localStorage.setItem('theme', theme);

    // 3. Logic for 'System'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Apply strictly based on OS preference
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      const listener = (e) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } 
    // 4. Logic for Manual 'Light' or 'Dark'
    else {
      applyTheme(theme);
    }

  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};