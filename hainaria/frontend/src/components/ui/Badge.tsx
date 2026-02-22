import React from 'react';

type BadgeVariant = 'dark' | 'light' | 'muted' | 'success' | 'warn';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const cls: Record<BadgeVariant, string> = {
    dark: 'badge-dark',
    light: 'badge-light',
    muted: 'badge-muted',
    success: 'badge-success',
    warn: 'badge-warn',
};

export function Badge({ variant = 'muted', children, className = '' }: BadgeProps) {
    return <span className={`${cls[variant]} ${className}`}>{children}</span>;
}
