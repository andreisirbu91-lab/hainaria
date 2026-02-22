import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helper?: string;
}

export function Label({ children, htmlFor, className = '' }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-[10px] font-semibold uppercase tracking-[0.2em] mb-2 ${className}`}
            style={{ color: 'var(--muted)' }}
        >
            {children}
        </label>
    );
}

export function Input({
    label,
    error,
    helper,
    id,
    className = '',
    ...props
}: InputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && <Label htmlFor={id}>{label}</Label>}
            <input
                id={id}
                className={`input-base ${error ? 'border-[var(--error)] focus:border-[var(--error)]' : ''} ${className}`}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
                {...props}
            />
            {error && (
                <p id={`${id}-error`} className="text-xs mt-0.5" style={{ color: 'var(--error)' }} role="alert">
                    {error}
                </p>
            )}
            {helper && !error && (
                <p id={`${id}-helper`} className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    {helper}
                </p>
            )}
        </div>
    );
}
