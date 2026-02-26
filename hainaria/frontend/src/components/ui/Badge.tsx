import React from 'react';

type BadgeVariant = 'gold' | 'accent' | 'muted' | 'success' | 'outline' | 'dark';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    gold: 'bg-hainaria-gold text-white',
    accent: 'bg-hainaria-accent text-white',
    muted: 'bg-hainaria-surface text-hainaria-muted border border-hainaria-border',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    outline: 'border border-hainaria-border text-hainaria-text',
    dark: 'bg-hainaria-text text-white',
};

export function Badge({ variant = 'muted', children, className = '' }: BadgeProps) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] ${variantStyles[variant]} ${className}`}>
            {children}
        </span>
    );
}
