import React from 'react';

interface CardProps { children: React.ReactNode; className?: string; flat?: boolean; }

export function Card({ children, className = '', flat = false }: CardProps) {
    return (
        <div className={`${flat ? 'card-flat' : 'card'} ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-5 border-b` + ` ${className}`} style={{ borderColor: 'var(--border)' }}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-5 border-t ${className}`} style={{ borderColor: 'var(--border)' }}>
            {children}
        </div>
    );
}
