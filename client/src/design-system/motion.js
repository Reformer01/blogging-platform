/**
 * Motion & Animation Design Tokens
 * GSAP Spring Physics + Framer Motion Configuration
 * MOTION_INTENSITY = 6 (Fluid CSS + entry animations)
 */

export const motion = {
  // Spring Physics (Premium, weighty feel)
  spring: {
    premium: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      mass: 1,
    },
    responsive: {
      type: 'spring',
      stiffness: 120,
      damping: 25,
      mass: 0.8,
    },
    bouncy: {
      type: 'spring',
      stiffness: 80,
      damping: 15,
      mass: 1,
    },
  },

  // Duration (milliseconds)
  duration: {
    instant: 150,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 700,
    glacial: 1000,
  },

  // Easing curves (Cubic Bezier)
  easing: {
    // No linear easing (banned per gpt-taste)
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    expo: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    smooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // GSAP ScrollTrigger Presets
  scrollTrigger: {
    reveal: {
      trigger: null, // Set dynamically
      start: 'top center',
      end: 'center center',
      scrub: false,
      markers: false,
    },
    pin: {
      trigger: null,
      pin: true,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
    scrubText: {
      trigger: null,
      scrub: 1,
      start: 'top center',
      end: 'center center',
    },
  },

  // Hover Effects (Tailwind-integrated)
  hover: {
    scale: '1.05',           // group-hover:scale-105
    duration: 'duration-500',
    transition: 'transition-all duration-500 ease-out',
  },

  // Stagger for list/grid animations
  stagger: {
    default: 0.1,   // 100ms between items
    fast: 0.05,     // 50ms
    slow: 0.15,     // 150ms
  },

  // Micro-animations (infinite)
  micro: {
    pulse: {
      animation: 'pulse 2s infinite',
      keyframes: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
    },
    shimmer: {
      animation: 'shimmer 2s infinite',
      keyframes: {
        '0%': { opacity: '0.2' },
        '50%': { opacity: '1' },
        '100%': { opacity: '0.2' },
      },
    },
    float: {
      animation: 'float 3s ease-in-out infinite',
      keyframes: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      },
    },
  },

  // GSAP Configuration
  gsap: {
    defaults: {
      duration: 0.5,
      ease: 'power3.out',
    },
    scrollDefaults: {
      scrub: 0,
      markers: false,
      once: false,
    },
  },
};

/**
 * GSAP Spring Physics Presets
 * Use with GSAP gsap.to() or Framer Motion
 */
export function getSpringPreset(type = 'premium') {
  return motion.spring[type] || motion.spring.premium;
}

/**
 * Get easing function string
 */
export function getEasing(type = 'easeOut') {
  return motion.easing[type] || motion.easing.easeOut;
}

/**
 * Generate CSS Custom Properties for motion
 */
export function generateMotionVars() {
  const vars = {};

  Object.entries(motion.duration).forEach(([key, value]) => {
    vars[`--duration-${key}`] = `${value}ms`;
  });

  Object.entries(motion.easing).forEach(([key, value]) => {
    vars[`--easing-${key}`] = value;
  });

  return vars;
}
