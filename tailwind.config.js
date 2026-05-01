/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Kinetic Ledger color palette
                ink: {
                    950: '#020203',
                    900: '#050507',
                    800: '#09090B',
                    700: '#0E0E11',
                    600: '#131316',
                },
                indigo: {
                    500: '#5865F2',
                    400: '#6B75F5',
                    600: '#4752C4',
                },
            },
            fontFamily: {
                sans: ['Geist', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['Geist Mono', 'SF Mono', 'Fira Code', 'monospace'],
            },
            animation: {
                'kinetic-enter': 'kinetic-enter 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both',
                'kinetic-scale': 'scale-spring 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                'kinetic-slide': 'slide-bottom 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) both',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'shimmer-sweep': 'shimmer-sweep 2s ease-in-out infinite',
                'breathing': 'breathing-glow 3s ease-in-out infinite',
            },
            keyframes: {
                'kinetic-enter': {
                    '0%': { opacity: '0', transform: 'translateY(16px) scale(0.97)', filter: 'blur(4px)' },
                    '50%': { filter: 'blur(0)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
                },
                'scale-spring': {
                    '0%': { opacity: '0', transform: 'scale(0.92)' },
                    '60%': { transform: 'scale(1.02)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'slide-bottom': {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(88, 101, 242, 0.35)' },
                    '50%': { boxShadow: '0 0 20px 4px rgba(88, 101, 242, 0.35)' },
                },
                'shimmer-sweep': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'breathing-glow': {
                    '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.02)' },
                },
            },
            transitionTimingFunction: {
                'kinetic': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                'kinetic-snap': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            transitionDuration: {
                'instant': '0.15s',
                'fast': '0.25s',
                'normal': '0.4s',
            },
            borderRadius: {
                'kinetic': '12px',
                'kinetic-lg': '16px',
            },
            boxShadow: {
                'kinetic': '0 4px 16px -2px rgba(88, 101, 242, 0.25)',
                'kinetic-glow': '0 0 32px -4px rgba(88, 101, 242, 0.2)',
                'kinetic-lg': '0 8px 24px -4px rgba(88, 101, 242, 0.4)',
            },
        },
    },
    plugins: [],
}