import React from 'react';

const steps = [
    { label: 'Upload', status: ['CREATED'] },
    { label: 'Background', status: ['UPLOADED', 'BG_REMOVAL_QUEUED'] },
    { label: 'Selection', status: ['BG_REMOVAL_DONE', 'READY_FOR_TRYON', 'TRYON_QUEUED'] },
    { label: 'Review', status: ['TRYON_DONE'] },
];

export default function ProgressBar({ status }: { status: string }) {
    const currentIndex = steps.findIndex(s => s.status.includes(status));

    return (
        <div className="relative pt-8 pb-12">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2" />

            <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                {steps.map((step, i) => {
                    const isActive = i <= currentIndex;
                    const isCurrent = i === currentIndex;

                    return (
                        <div key={i} className="flex flex-col items-center gap-3 relative">
                            <div className={`
                                w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all duration-500
                                ${isActive ? 'bg-black border-black text-white shadow-xl scale-110' : 'bg-white border-gray-100 text-gray-300'}
                                ${isCurrent ? 'ring-4 ring-black/10' : ''}
                            `}>
                                {i + 1}
                            </div>
                            <span className={`
                                text-[10px] font-black uppercase tracking-widest absolute -top-8 transition-colors duration-500
                                ${isActive ? 'text-black' : 'text-gray-300'}
                            `}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
