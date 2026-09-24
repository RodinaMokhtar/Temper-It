/**
 * Temper-IT Official Theme Configuration
 * Extracted directly from https://engrazanhazem-create.github.io/TemperIt/
 * 
 * Aesthetic: Clean medical-grade IoT industrial dashboard with high-contrast data readouts,
 * subtle cyan/sky gradients, glassmorphism backdrops, and emergency pulse states.
 */

export const TEMPER_IT_THEME = {
  name: 'Temper-IT IoT Industrial & Medical Aesthetic',
  sourceUrl: 'https://engrazanhazem-create.github.io/TemperIt/',
  productPriceEgp: 1300,
  whatsappNumber: '+201150902000',
  whatsappUrl: 'https://wa.me/201150902000',
  
  typography: {
    fontFamilyPrimary: "'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: "'JetBrains Mono', monospace",
    weights: {
      light: 300,
      regular: 400,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    direction: 'rtl',
  },

  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0284c7', // Primary Sky
      600: '#0369a1', // Main Accent
      700: '#035485', // Deep brand blue
      800: '#075985',
      900: '#0c4a6e', // Dark brand navy
    },
    cyan: {
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
    },
    surface: {
      canvas: '#f8fafc', // Slate 50
      card: '#ffffff',
      cardAlt: '#f1f5f9', // Slate 100
      monitorBg: '#0f172a', // Slate 900 for IoT live monitor
      monitorCard: '#1e293b', // Slate 800
      monitorCardInner: '#020617', // Slate 950
    },
    status: {
      danger: '#ef4444',
      dangerGlow: 'rgba(239, 68, 68, 0.7)',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#0284c7',
    },
    borders: {
      subtle: 'rgba(226, 232, 240, 0.8)',
      divider: '#e2e8f0',
      monitorBorder: '#334155',
    },
  },

  shadows: {
    logoGlow: '0 10px 25px -3px rgba(2, 132, 199, 0.3)',
    alarmPulse: 'pulse-red-anim 1.5s infinite',
    cardElevated: '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03)',
  },

  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
};
