import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        'deep-indigo': '#4B0082',
        'electric-blue': '#0F62FE',
        'vibrant-orange': '#FF6F00',
        'charcoal-black': '#1A1A1A',

        // Semantic colors
        primary: '#4B0082',
        secondary: '#0F62FE',
        accent: '#FF6F00',
        dark: '#1A1A1A',
        light: '#FFFFFF',

        // Dark Mode Palette (Enhanced for neumorphic design)
        'dark-background': {
          primary: '#0F0F0F',    // Main background
          secondary: '#1A1A1A',  // Card/component backgrounds
          tertiary: '#2A2A2A',   // Elevated elements
        },
        'dark-text': {
          primary: '#FFFFFF',    // Main text
          secondary: '#B3B3B3',  // Secondary text
          tertiary: '#808080',   // Muted text
        },
        'dark-border': {
          subtle: '#333333',     // Subtle borders
          default: '#4A4A4A',    // Default borders
          strong: '#666666',     // Strong borders
        },
      },
      fontFamily: {
        heading: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
        body: ['Roboto', 'Open Sans', 'system-ui', 'sans-serif'],
        code: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(79, 0, 130, 0.3)',
        'glow-blue': '0 0 20px rgba(15, 98, 254, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 111, 0, 0.3)',
        'glow-indigo': '0 0 20px rgba(75, 0, 130, 0.4)',
        
        // Neumorphic shadows for enhanced UI
        'soft': '4px 4px 8px rgba(0,0,0,0.25), -4px -4px 8px rgba(255,255,255,0.05)',
        'soft-inset': 'inset 4px 4px 8px rgba(0,0,0,0.25), inset -4px -4px 8px rgba(255,255,255,0.05)',
        'medium': '8px 8px 16px rgba(0,0,0,0.3), -8px -8px 16px rgba(255,255,255,0.1)',
        'medium-inset': 'inset 8px 8px 16px rgba(0,0,0,0.3), inset -8px -8px 16px rgba(255,255,255,0.1)',
        'strong': '12px 12px 24px rgba(0,0,0,0.4), -12px -12px 24px rgba(255,255,255,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
