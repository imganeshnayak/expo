export const theme = {
  colors: {
    // Base colors
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceLight: '#2A2A2A',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#666666',
    textTertiary: '#999999',

    // Accent colors
    primary: '#00D9A3',
    primaryDark: '#00B88A',

    // Semantic colors
    error: '#FF4444',
    warning: '#F7B731',
    success: '#00D9A3',
    info: '#45B7D1',

    // Shadow color
    shadow: '#000000',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 999,
  },

  fontSize: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 28,
  },

  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
