import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
        'primary': '#4B0082',
        'secondary': '#0F62FE',
        'accent': '#FF6F00',
        'dark': '#1A1A1A',
        'light': '#FFFFFF',
      },
      fontFamily: {
        'heading': ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
        'body': ['Roboto', 'Open Sans', 'system-ui', 'sans-serif'],
        'code': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(79, 0, 130, 0.3)',
        'glow-blue': '0 0 20px rgba(15, 98, 254, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 111, 0, 0.3)',
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