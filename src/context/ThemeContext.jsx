import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const DEFAULT_THEME = {
  primary: '#2f5dd1',
  secondary: '#c9a24b',
  third: '#0b1220',
};

const STORAGE_KEY = 'hr-theme-colors';
const MODE_STORAGE_KEY = 'hr-color-mode';

function deriveShades(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lighten = (factor) =>
    `#${[r, g, b]
      .map((c) => Math.min(255, Math.round(c + (255 - c) * factor)))
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')}`;
  const darken = (factor) =>
    `#${[r, g, b]
      .map((c) => Math.max(0, Math.round(c * (1 - factor))))
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')}`;
  return { light: lighten(0.88), dark: darken(0.25) };
}

function getSystemPreference() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const THEME_PRESETS = [
  { name: 'Default Blue', primary: '#2f5dd1', secondary: '#c9a24b', third: '#0b1220' },
  { name: 'Emerald', primary: '#059669', secondary: '#d97706', third: '#064e3b' },
  { name: 'Royal Purple', primary: '#7c3aed', secondary: '#ec4899', third: '#312e81' },
  { name: 'Slate Teal', primary: '#0d9488', secondary: '#f59e0b', third: '#134e4a' },
  { name: 'Crimson', primary: '#e11d48', secondary: '#3b82f6', third: '#881337' },
];

function applyThemeToDOM(colors, resolvedMode) {
  const root = document.documentElement;
  root.dataset.theme = resolvedMode;
  root.style.colorScheme = resolvedMode;

  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-third', colors.third);

  const primaryShades = deriveShades(colors.primary);
  const secondaryShades = deriveShades(colors.secondary);
  const thirdShades = deriveShades(colors.third);

  root.style.setProperty('--primary-600', colors.primary);
  root.style.setProperty('--primary-700', primaryShades.dark);
  root.style.setProperty('--primary-100', primaryShades.light);

  root.style.setProperty('--accent-500', colors.secondary);
  root.style.setProperty('--accent-300', secondaryShades.light);

  root.style.setProperty('--ink-900', colors.third);
  root.style.setProperty('--ink-800', thirdShades.light);
  root.style.setProperty('--ink-700', deriveShades(colors.third).light);
}

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [colors, setColors] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_THEME, ...JSON.parse(stored) } : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  const [colorMode, setColorModeState] = useState(() => {
    try {
      const stored = localStorage.getItem(MODE_STORAGE_KEY);
      return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    } catch {
      return 'system';
    }
  });

  const [systemPreference, setSystemPreference] = useState(getSystemPreference);
  const [showSettings, setShowSettings] = useState(false);

  const resolvedMode = useMemo(() => {
    if (colorMode === 'system') return systemPreference;
    return colorMode;
  }, [colorMode, systemPreference]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemPreference(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    applyThemeToDOM(colors, resolvedMode);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  }, [colors, resolvedMode]);

  useEffect(() => {
    localStorage.setItem(MODE_STORAGE_KEY, colorMode);
  }, [colorMode]);

  const updateColor = useCallback((key, value) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setColorMode = useCallback((mode) => {
    setColorModeState(mode);
  }, []);

  const setThemeColors = useCallback((newColors) => {
    setColors({ ...DEFAULT_THEME, ...newColors });
  }, []);

  const resetTheme = useCallback(() => {
    setColors(DEFAULT_THEME);
    setColorModeState('system');
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        colors,
        updateColor,
        setThemeColors,
        resetTheme,
        colorMode,
        setColorMode,
        resolvedMode,
        systemPreference,
        showSettings,
        setShowSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
