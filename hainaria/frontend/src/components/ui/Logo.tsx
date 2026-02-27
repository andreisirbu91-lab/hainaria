import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
    const sizes = {
        sm: { imgH: 50, fontSize: '18px', spacing: '0.2em' },
        md: { imgH: 80, fontSize: '24px', spacing: '0.22em' },
        lg: { imgH: 120, fontSize: '32px', spacing: '0.25em' },
    };
    const s = sizes[size];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <img
                src="/logo-hn.png"
                alt="HN"
                style={{ height: s.imgH, width: 'auto' }}
                className="object-contain"
            />
            {showText && (
                <span
                    className="text-hainaria-text"
                    style={{
                        fontFamily: "'Bookman Old Style', 'Libre Baskerville', 'Playfair Display', Georgia, serif",
                        fontSize: s.fontSize,
                        fontWeight: 400,
                        letterSpacing: s.spacing,
                    }}
                >
                    Hainaria
                </span>
            )}
        </div>
    );
}
