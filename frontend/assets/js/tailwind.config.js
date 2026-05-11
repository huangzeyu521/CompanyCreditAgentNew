/* Tailwind CDN 运行时配置（与原型完全对齐） */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#4A90E2',
          600: '#2E74B5',
          700: '#1F497D',
          800: '#1E3A5F',
          900: '#0F2C52'
        },
        accent:  '#4A90E2',
        success: '#16A34A',
        warning: '#F59E0B',
        danger:  '#DC2626',
        gold:    '#D97706',
        ink:     '#1E293B',
        muted:   '#64748B',
        bg:      '#F8FAFC',
        border:  '#E2E8F0'
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        cardLg: '0 4px 16px rgba(0,0,0,0.08)'
      },
      fontFamily: {
        sans: ['"PingFang SC"','"Microsoft YaHei"','"Noto Sans CJK SC"','-apple-system','BlinkMacSystemFont','"Segoe UI"','Roboto','sans-serif']
      }
    }
  }
};
