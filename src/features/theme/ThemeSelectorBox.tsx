import React from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PaletteIcon from '@mui/icons-material/Palette';
import CheckIcon from '@mui/icons-material/Check';
import { useColorTheme, THEME_PRESETS, type ThemePreset } from '../../context/ColorThemeContext';

export const ThemeSelectorBox: React.FC = () => {
  const { mode, preset, setMode, setPreset } = useColorTheme();
  const isDark = mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '20px',
        bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)',
        boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(31, 38, 135, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(143, 0, 255, 0.25)',
            }}
          >
            <PaletteIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
            Color Theme
          </Typography>
        </Stack>

        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'capitalize' }}>
          {mode}
        </Typography>
      </Stack>

      {/* Mode Switcher Buttons */}
      <Box
        sx={{
          display: 'flex',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(0, 0, 0, 0.04)',
          borderRadius: '12px',
          p: 0.5,
          gap: 0.5,
        }}
      >
        <IconButton
          size="small"
          onClick={() => setMode('light')}
          sx={{
            flex: 1,
            borderRadius: '10px',
            bgcolor: !isDark ? '#FFFFFF' : 'transparent',
            color: !isDark ? 'primary.main' : 'text.secondary',
            boxShadow: !isDark ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s ease',
            py: 0.5,
            gap: 0.75,
            '&:hover': {
              bgcolor: !isDark ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <LightModeIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
            Light
          </Typography>
        </IconButton>

        <IconButton
          size="small"
          onClick={() => setMode('dark')}
          sx={{
            flex: 1,
            borderRadius: '10px',
            bgcolor: isDark ? 'primary.main' : 'transparent',
            color: isDark ? '#FFFFFF' : 'text.secondary',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.2s ease',
            py: 0.5,
            gap: 0.75,
            '&:hover': {
              bgcolor: isDark ? 'primary.main' : 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <DarkModeIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
            Dark
          </Typography>
        </IconButton>
      </Box>

      {/* Accent Color Palette Selector */}
      <Stack spacing={0.75}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.7rem' }}>
          Accent Palette
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="space-between">
          {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((key) => {
            const presetConfig = THEME_PRESETS[key];
            const isSelected = preset === key;

            return (
              <Tooltip key={key} title={presetConfig.name} arrow placement="top">
                <Box
                  onClick={() => setPreset(key)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${presetConfig.primary} 0%, ${presetConfig.primaryDark} 100%)`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected ? `0 0 0 2px ${presetConfig.primary}, 0 4px 12px ${presetConfig.primary}40` : 'none',
                    transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                    '&:hover': {
                      transform: 'scale(1.15)',
                    },
                  }}
                >
                  {isSelected && <CheckIcon sx={{ color: '#FFFFFF', fontSize: 14 }} />}
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
};
