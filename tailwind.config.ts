import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      screens: {
        mobile: '360px',
        web: '768px'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      colors: {
        'text-color': 'var(--Light-Text-Color, #1B1E28)',
        'grayscale-50': 'var(--Grayscale-50, #F7F7F9)',
        'grayscale-100': 'var(--Grayscale-100, #DFDFE0)',
        'grayscale-400': 'var(--Grayscale-400, #939394)',
        'grayscale-500': 'var(--Grayscale-500, #7A7A7A)',
        'grayscale-600': 'var(--Grayscale-600, #606061)',
        'grayscale-700': 'var(--Grayscale-700, #474747)',
        'grayscale-800': 'var(--Grayscale-800, #2E2E2E)',
        'grayscale-900': 'var(--Grayscale-900, #141414)',
        'primary-50': '#FFE5FB',
        'primary-100': '#EDCAE8',
        'primary-300': '#B95FAB',
        'primary-900': '#21111F',
        'action-color': '#FF7029',
        'error-color': '#FF2D2D'
      },
      boxShadow: {
        'custom-navbar': '0px -8px 15px 0px rgba(0, 0, 0, 0.05)',
        'custom-box': '0px 0px 30px 0px rgba(0, 0, 0, 0.10)',
        'custom-marker': '0px 4px 20px 0px rgba(0, 0, 0, 0.25)',
        'text-shadow': '0px 4px 50px rgba(0, 0, 0, 0.5)'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif']
      }
    }
  }
};

export default config;
