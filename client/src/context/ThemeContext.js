import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Define available themes
export const THEMES = {
  light: {
    name: 'Light',
    mode: 'light',
    colors: {
      bgPrimary: '#f5f7fa',
      bgSecondary: '#ffffff',
      textPrimary: '#1a202c',
      textSecondary: '#4a5568',
      borderColor: '#e2e8f0',
      cardBg: '#ffffff',
      inputBg: '#ffffff',
      hoverBg: '#f7fafc'
    }
  },
  dark: {
    name: 'Dark',
    mode: 'dark',
    colors: {
      bgPrimary: '#0f172a',
      bgSecondary: '#1e293b',
      textPrimary: '#f1f5f9',
      textSecondary: '#cbd5e1',
      borderColor: '#334155',
      cardBg: '#1e293b',
      inputBg: '#334155',
      hoverBg: '#334155'
    }
  },
  blue: {
    name: 'Ocean Blue',
    mode: 'light',
    colors: {
      bgPrimary: '#e0f2fe',
      bgSecondary: '#ffffff',
      textPrimary: '#0c4a6e',
      textSecondary: '#075985',
      borderColor: '#bae6fd',
      cardBg: '#ffffff',
      inputBg: '#f0f9ff',
      hoverBg: '#e0f2fe'
    }
  },
  purple: {
    name: 'Royal Purple',
    mode: 'light',
    colors: {
      bgPrimary: '#f3e8ff',
      bgSecondary: '#ffffff',
      textPrimary: '#581c87',
      textSecondary: '#6b21a8',
      borderColor: '#e9d5ff',
      cardBg: '#ffffff',
      inputBg: '#faf5ff',
      hoverBg: '#f3e8ff'
    }
  },
  green: {
    name: 'Forest Green',
    mode: 'light',
    colors: {
      bgPrimary: '#dcfce7',
      bgSecondary: '#ffffff',
      textPrimary: '#14532d',
      textSecondary: '#166534',
      borderColor: '#bbf7d0',
      cardBg: '#ffffff',
      inputBg: '#f0fdf4',
      hoverBg: '#dcfce7'
    }
  },
  sunset: {
    name: 'Sunset',
    mode: 'light',
    colors: {
      bgPrimary: '#fff7ed',
      bgSecondary: '#ffffff',
      textPrimary: '#7c2d12',
      textSecondary: '#9a3412',
      borderColor: '#fed7aa',
      cardBg: '#ffffff',
      inputBg: '#fffbeb',
      hoverBg: '#fff7ed'
    }
  },
  ocean: {
    name: 'Deep Ocean',
    mode: 'dark',
    colors: {
      bgPrimary: '#0c4a6e',
      bgSecondary: '#075985',
      textPrimary: '#e0f2fe',
      textSecondary: '#bae6fd',
      borderColor: '#0284c7',
      cardBg: '#075985',
      inputBg: '#0c4a6e',
      hoverBg: '#0284c7'
    }
  },
  midnight: {
    name: 'Midnight',
    mode: 'dark',
    colors: {
      bgPrimary: '#1e1b4b',
      bgSecondary: '#312e81',
      textPrimary: '#e0e7ff',
      textSecondary: '#c7d2fe',
      borderColor: '#4f46e5',
      cardBg: '#312e81',
      inputBg: '#1e1b4b',
      hoverBg: '#4f46e5'
    }
  },
  emerald: {
    name: 'Emerald',
    mode: 'dark',
    colors: {
      bgPrimary: '#064e3b',
      bgSecondary: '#065f46',
      textPrimary: '#d1fae5',
      textSecondary: '#a7f3d0',
      borderColor: '#059669',
      cardBg: '#065f46',
      inputBg: '#064e3b',
      hoverBg: '#059669'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    const savedTheme = localStorage.getItem('themeName');
    return savedTheme || 'light';
  });

  const theme = THEMES[themeName] || THEMES.light;

  useEffect(() => {
    localStorage.setItem('themeName', themeName);
    const root = document.documentElement;
    
    // Apply theme colors
    root.style.setProperty('--bg-primary', theme.colors.bgPrimary);
    root.style.setProperty('--bg-secondary', theme.colors.bgSecondary);
    root.style.setProperty('--text-primary', theme.colors.textPrimary);
    root.style.setProperty('--text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--border-color', theme.colors.borderColor);
    root.style.setProperty('--card-bg', theme.colors.cardBg);
    root.style.setProperty('--input-bg', theme.colors.inputBg);
    root.style.setProperty('--hover-bg', theme.colors.hoverBg);
    
    // Set theme mode for compatibility
    document.documentElement.setAttribute('data-theme', theme.mode);
  }, [themeName, theme]);

  const toggleTheme = () => {
    // Toggle between light and dark modes
    const currentTheme = THEMES[themeName];
    if (currentTheme.mode === 'light') {
      setThemeName('dark');
    } else {
      setThemeName('light');
    }
  };

  const value = {
    theme: themeName,
    themeData: theme,
    setTheme: setThemeName,
    toggleTheme,
    isDark: theme.mode === 'dark',
    availableThemes: THEMES
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
