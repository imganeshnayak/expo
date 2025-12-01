export const theme = {
  colors: {
    // Base colors
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceLight: '#2A2A2A',
    surfaceElevated: '#333333',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#666666',
    textTertiary: '#999999',

    // Accent colors
    primary: '#00D9A3',
    primaryDark: '#00B88A',
    primaryLight: '#00F0B8',

    // Secondary colors
    secondary: '#00D9A3',
    secondaryDark: '#00B88A',
    secondaryLight: '#00F0B8',

    // Accent colors
    accent: '#00D9A3',
    accentDark: '#00B88A',

    // Semantic colors
    error: '#FF4444',
    warning: '#F7B731',
    success: '#00D9A3',
    info: '#45B7D1',

    // Gradients
    gradientPrimary: ['#00D9A3', '#00F0B8'] as const,
    gradientSecondary: ['#1A1A1A', '#2A2A2A'] as const,
    gradientAccent: ['#00D9A3', '#45B7D1'] as const,
    gradientSuccess: ['#00D9A3', '#00F0B8'] as const,
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
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 999,
  },

  fontSize: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 28,
  },

  fontFamily: {
    primary: 'Belanosima',
    heading: 'EricaOne',
    system: 'System',
  },

  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    xl: {
      shadowColor: '#00D9A3',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 12,
    },
  },

  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};
