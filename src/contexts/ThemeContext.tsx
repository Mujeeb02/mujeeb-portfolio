import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Always start with 'dark' to match server render and avoid hydration mismatch
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isMounted, setIsMounted] = useState(false);

  // Read saved theme from localStorage AFTER hydration
  useEffect(() => {
    const saved = localStorage.getItem('site-theme') as Theme | null;
    if (saved && saved !== theme) {
      setThemeState(saved);
    }
    setIsMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem('site-theme', theme);
    const root = document.documentElement;
    if (theme === 'light') root.classList.add('site-light');
    else root.classList.remove('site-light');
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme: () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
        setTheme: setThemeState,
        isMounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
