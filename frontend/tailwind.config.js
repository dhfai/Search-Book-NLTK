/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        dm: ['DM Sans'],
      },
      colors:{
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        stroke: 'rgb(var(--stroke-color))',
        'card-bg': 'var(--card-bg)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
            "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow:{
        'glass-inset': 'inset 0 17px 5px -9px rgba(254,254,91, 0.05)',
        'glass-sm': '5px 5px 20px 0px rgba(134,68,162, 0.3)',
      },
      keyframes: {
        scroll: {
          '0%': {
            transform: 'translateX(100%)',
          },
          '100%': {
            transform: 'translateX(-100%)',
          },
        },
        scroll2: {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(-200%)',
          },
        },
      },
      animation: {
        'loop-1' : 'scroll var(--time) linear infinite',
        'loop-2' : 'scroll2 var(--time) linear infinite',
      },
      screens:{
        xs: '480px',
      }
    },
  },
  plugins: [],
}

