import React, { useState } from 'react';
import Step1Upload from './Step1Upload';
import Step3Outfit from './Step3Outfit';
import Step4Export from './Step4Export';
import { useStudioStore } from '../../store/studioStore';

const steps = [
    { id: 1, label: 'Încarcă poza' },
    { id: 2, label: 'Probează ținute' },
    { id: 3, label: 'Descarcă' }
];

export default function StudioPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const { avatarId } = useStudioStore();

    const goToNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const goToPrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

            {/* Header Wizard */}
            <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--text)' }}>
                        Studio Try-On (AI)
                    </h1>

                    {/* Stepper */}
                    <div className="flex items-center justify-between max-w-2xl">
                        {steps.map((s, index) => (
                            <div key={s.id} className="flex flex-col items-center gap-2 flex-1 relative">
                                <div
                                    className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-colors z-10"
                                    style={{
                                        borderColor: currentStep >= s.id ? 'var(--text)' : 'var(--border)',
                                        background: currentStep >= s.id ? 'var(--text)' : 'var(--surface)',
                                        color: currentStep >= s.id ? 'var(--bg)' : 'var(--muted)'
                                    }}
                                >
                                    {s.id}
                                </div>
                                <span
                                    className="text-[10px] uppercase tracking-widest text-center"
                                    style={{ color: currentStep >= s.id ? 'var(--text)' : 'var(--muted)' }}
                                >
                                    {s.label}
                                </span>
                                {/* Line connector */}
                                {index < steps.length - 1 && (
                                    <div
                                        className="absolute top-4 left-1/2 w-full h-[1px] -z-0"
                                        style={{ background: currentStep > s.id ? 'var(--text)' : 'var(--border)' }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col items-center">
                <div className="w-full flex-1 flex flex-col mt-4">
                    {currentStep === 1 && <Step1Upload onNext={goToNext} />}
                    {currentStep === 2 && <Step3Outfit onNext={goToNext} onPrev={goToPrev} />}
                    {currentStep === 3 && <Step4Export onPrev={goToPrev} />}
                </div>
            </div>

        </div>
    );
}
