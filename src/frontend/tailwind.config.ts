import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'deep-indigo': '#4B0082',
        'electric-blue': '#0F62FE',
        'vibrant-orange': '#FF6F00',
        'charcoal-black': '#1A1A1A',

        primary: {
          'deep-indigo': '#4B0082',
          'electric-blue': '#0F62FE',
          'vibrant-orange': '#FF6F00',
          'charcoal-black': '#1A1A1A',
        },
        neutral: {
          white: '#FFFFFF',
          'charcoal-black': '#1A1A1A',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#0F172A',
        },

        // Dark Mode Palette (Enhanced for neumorphic design)
        'dark-background': {
          primary: '#0F0F0F', // Main background
          secondary: '#1A1A1A', // Card/component backgrounds
          tertiary: '#2A2A2A', // Elevated elements
        },
        'dark-gray': '#2A2A2A', // Commonly used gray for cards and components
        'dark-text': {
          primary: '#FFFFFF', // Main text
          secondary: '#B3B3B3', // Secondary text
          tertiary: '#808080', // Muted text
        },
        'dark-border': {
          subtle: '#333333', // Subtle borders
          default: '#4A4A4A', // Default borders
          strong: '#666666', // Strong borders
        },

        // Privacy-focused component colors (existing)
        'privacy-dark': '#1A1A1A',
        'privacy-background': '#0F0F0F',
        'privacy-background-secondary': '#1A1A1A',
        'privacy-muted': '#2A2A2A',
        'privacy-border': '#4A4A4A',
        'privacy-text': '#FFFFFF',
        'privacy-text-muted': '#B3B3B3',
        'privacy-accent': '#FF6F00',
        'privacy-primary': '#4B0082',
        'privacy-secondary': '#0F62FE',
        'privacy-success': '#10B981',
        'privacy-warning': '#F59E0B',
        'privacy-danger': '#EF4444',

        // Glassmorphism color variants
        'glass-dark': 'rgba(15, 23, 42, 0.8)',
        'glass-darker': 'rgba(15, 23, 42, 0.9)',
        'glass-light': 'rgba(30, 41, 59, 0.7)',
        'glass-lighter': 'rgba(30, 41, 59, 0.5)',
        'glass-border': 'rgba(79, 70, 229, 0.1)',
        'glass-border-strong': 'rgba(79, 70, 229, 0.2)',
        'glass-border-accent': 'rgba(79, 70, 229, 0.3)',
        'glass-highlight': 'rgba(255, 255, 255, 0.1)',
        'glass-shadow': 'rgba(0, 0, 0, 0.25)',

        // Gradient color stops for glassmorphism
        'gradient-start': 'rgba(79, 70, 229, 0.15)',
        'gradient-middle': 'rgba(30, 64, 175, 0.10)',
        'gradient-end': 'rgba(249, 115, 22, 0.05)',
        'gradient-social': 'rgba(79, 70, 229, 0.08)',
        'gradient-accent': 'rgba(249, 115, 22, 0.12)',

        // Enhanced social network color palette
        'social-glass': 'rgba(26, 26, 26, 0.85)',
        'social-border': 'rgba(79, 70, 229, 0.12)',
        'social-hover': 'rgba(79, 70, 229, 0.18)',
        'social-glow': 'rgba(79, 70, 229, 0.25)',
      },
      fontFamily: {
        headline: ['Inter', 'Poppins', 'sans-serif'],
        body: ['Roboto', 'Open Sans', 'sans-serif'],
        code: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-left': 'fadeInLeft 0.8s ease-out',
        'fade-in-right': 'fadeInRight 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        float: 'float 6s ease-in-out infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'glass-glow': 'glassGlow 2s ease-in-out infinite alternate',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 4s linear infinite',
        'wiggle-slow': 'wiggle 3s ease-in-out infinite',
      },
      keyframes: {
        // Enhanced animation keyframes for premium micro-interactions
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        gradientX: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glassGlow: {
          '0%': { boxShadow: '0 0 20px rgba(79, 70, 229, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(79, 70, 229, 0.4)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },

        // Social-specific animations
        socialPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(79, 70, 229, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(79, 70, 229, 0)' },
        },
        socialBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
        glow: '0 0 20px rgba(79, 0, 130, 0.3)',
        'glow-blue': '0 0 20px rgba(15, 98, 254, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 111, 0, 0.3)',
        'glow-indigo': '0 0 20px rgba(75, 0, 130, 0.4)',

        // Neumorphic shadows for enhanced UI
        soft: '4px 4px 8px rgba(0,0,0,0.25), -4px -4px 8px rgba(255,255,255,0.05)',
        'soft-inset':
          'inset 4px 4px 8px rgba(0,0,0,0.25), inset -4px -4px 8px rgba(255,255,255,0.05)',
        medium:
          '8px 8px 16px rgba(0,0,0,0.3), -8px -8px 16px rgba(255,255,255,0.1)',
        'medium-inset':
          'inset 8px 8px 16px rgba(0,0,0,0.3), inset -8px -8px 16px rgba(255,255,255,0.1)',
        strong:
          '12px 12px 24px rgba(0,0,0,0.4), -12px -12px 24px rgba(255,255,255,0.15)',

        // Neumorphic shadow variants for components
        neumorphic:
          '4px 4px 8px rgba(0,0,0,0.25), -4px -4px 8px rgba(255,255,255,0.05)',
        'neumorphic-inset':
          'inset 4px 4px 8px rgba(0,0,0,0.25), inset -4px -4px 8px rgba(255,255,255,0.05)',
        'neumorphic-raised':
          '4px 4px 8px rgba(0,0,0,0.25), -4px -4px 8px rgba(255,255,255,0.05)',
        'neumorphic-raised-hover':
          '6px 6px 12px rgba(0,0,0,0.3), -6px -6px 12px rgba(255,255,255,0.08)',

        // Glassmorphism shadow variants
        'glass-soft': '0 8px 32px rgba(0, 0, 0, 0.25)',
        'glass-medium': '0 12px 40px rgba(0, 0, 0, 0.35)',
        'glass-strong': '0 16px 48px rgba(0, 0, 0, 0.45)',
        'glass-glow': '0 0 30px rgba(79, 70, 229, 0.3)',
        'glass-glow-blue': '0 0 30px rgba(30, 64, 175, 0.3)',
        'glass-glow-orange': '0 0 30px rgba(249, 115, 22, 0.3)',
        'glass-border': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
};

export default config;
