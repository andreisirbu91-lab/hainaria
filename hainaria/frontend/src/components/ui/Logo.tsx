import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

/**
 * HN Monogram SVG — matches the brand identity:
 * H and N share a middle vertical stroke,
 * with a sharp diagonal slash cutting through.
 */
function HNMonogram({ size = 28 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* H left vertical */}
            <rect x="8" y="12" width="10" height="76" fill="currentColor" />
            {/* H crossbar */}
            <rect x="8" y="42" width="34" height="10" fill="currentColor" />
            {/* Shared middle vertical (H right / N left) */}
            <rect x="38" y="12" width="10" height="76" fill="currentColor" />
            {/* N right vertical */}
            <rect x="82" y="12" width="10" height="76" fill="currentColor" />
            {/* N diagonal */}
            <polygon points="38,12 48,12 92,88 82,88" fill="currentColor" />
            {/* Slash detail cutting through — the brand signature */}
            <rect
                x="28" y="-8"
                width="3" height="120"
                fill="currentColor"
                transform="rotate(30 48 50)"
            />
        </svg>
    );
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
    const sizes = {
        sm: { icon: 26, fontSize: '13px', spacing: '0.2em' },
        md: { icon: 32, fontSize: '16px', spacing: '0.22em' },
        lg: { icon: 40, fontSize: '20px', spacing: '0.25em' },
    };
    const s = sizes[size];

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <HNMonogram size={s.icon} />
            {showText && (
                <span
                    className="text-hainaria-text"
                    style={{
                        fontFamily: "'Bookman Old Style', 'Libre Baskerville', 'Playfair Display', Georgia, serif",
                        fontSize: s.fontSize,
                        fontWeight: 400,
                        letterSpacing: s.spacing,
                        textTransform: 'uppercase',
                    }}
                >
                    Hainaria
                </span>
            )}
        </div>
    );
}
