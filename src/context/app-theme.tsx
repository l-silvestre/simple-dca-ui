import { useMediaQuery } from '@mui/material';
import { darkTheme } from '@themes/dark.theme';
import { lightTheme } from '@themes/light.theme';
import { ThemeProvider } from '@mui/material/styles';
import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';

type themeOptions = 'light' | 'dark';
interface IAppThemeContext {
  currentTheme: themeOptions;
  toggleTheme: () => void;
}

export const AppThemeContext = createContext<IAppThemeContext>({
  currentTheme: 'light',
  toggleTheme: () => undefined,
});

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersLightMode = useMediaQuery('(prefers-color-scheme: light)');
  const [mode, setMode] = useState<themeOptions>('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);
  const value = useMemo(() => ({ currentTheme: mode, toggleTheme }), [mode, toggleTheme]);

  useEffect(() => {
    if (prefersDarkMode) {
      setMode('dark');
    }
  }, [prefersDarkMode]);

  useEffect(() => {
    if(prefersLightMode) {
      setMode('light');
    }
  }, [prefersLightMode]);

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppThemeContext.Provider>
  );
};
