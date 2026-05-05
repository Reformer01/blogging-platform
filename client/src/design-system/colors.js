/**
 * Color Design Tokens
 * Modern & Premium aesthetic with Slate base + Electric Blue accent
 */

export const colors = {
  // Base Palette (Slate)
  slate: {
    950: '#020617',
    900: '#0f172a',
    800: '#1e293b',
    700: '#334155',
    600: '#475569',
    500: '#64748b',
    400: '#94a3b8',
    300: '#cbd5e1',
    200: '#e2e8f0',
    100: '#f1f5f9',
  },

  // Accent: Electric Blue
  accent: {
    light: '#06b6d4',   // Cyan
    base: '#0ea5e9',    // Electric Blue (primary)
    dark: '#0284c7',    // Dark Blue
  },

  // Semantic Colors
  semantic: {
    success: '#10b981',  // Emerald
    error: '#ef4444',    // Rose
    warning: '#f59e0b',  // Amber
  },

  // Text Colors
  text: {
    primary: '#e2e8f0',    // Slate 200
    secondary: '#94a3b8',  // Slate 400
    muted: '#64748b',      // Slate 500
  },

  // Background Colors
  bg: {
    base: '#0f172a',      // Slate 900
    elevated: '#1e293b',  // Slate 800
    hover: '#334155',     // Slate 700
  },

  // Border & Divider
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
  },

  // Glass Effect (used in liquid glass components)
  glass: {
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },

  // Transparent/Overlay
  overlay: {
    light: 'rgba(0, 0, 0, 0.2)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },
};

/**
 * CSS Custom Properties Export
 * Generates CSS variable declarations for use in base.css
 */
export function generateCSSVariables() {
  const vars = {};

  // Flatten color object to CSS variables
  Object.entries(colors).forEach(([category, shades]) => {
    if (typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, value]) => {
        vars[`--color-${category}-${shade}`] = value;
      });
    }
  });

  return vars;
}
