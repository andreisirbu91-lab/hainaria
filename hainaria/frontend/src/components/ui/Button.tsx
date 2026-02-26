import React from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'outline' | 'ghost' | 'gold' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    fullWidth?: boolean;
    href?: string;
}

const variantClass: Record<Variant, string> = {
    primary: 'bg-hainaria-text text-white hover:bg-hainaria-accent shadow-sm',
    outline: 'border border-hainaria-border text-hainaria-text hover:bg-hainaria-surface shadow-sm',
    ghost: 'text-hainaria-text hover:bg-hainaria-surface/50',
    gold: 'bg-hainaria-gold text-white hover:bg-hainaria-gold/90 shadow-md',
    accent: 'bg-hainaria-accent text-white hover:bg-hainaria-accent/90 shadow-sm',
};

const sizeClass: Record<Size, string> = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3.5 text-xs',
    lg: 'px-10 py-4 text-sm tracking-[0.2em]',
};

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    fullWidth = false,
    children,
    className = '',
    href,
    ...props
}: ButtonProps) {
    const baseClass = 'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-[0.15em] transition-all duration-300 select-none disabled:opacity-50 rounded-[14px]';
    const cls = [
        baseClass,
        variantClass[variant],
        sizeClass[size],
        fullWidth ? 'w-full' : '',
        className
    ].filter(Boolean).join(' ');

    const content = loading ? (
        <span className="inline-flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Se încarcă...</span>
        </span>
    ) : children;

    if (href) {
        return (
            <Link to={href} className={cls}>
                {content}
            </Link>
        );
    }

    return (
        <button
            {...props}
            disabled={disabled || loading}
            className={cls}
            aria-busy={loading}
        >
            {content}
        </button>
    );
}
