const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // primary: {
        //   50: '#EEF2FF',
        //   100: '#E0E7FF',
        //   200: '#C7D2FE',
        //   300: '#A5B4FC',
        //   400: '#818CF8',
        //   500: '#6366F1',
        //   600: '#4F46E5',
        //   700: '#4338CA',
        //   800: '#3730A3',
        //   900: '#312E81',
        // },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
}
