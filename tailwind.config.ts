import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fff7f7',
        },
        champagne: {
          100: '#f8e9d7',
        },
        ivory: {
          50: '#fffdf8',
        },
      },
      boxShadow: {
        soft: '0 12px 35px rgba(119, 78, 92, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
