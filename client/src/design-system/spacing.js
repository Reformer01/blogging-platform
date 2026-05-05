/**
 * Spacing Design Tokens
 * 4px grid-based spacing system for consistency
 */

export const spacing = {
  // Base units (multiples of 4px)
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
  '4xl': '4rem',    // 64px
  '5xl': '6rem',    // 96px
  '6xl': '8rem',    // 128px
  '7xl': '10rem',   // 160px

  // Shorthand for component padding/margin
  padding: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
  },

  gap: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
  },

  // Section vertical spacing (AIDA structure)
  section: {
    // Mobile: less space
    verticalMobile: '3rem',      // py-12
    // Tablet: medium space
    verticalTablet: '6rem',      // py-24
    // Desktop: maximum space
    verticalDesktop: '8rem',     // py-32
    verticalHero: '12rem',       // py-48 (hero sections)
  },

  // Container max-widths (paired with padding)
  container: {
    sm: 'calc(100% - 2rem)',     // Full width minus padding
    md: '28rem',                 // 448px
    lg: '42rem',                 // 672px
    xl: '52rem',                 // 832px
    '2xl': '64rem',              // 1024px
    '3xl': '80rem',              // 1280px
    '4xl': '88rem',              // 1408px
  },

  // Responsive breakpoints (mobile-first)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

/**
 * Generate CSS Custom Properties for spacing
 */
export function generateSpacingVars() {
  const vars = {};

  Object.entries(spacing).forEach(([key, value]) => {
    if (typeof value === 'string') {
      vars[`--spacing-${key}`] = value;
    }
  });

  return vars;
}
