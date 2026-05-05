/**
 * Shadow & Elevation Design Tokens
 * 3-level elevation system for depth and hierarchy
 */

export const shadows = {
  // Subtle elevation (cards, minimal lift)
  subtle: 'box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);',

  // Medium elevation (interactive elements, hover states)
  medium:
    'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);',

  // Prominent elevation (modals, overlays, pinned sections)
  prominent:
    'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);',

  // Liquid Glass inner refraction effect
  glassInner: 'inset 0 1px 0 rgba(255, 255, 255, 0.1);',

  // Tinted shadows (match background hue)
  tinted: {
    // For Slate 900 backgrounds
    slate: 'box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.3);',
  },

  // Glow effect (accent color)
  accentGlow:
    'box-shadow: 0 0 20px rgba(14, 165, 233, 0.25), 0 4px 6px -1px rgba(0, 0, 0, 0.3);',

  // None (for elements that don't need elevation)
  none: 'box-shadow: none;',
};

/**
 * Tailwind Shadow Classes
 * Map to Tailwind utility classes for direct use
 */
export const shadowClasses = {
  subtle: 'shadow-sm',
  medium: 'shadow-lg',
  prominent: 'shadow-2xl',
  none: 'shadow-none',
};

/**
 * Get CSS shadow string
 */
export function getShadow(type = 'medium') {
  return shadows[type] || shadows.medium;
}
