import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        muted: {
          DEFAULT: 'hsl(210, 40%, 96%)',
          foreground: 'hsl(215, 16%, 47%)',
        },
        foreground: 'hsl(222, 84%, 5%)',
        background: 'hsl(0, 0%, 100%)',
        primary: 'hsl(220, 90%, 56%)',
        secondary: 'hsl(217, 33%, 17%)',
        destructive: 'hsl(0, 84%, 60%)',
        border: 'hsl(214, 32%, 91%)',
        input: 'hsl(214, 32%, 91%)',
        ring: 'hsl(220, 90%, 56%)',
      },
    },
  },
  plugins: [],
};

export default config;
