/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Noto Sans Myanmar', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'Noto Sans Myanmar', 'sans-serif'],
      },
      fontWeight: {
        medium: '500',
        semibold: '500',
        bold: '600',
        extrabold: '700',
        black: '700',
      },
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
      },
    },
  },
  plugins: [],
};
