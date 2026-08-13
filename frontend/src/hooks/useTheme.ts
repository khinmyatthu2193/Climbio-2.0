import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
const themeKey = 'climbio-theme';

function initialTheme(): Theme {
  const saved = localStorage.getItem(themeKey);
  if (saved === 'light' || saved === 'dark') return saved;
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(themeKey, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light'),
  };
}
