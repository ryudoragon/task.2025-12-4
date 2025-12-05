import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        heading: ['var(--font-rajdhani)'], // 見出し用
        mono: ['var(--font-share-tech-mono)'], // 数値用
      },
      colors: {
        background: '#050508', // 深淵な黒
        system: {
          blue: '#2E86DE',   // メインカラー（ハンターブルー）
          red: '#E74C3C',    // 警告・敵
          gold: '#F1C40F',   // 成長・報酬
          white: '#EBF5FB',  // テキスト
          dark: '#0B0C10',   // パネル背景
        },
        glass: {
          border: 'rgba(46, 134, 222, 0.3)', // ガラス風ボーダー
        },
        holo: {
          aqua: '#7BDFFF',    // ネオンアクア
          purple: '#A855F7',  // パープルグロー
          deep: '#1E1E2F',    // 深い背景
        },
      },
      boxShadow: {
        'system-blue-sm': '0 0 5px #2E86DE, inset 0 0 2px #2E86DE', // 鋭い発光
        'system-blue-md': '0 0 15px #2E86DE, inset 0 0 5px #2E86DE',
        'system-red-md': '0 0 15px #E74C3C, inset 0 0 5px #E74C3C',
        'system-gold-lg': '0 0 30px #F1C40F, 0 0 60px #F1C40F',
      },
      backgroundImage: {
        'hologram-scan': 'repeating-linear-gradient(transparent 0px, transparent 2px, rgba(46, 134, 222, 0.1) 3px)',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
export default config

