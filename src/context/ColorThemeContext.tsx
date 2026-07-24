import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

export type ThemeMode = 'light' | 'dark';
export type ThemePreset = 'clinical' | 'emerald' | 'azure' | 'coral';

export interface ThemePresetConfig {
  name: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
}

export const THEME_PRESETS: Record<ThemePreset, ThemePresetConfig> = {
  clinical: {
    name: 'Clinical Violet',
    primary: '#8F00FF',
    primaryLight: '#C180FF',
    primaryDark: '#5F00FF',
    secondary: '#3B82F6',
  },
  emerald: {
    name: 'Emerald Green',
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    secondary: '#2563EB',
  },
  azure: {
    name: 'Ocean Azure',
    primary: '#2563EB',
    primaryLight: '#60A5FA',
    primaryDark: '#1D4ED8',
    secondary: '#8F00FF',
  },
  coral: {
    name: 'Sunset Coral',
    primary: '#F97316',
    primaryLight: '#FB923C',
    primaryDark: '#EA580C',
    secondary: '#8F00FF',
  },
};

interface ColorThemeContextType {
  mode: ThemeMode;
  preset: ThemePreset;
  setMode: (mode: ThemeMode) => void;
  setPreset: (preset: ThemePreset) => void;
  toggleMode: () => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export const ColorThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app_theme_mode');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const [preset, setPresetState] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem('app_theme_preset') as ThemePreset;
    return THEME_PRESETS[saved] ? saved : 'clinical';
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('app_theme_mode', newMode);
  };

  const setPreset = (newPreset: ThemePreset) => {
    setPresetState(newPreset);
    localStorage.setItem('app_theme_preset', newPreset);
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  // Synchronize body background class / style for dark mode mesh vs light mode mesh
  useEffect(() => {
    if (mode === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [mode]);

  const muiTheme = useMemo(() => {
    const colors = THEME_PRESETS[preset];
    const isDark = mode === 'dark';

    const theme = createTheme({
      palette: {
        mode,
        primary: {
          main: colors.primary,
          light: colors.primaryLight,
          dark: colors.primaryDark,
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: colors.secondary,
          contrastText: '#FFFFFF',
        },
        background: {
          default: isDark ? '#0B0F17' : 'rgba(255, 255, 255, 0)',
          paper: isDark ? 'rgba(18, 24, 38, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        },
        text: {
          primary: isDark ? '#F1F5F9' : '#0B1220',
          secondary: isDark ? '#94A3B8' : '#64748B',
        },
        divider: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(143, 0, 255, 0.08)',
      },
      typography: {
        fontFamily: ['Outfit', 'Roboto', 'Inter', 'system-ui', 'sans-serif'].join(','),
        h4: { fontWeight: 800, letterSpacing: -0.4 },
        h6: { fontWeight: 800, letterSpacing: -0.2 },
        subtitle2: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 700 },
      },
      shape: { borderRadius: 24 },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: 'transparent',
            },
          },
        },
        MuiPaper: {
          defaultProps: { elevation: 0 },
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              borderRadius: 24,
              backgroundColor: isDark ? 'rgba(18, 24, 38, 0.85)' : 'rgba(255, 255, 255, 0.90)',
              backdropFilter: 'blur(24px) saturate(200%)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 1)',
              boxShadow: isDark
                ? '0px 12px 40px rgba(0, 0, 0, 0.4)'
                : '0px 12px 40px rgba(0, 0, 0, 0.08), 0px 4px 10px rgba(0, 0, 0, 0.04), inset 0px 1px 0px rgba(255, 255, 255, 0.8)',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 24,
              backgroundColor: isDark ? 'rgba(18, 24, 38, 0.85)' : 'rgba(255, 255, 255, 0.90)',
              backdropFilter: 'blur(24px) saturate(200%)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 1)',
              boxShadow: isDark
                ? '0px 12px 40px rgba(0, 0, 0, 0.4)'
                : '0px 12px 40px rgba(0, 0, 0, 0.08), 0px 4px 10px rgba(0, 0, 0, 0.04), inset 0px 1px 0px rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: isDark
                  ? '0px 20px 50px rgba(0, 0, 0, 0.6)'
                  : '0px 20px 50px rgba(0, 0, 0, 0.12), 0px 8px 16px rgba(0, 0, 0, 0.06), inset 0px 1px 0px rgba(255, 255, 255, 1)',
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.4)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
              transition: 'all 0.2s ease',
              color: isDark ? '#F1F5F9' : '#0B1220',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.6)',
              },
              '&.Mui-focused': {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.8)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            },
          },
        },
      },
    });

    return responsiveFontSizes(theme);
  }, [mode, preset]);

  return (
    <ColorThemeContext.Provider value={{ mode, preset, setMode, setPreset, toggleMode }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorThemeContext.Provider>
  );
};

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
};
