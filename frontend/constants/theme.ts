// Utopia Premium Design System
// Inspired by CRED - Monochromatic sophistication with subtle neon accents

// Dark Theme Colors (Primary) - CRED-inspired
export const darkColors = {
  // Background layers - Pure blacks and deep grays
  background: '#0D0D0D',        // Almost pure black
  surface: '#1A1A1A',           // Elevated surface
  surfaceLight: '#242424',      // Lighter elevated
  surfaceHighlight: '#2E2E2E',  // Hover/active states

  // Text hierarchy - High contrast
  text: '#FFFFFF',              // Pure white for primary text
  textSecondary: '#B3B3B3',     // Light gray for secondary
  textTertiary: '#808080',      // Medium gray for tertiary
  textDisabled: '#4D4D4D',      // Dark gray for disabled

  // Neon accent (CRED-inspired subtle cyan/green)
  primary: '#00F5A0',           // Neon cyan-green (CRED's signature)
  primaryDark: '#00D98E',       // Darker variant
  primaryLight: 'rgba(0, 245, 160, 0.1)',  // Subtle glow

  // Semantic colors - Refined
  success: '#00F5A0',           // Same as primary for consistency
  successLight: 'rgba(0, 245, 160, 0.08)',
  warning: '#FFB800',           // Warm amber
  error: '#FF3B3B',             // Bright red
  info: '#00D4FF',              // Cyan

  // Borders and dividers - Subtle
  border: '#2E2E2E',
  divider: 'rgba(255, 255, 255, 0.06)',

  // Shadow
  shadow: '#000000',

  // Gradients - Minimal, subtle
  gradientPrimary: ['#00F5A0', '#00D98E'] as const,
  gradientDark: ['#0D0D0D', '#1A1A1A'] as const,
  gradientNeon: ['rgba(0, 245, 160, 0.2)', 'rgba(0, 245, 160, 0)'] as const,
};

// Light Theme Colors (Secondary)
export const lightColors = {
  // Background layers - Pure whites and soft grays
  background: '#FFFFFF',
  surface: '#F7F7F7',
  surfaceLight: '#F0F0F0',
  surfaceHighlight: '#E8E8E8',

  // Text hierarchy
  text: '#0D0D0D',
  textSecondary: '#4D4D4D',
  textTertiary: '#808080',
  textDisabled: '#B3B3B3',

  // Neon accent (same for consistency)
  primary: '#00D98E',           // Slightly darker for light mode
  primaryDark: '#00C27D',
  primaryLight: 'rgba(0, 217, 142, 0.1)',

  // Semantic colors
  success: '#00D98E',
  successLight: 'rgba(0, 217, 142, 0.08)',
  warning: '#FFB800',
  error: '#FF3B3B',
  info: '#00D4FF',

  // Borders and dividers
  border: '#E8E8E8',
  divider: 'rgba(0, 0, 0, 0.06)',

  // Shadow
  shadow: '#000000',

  // Gradients
  gradientPrimary: ['#00D98E', '#00C27D'] as const,
  gradientDark: ['#F7F7F7', '#F0F0F0'] as const,
  gradientNeon: ['rgba(0, 217, 142, 0.15)', 'rgba(0, 217, 142, 0)'] as const,
};

export const theme = {
  colors: darkColors, // Default to dark for premium feel

  // Typography - Clean and modern (CRED uses custom fonts, we'll use system)
  fontFamily: {
    display: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, Consolas, "Courier New", monospace',
  },

  fontSize: {
    // Display sizes
    displayXl: 48,
    displayLg: 40,
    displayMd: 32,

    // Headings
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,

    // Body
    bodyLg: 17,
    bodyMd: 15,
    bodySm: 13,

    // Utility
    caption: 11,
    overline: 10,

    // Legacy support
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
    heavy: '800' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },

  // Spacing (8pt grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 40,
    xxxxxl: 48,
  },

  // Border Radius - CRED uses more rounded corners
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,       // More rounded
    lg: 20,       // More rounded
    xl: 24,       // More rounded
    xxl: 28,      // More rounded
    full: 9999,
    round: 999,
  },

  // Shadows - Very subtle, CRED-style
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.08)',
    sm: '0 2px 8px rgba(0, 0, 0, 0.12)',
    md: '0 4px 16px rgba(0, 0, 0, 0.16)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.20)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.24)',

    // Neon glow (very subtle)
    neon: '0 0 20px rgba(0, 245, 160, 0.15)',
    neonStrong: '0 0 30px rgba(0, 245, 160, 0.25)',
  },

  // Transitions - Smooth like CRED
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Export light theme variant
export const lightTheme = {
  ...theme,
  colors: lightColors,
};
