import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
    const baseClass = 'bg-hainaria-surface/50 backdrop-blur-sm border border-hainaria-border rounded-[18px] shadow-sm overflow-hidden';
    const hoverClass = hover ? 'transition-all duration-300 hover:shadow-md hover:scale-[1.01]' : '';

    return (
        <div className={`${baseClass} ${hoverClass} ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-5 border-b border-hainaria-border ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-5 border-t border-hainaria-border ${className}`}>
            {children}
        </div>
    );
}
