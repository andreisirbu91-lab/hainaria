import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
    const sizes = {
        sm: {
            imgClass: 'h-[32px] md:h-[50px]',
            textClass: 'text-[16px] md:text-[18px] tracking-[0.2em]'
        },
        md: {
            imgClass: 'h-[40px] md:h-[80px]',
            textClass: 'text-[18px] md:text-[24px] tracking-[0.22em]'
        },
        lg: {
            imgClass: 'h-[48px] md:h-[120px]',
            textClass: 'text-[22px] md:text-[32px] tracking-[0.25em]'
        },
    };
    const s = sizes[size];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <img
                src="/logo-hn.png?v=4"
                alt="HN"
                className={`object-contain ${s.imgClass}`}
            />
            {showText && (
                <span
                    className={`text-hainaria-text transition-all duration-300 ${s.textClass}`}
                    style={{ fontFamily: "'Bookman Old Style', 'Libre Baskerville', 'Playfair Display', Georgia, serif", fontWeight: 400 }}
                >
                    Hainaria
                </span>
            )}
        </div>
    );
}
