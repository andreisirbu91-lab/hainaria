import React from 'react';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`bg-hainaria-surface/60 animate-pulse rounded-[14px] ${className}`}
        />
    );
}
