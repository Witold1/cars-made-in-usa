/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
        },
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
        },
        ink: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: 'var(--accent)',
        'chart-bg': 'var(--chart-bg)',
        'chart-bg-alt': 'var(--chart-bg-alt)',
        'input-bg': 'var(--input-bg)',
      },
      fontFamily: {
        sans: ['var(--font)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'Times New Roman', 'serif'],
        chart: ['var(--font-chart)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Accessible scale: body/UI at 1rem; sm/xs remapped above Tailwind defaults
        title: ['var(--type-title-size)', { lineHeight: '1.2', letterSpacing: 'var(--type-title-tracking)' }],
        ui: ['var(--type-ui-size)', { lineHeight: '1.5', letterSpacing: 'var(--type-body-tracking)' }],
        caption: ['var(--type-sm-size)', { lineHeight: '1.5', letterSpacing: 'var(--type-body-tracking)' }],
        label: ['var(--type-label-size)', { lineHeight: '1.4', letterSpacing: 'var(--type-label-tracking)' }],
        sm: ['var(--type-ui-size)', { lineHeight: '1.5', letterSpacing: 'var(--type-body-tracking)' }],
        xs: ['var(--type-sm-size)', { lineHeight: '1.5', letterSpacing: 'var(--type-body-tracking)' }],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius)',
        md: 'calc(var(--radius) + 1px)',
        lg: 'calc(var(--radius) + 2px)',
      },
      boxShadow: {
        focus: 'var(--focus-ring)',
        tooltip: 'var(--tooltip-shadow)',
      },
    },
  },
  plugins: [],
}
