import React from 'react';

export default function ProcessingStep({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-8 py-20">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-[var(--border)] rounded-full opacity-20"></div>
                <div className="absolute inset-0 border-4 border-[var(--text)] rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl animate-pulse">✨</span>
                </div>
            </div>

            <div className="text-center">
                <h3 className="text-lg font-bold mb-2">Se procesează...</h3>
                <p className="text-[var(--muted)] text-sm animate-pulse">{message}</p>
            </div>

            <div className="w-64 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--text)] animate-progress origin-left"></div>
            </div>

            <style>{`
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
                .animate-progress {
                    animation: progress 10s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
