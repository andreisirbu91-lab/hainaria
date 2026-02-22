import React, { useState, useEffect } from 'react';

const messages = [
    "Analizăm contururile corpului tău...",
    "Generăm 100 de variante de testare...",
    "Croim materialul digital pe noile măsuri...",
    "Aplicăm umbrele și luminile ambientale...",
    "Finisăm detaliile pentru un aspect realist...",
    "Mai e puțin, pregătim magia finale..."
];

export default function AILoader() {
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % messages.length);
        }, 3000); // cycle messages every 3s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-t-transparent border-gray-200 rounded-full animate-spin" style={{ borderTopColor: 'var(--text)' }} />
                <div className="absolute inset-2 border-4 border-b-transparent border-gray-100 rounded-full animate-spin-slow" style={{ borderBottomColor: 'var(--text)', opacity: 0.5 }} />
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xs uppercase tracking-widest" style={{ color: 'var(--text)' }}>
                    AI
                </div>
            </div>

            <p className="text-sm font-medium tracking-wide text-center transition-opacity duration-500 min-h-[2rem]" style={{ color: 'var(--text)' }}>
                {messages[msgIndex]}
            </p>
            <p className="text-[10px] mt-4 uppercase tracking-widest text-center" style={{ color: 'var(--muted)' }}>
                Acest proces poate dura 10-15 secunde.
            </p>
        </div>
    );
}
