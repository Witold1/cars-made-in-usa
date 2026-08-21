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
        title: ['var(--type-title-size)', { lineHeight: '1.2', letterSpacing: 'var(--type-title-tracking)' }],
        lead: ['var(--type-lead-size)', { lineHeight: '1.5', letterSpacing: 'var(--type-body-tracking)' }],
        label: ['var(--type-label-size)', { lineHeight: '1.4', letterSpacing: 'var(--type-label-tracking)' }],
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
