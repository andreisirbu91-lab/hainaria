import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
    const sizes = {
        sm: { imgH: 28, fontSize: '13px', spacing: '0.18em' },
        md: { imgH: 34, fontSize: '16px', spacing: '0.2em' },
        lg: { imgH: 44, fontSize: '20px', spacing: '0.22em' },
    };
    const s = sizes[size];

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
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
