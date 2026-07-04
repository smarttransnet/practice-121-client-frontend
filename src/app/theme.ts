import { createTheme, responsiveFontSizes } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    nav: {
      bg: string
      paper: string
      hover: string
      active: string
      activeText: string
      text: string
      subtleText: string
      border: string
    }
  }
  interface PaletteOptions {
    nav?: {
      bg: string
      paper: string
      hover: string
      active: string
      activeText: string
      text: string
      subtleText: string
      border: string
    }
  }
}

// Extensible theme configuration to support different themes later
export const ACTIVE_THEME = 'clinical'; // Easily toggle themes here

export const themeConfigs = {
  clinical: {
    primary: '#8F00FF',      // Vibrant Violet
    primaryLight: '#C180FF',
    primaryDark: '#5F00FF',
    secondary: '#3B82F6',    // Bright Azure
    success: '#10B981',      // Emerald Green
    warning: '#F97316',      // Coral Orange
    error: '#EF4444',        // Soft Red
    info: '#3B82F6',         // Blue
    bgDefault: 'transparent',
    bgPaper: 'rgba(255, 255, 255, 0.65)',
  },
  // You can easily add more themes here in the future
  emerald: {
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    secondary: '#2563EB',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
    bgDefault: 'transparent',
    bgPaper: 'rgba(255, 255, 255, 0.65)',
  }
};

const colors = themeConfigs[ACTIVE_THEME];

const baseTheme = createTheme({
  palette: {
    mode: 'light',
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
    success: { main: colors.success },
    warning: { main: colors.warning },
    error: { main: colors.error },
    info: { main: colors.info },
    background: {
      default: colors.bgDefault,
      paper: colors.bgPaper,
    },
    text: {
      primary: '#0B1220',
      secondary: '#64748B',
    },
    divider: 'rgba(143, 0, 255, 0.08)',
    nav: {
      bg: 'rgba(255, 255, 255, 0.5)',
      paper: 'rgba(255, 255, 255, 0.65)',
      hover: 'rgba(143, 0, 255, 0.06)',
      active: 'linear-gradient(135deg, #8F00FF 0%, #5F00FF 100%)',
      activeText: '#FFFFFF',
      text: '#0B1220',
      subtleText: '#64748B',
      border: 'rgba(255, 255, 255, 0.6)',
    },
  },
  typography: {
    fontFamily: ['Outfit', 'Roboto', 'Inter', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'].join(','),
    h4: { fontWeight: 800, letterSpacing: -0.4, color: '#0B1220' },
    h6: { fontWeight: 800, letterSpacing: -0.2, color: '#0B1220' },
    subtitle2: { fontWeight: 700, color: '#0B1220' },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 24 },
  shadows: (() => {
    const custom = [
      'none',
      '0px 4px 20px rgba(31, 38, 135, 0.03)',
      '0px 8px 32px rgba(31, 38, 135, 0.05)',
      '0px 12px 40px rgba(31, 38, 135, 0.08)',
      ...Array.from({ length: 21 }, () => '0px 12px 40px rgba(31, 38, 135, 0.08)'),
    ]
    return custom.slice(0, 25) as unknown as ReturnType<typeof createTheme>['shadows']
  })(),
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'transparent', // Let index.css mesh gradient show through
        },
      },
    },
    MuiAppBar: {
      defaultProps: { color: 'inherit', elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'transparent',
          borderBottom: 'none',
          backdropFilter: 'none',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'transparent',
          borderRight: 'none',
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0px 8px 32px rgba(31, 38, 135, 0.04)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0px 8px 32px rgba(31, 38, 135, 0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 12px 40px rgba(31, 38, 135, 0.07)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: '8px 18px',
          fontWeight: 700,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'medium', variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingTop: 10,
          paddingBottom: 10,
          margin: '4px 0',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          color: '#64748B',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #8F00FF 0%, #5F00FF 100%)',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(143, 0, 255, 0.25)',
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF',
            },
          },
          '&.Mui-selected:hover': {
            background: 'linear-gradient(135deg, #8F00FF 0%, #5F00FF 100%)',
            boxShadow: '0 6px 16px rgba(143, 0, 255, 0.35)',
          },
          '&:hover': {
            backgroundColor: 'rgba(143, 0, 255, 0.05)',
            color: '#8F00FF',
            '& .MuiListItemIcon-root': {
              color: '#8F00FF',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 38,
          color: '#64748B',
          transition: 'all 0.2s ease',
        },
      },
    },
  },
})

export const appTheme = responsiveFontSizes(baseTheme)


