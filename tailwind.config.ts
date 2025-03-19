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
        pink: {
          light: '#F15F82',
          DEFAULT: '#EF476F',
          dark: '#E22F5B',
        },
        yellow: {
          light: '#FFD980',
          DEFAULT: '#FFD166',
          dark: '#FFC94D',
        },
        green: {
          light: '#1DDAAB',
          DEFAULT: '#06D6A0',
          dark: '#00BD8B',
        },
        blue: {
          light: '#1A9CC7',
          DEFAULT: '#118AB2',
          dark: '#0E779A',
        },
        navy: {
          light: '#0A4B60',
          DEFAULT: '#073B4C',
          dark: '#052C39',
        },
        white: '#FFFFFF',
        dark: {
          light: '#3C3C3C',
          DEFAULT: '#2C2C2C',
          dark: '#1C1C1C',
        },
        primary: {
          50: '#e6f1ff',
          100: '#cce4ff',
          200: '#99c8ff',
          300: '#66adff',
          400: '#3391ff',
          500: '#0076ff',
          600: '#005ecc',
          700: '#004799',
          800: '#002f66',
          900: '#001833',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;