import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
    const sizes = {
        sm: { h: 28, font: '14px', text: '8px', spacing: '0.25em' },
        md: { h: 36, font: '18px', text: '9px', spacing: '0.3em' },
        lg: { h: 48, font: '24px', text: '11px', spacing: '0.35em' },
    };
    const s = sizes[size];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* HN Monogram */}
            <div
                className="flex items-center justify-center border-2 border-current rounded-full text-hainaria-text"
                style={{
                    width: s.h,
                    height: s.h,
                    fontFamily: "'Playfair Display', serif",
                    fontSize: s.font,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                }}
            >
                HN
            </div>
            {/* Store Name */}
            {showText && (
                <span
                    className="text-hainaria-text font-bold uppercase"
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: s.text,
                        letterSpacing: s.spacing,
                    }}
                >
                    HAINĂRIA
                </span>
            )}
        </div>
    );
}
