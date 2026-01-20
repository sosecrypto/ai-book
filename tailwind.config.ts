import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#fcf5e5', // Creamy paper color
        ink: '#3a3a3a', // Dark text color
        sepia: '#704214', // Old-style brown for accents
        leather: '#8d5b2d', // Book cover leather
        'gold-leaf': '#d4af37', // Gold accents
        ribbon: '#a63333', // Bookmark ribbon
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      animation: {
        'page-flip-right': 'page-flip-right 2.5s cubic-bezier(0, 0, 0.2, 1) forwards',
        'book-open': 'book-open 1.5s ease-out forwards',
        'ribbon-peek': 'ribbon-peek 0.5s ease-out forwards',
      },
      keyframes: {
        'page-flip-right': {
          '0%': { transform: 'perspective(1500px) rotateY(0deg)' },
          '50%': { transform: 'perspective(1500px) rotateY(-90deg)' },
          '100%': { transform: 'perspective(1500px) rotateY(-180deg)' },
        },
        'book-open': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'ribbon-peek': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        }
      },
    },
  },
  plugins: [],
}
export default config
