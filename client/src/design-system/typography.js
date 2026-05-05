/**
 * Typography Design Tokens
 * Premium typeface pairing: Geist + Cabinet Grotesk + JetBrains Mono
 */

export const typography = {
  // Font Families
  fontFamily: {
    display: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    heading: '"Cabinet Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Courier New", monospace',
  },

  // Font Sizes (using clamp for fluid scaling)
  fontSize: {
    xs: 'clamp(0.75rem, 1vw, 0.875rem)',
    sm: 'clamp(0.875rem, 1.25vw, 1rem)',
    base: 'clamp(1rem, 1.5vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1.75vw, 1.375rem)',
    xl: 'clamp(1.375rem, 2vw, 1.75rem)',
    '2xl': 'clamp(1.75rem, 2.5vw, 2.25rem)',
    '3xl': 'clamp(2.25rem, 3vw, 3rem)',
    '4xl': 'clamp(2.5rem, 4vw, 3.5rem)',
    '5xl': 'clamp(3rem, 5vw, 5.5rem)', // Hero Display
    '6xl': 'clamp(3.5rem, 6vw, 7rem)',
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.1',
    snug: '1.2',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },

  // Letter Spacing (tracking)
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
  },

  // Typographic Styles (presets)
  styles: {
    // Display: Hero H1
    displayHero: {
      fontFamily: '"Geist"',
      fontSize: 'clamp(3rem, 5vw, 5.5rem)',
      fontWeight: 700,
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
    },

    // Heading 1
    h1: {
      fontFamily: '"Cabinet Grotesk"',
      fontSize: 'clamp(2rem, 4vw, 3.5rem)',
      fontWeight: 700,
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },

    // Heading 2
    h2: {
      fontFamily: '"Cabinet Grotesk"',
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: '1.3',
      letterSpacing: '-0.005em',
    },

    // Heading 3
    h3: {
      fontFamily: '"Cabinet Grotesk"',
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: '1.3',
      letterSpacing: '-0.005em',
    },

    // Body text
    body: {
      fontFamily: '"Geist"',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: '1.75',
      letterSpacing: '0em',
    },

    // Small text
    small: {
      fontFamily: '"Geist"',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.5',
      letterSpacing: '0em',
    },

    // Code/Mono
    code: {
      fontFamily: '"JetBrains Mono"',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.5',
      letterSpacing: '0em',
    },

    // Mono data (metrics, timestamps)
    monoData: {
      fontFamily: '"JetBrains Mono"',
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: '1.4',
      letterSpacing: '0.05em',
    },
  },
};

/**
 * Generate CSS Custom Properties for typography
 */
export function generateTypographyVars() {
  const vars = {};

  Object.entries(typography.fontSize).forEach(([key, value]) => {
    vars[`--font-size-${key}`] = value;
  });

  Object.entries(typography.fontFamily).forEach(([key, value]) => {
    vars[`--font-family-${key}`] = value;
  });

  return vars;
}
