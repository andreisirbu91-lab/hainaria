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
                        <div className="container-custom pt-8 pb-20 min-h-screen">
                            <div className="flex flex-col gap-2 mb-12">
                                <h1 className="section-title">Studio AI</h1>
                                <p className="section-subtitle">
                                    Transformă-ți ideile în ținute reale folosind puterea inteligenței artificiale.
                                </p>
                            </div>

                            <TryOnWizard />
                        </div>
                        );
}
