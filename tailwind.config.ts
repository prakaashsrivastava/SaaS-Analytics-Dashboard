import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          dark:    '#312E81',
          light:   '#818CF8',
          tint:    '#E0E7FF',
          subtle:  '#F8F9FF',
        },
        sidebar: {
          bg:     '#0F172A',
          text:   '#94A3B8',
          active: '#818CF8',
          hover:  '#1E293B',
          border: '#1E293B',
        },
        surface: '#FFFFFF',
        border:  '#E2E8F0',
        success: {
          DEFAULT: '#10B981',
          tint:    '#DCFCE7',
          text:    '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          tint:    '#FEF3C7',
          text:    '#92400E',
        },
        danger: {
          DEFAULT: '#EF4444',
          tint:    '#FEE2E2',
          text:    '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px 0 rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px 0 rgba(79,70,229,0.08)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
export default config
