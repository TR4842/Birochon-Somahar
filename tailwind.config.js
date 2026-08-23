/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF7F2',
          100: '#FFFDF9',
          200: '#F5EBE6',
          300: '#EFE4DC',
          400: '#E5D5C8',
        },
        peach: {
          50: '#FDFBF7',
          100: '#FDEEDC',
          200: '#F7D6C8',
          300: '#F4A261',
          400: '#E8A589',
          500: '#D97757',
        },
        mint: {
          50: '#F2F7F4',
          100: '#EBF5F0',
          200: '#D8E2DC',
          300: '#B7E4C7',
          400: '#84A59D',
          500: '#3B7A57',
        },
        babyblue: {
          50: '#F5FAFD',
          100: '#E0F2FE',
          200: '#BEE9E8',
          300: '#A8DADC',
          400: '#60A5FA',
          500: '#2B6CB0',
        },
        warmcharcoal: {
          100: '#8C827D',
          200: '#5C5452',
          300: '#362C28',
          400: '#241C1A',
        },
        retrogold: '#E9C46A',
        retrorose: '#E76F51',
      },
      fontFamily: {
        bengali: ['"Hind Siliguri"', '"Noto Serif Bengali"', 'sans-serif'],
      },
      boxShadow: {
        'retro-sm': '2px 2px 0px 0px rgba(54, 44, 40, 0.08)',
        'retro': '4px 4px 0px 0px rgba(54, 44, 40, 0.12)',
        'retro-md': '6px 6px 0px 0px rgba(54, 44, 40, 0.15)',
        'retro-soft': '0 10px 25px -5px rgba(232, 165, 137, 0.25)',
      }
    },
  },
  plugins: [],
}
