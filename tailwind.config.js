/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Antigravity Palette
                glass: {
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.2)',
                    300: 'rgba(255, 255, 255, 0.3)',
                    400: 'rgba(255, 255, 255, 0.4)',
                    500: 'rgba(255, 255, 255, 0.5)',
                    dark: 'rgba(15, 23, 42, 0.6)', // Darker glass for text contrast
                },
                brand: {
                    base: '#020617', // Midnight Core (Slate 950)
                    purple: '#7C3AED', // Deep Purple
                    magenta: '#DB2777', // Vibrant Magenta
                    orange: '#F97316', // Bright Orange
                    yellow: '#FACC15', // Sunny Yellow (Accents)
                },
                text: {
                    main: '#F8FAFC', // Slate-50 (White for Dark Mode)
                    muted: '#94A3B8', // Slate-400
                    inverse: '#0F172A', // Dark text for light chips
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            borderRadius: {
                xl: '24px',
                lg: '16px',
                md: '12px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.50)',
                'float': '0 20px 50px rgba(0,0,0,0.3)',
            }
        },
    },
    plugins: [],
}
