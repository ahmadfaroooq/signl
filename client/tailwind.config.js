/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0D1117',
        amber: '#F5A623',
        bg: '#F7F5F0',
        surface: '#FFFFFF',
        muted: '#888888',
        border: '#E2E2E2',
        red: '#D0021B',
        green: '#2D7D46',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        condensed: ['Roboto Condensed', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '2px',
        DEFAULT: '4px',
        'md': '4px',
        'lg': '4px',
        'xl': '4px',
        '2xl': '4px',
        '3xl': '4px',
        'full': '9999px',
      },
      boxShadow: {
        none: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
      },
      spacing: {
        sidebar: '256px',
      },
    },
  },
  plugins: [],
}
