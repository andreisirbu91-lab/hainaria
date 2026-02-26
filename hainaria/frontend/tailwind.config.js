/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Legacy brand tokens (keep for backward compat)
                brand: {
                    light: '#F5F3EF',
                    dark: '#141414',
                    gray: '#888880',
                    border: '#E6E3DC',
                    white: '#FAFAF8',
                    beige: '#C9B99A',
                },
                // CSS-var–backed semantic tokens
                bg: 'var(--bg)',
                surface: 'var(--surface)',
                'surface-2': 'var(--surface-2)',
                text: 'var(--text)',
                muted: 'var(--muted)',
                border: 'var(--border)',
                'border-2': 'var(--border-2)',
                accent: 'var(--accent)',
                'accent-2': 'var(--accent-2)',

                // Redesign tokens (Autumn Feminine)
                hainaria: {
                    bg: '#F6F1E8',
                    surface: '#EFE4D6',
                    text: '#2F241D',
                    muted: '#6A5A4F',
                    accent: '#7A5C45',
                    gold: '#C6A76E',
                    border: '#E2D4C3',
                }
            },
            fontFamily: {
                sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
                serif: ['"Playfair Display"', 'serif'],
            },
            borderRadius: {
                DEFAULT: 'var(--radius)',
                sm: 'var(--radius-sm)',
                lg: 'var(--radius-lg)',
            },
            boxShadow: {
                soft: 'var(--shadow-sm)',
                card: 'var(--shadow)',
                modal: 'var(--shadow-lg)',
            },
            spacing: {
                18: '4.5rem',
                22: '5.5rem',
            },
            letterSpacing: {
                wider2: '0.15em',
                wider3: '0.2em',
                wider4: '0.3em',
                wider5: '0.4em',
            },
            transitionDuration: {
                DEFAULT: '150ms',
            },
        },
    },
    plugins: [],
}
