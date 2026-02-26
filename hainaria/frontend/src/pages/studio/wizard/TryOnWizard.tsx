import React, { useEffect } from 'react';
import { useTryOnStore } from '../../../store/tryOnStore';
import UploadStep from './UploadStep';
import ProcessingStep from './ProcessingStep';
import SelectionStep from './SelectionStep';
import ResultStep from './ResultStep';

export default function TryOnWizard() {
    const { status, sessionId, initSession, pollStatus } = useTryOnStore();

    useEffect(() => {
        if (!sessionId) {
            initSession();
        }
    }, []);

    // Status-based polling
    useEffect(() => {
        if (!sessionId) return;
        const needsPolling = ['BG_REMOVAL_QUEUED', 'TRYON_QUEUED'].includes(status);

        if (needsPolling) {
            const interval = setInterval(pollStatus, 2000);
            return () => clearInterval(interval);
        }
    }, [status, sessionId]);

    const renderStep = () => {
        switch (status) {
            case 'CREATED':
            case 'UPLOADED':
                return <UploadStep />;
            case 'BG_REMOVAL_QUEUED':
                return <ProcessingStep message="Se elimină fundalul..." />;
            case 'BG_REMOVAL_DONE':
            case 'READY_FOR_TRYON':
                return <SelectionStep />;
            case 'TRYON_QUEUED':
                return <ProcessingStep message="AI-ul glisează haina pe tine..." />;
            case 'TRYON_DONE':
                return <ResultStep />;
            case 'FAILED':
                return <div className="text-red-500 p-4">Ceva nu a mers bine. Te rugăm să reîncarci pagina.</div>;
            default:
                return <UploadStep />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)]">
            <div className="mb-8 flex justify-between">
                {/* Step Indicators */}
                {['Sîrcă', 'Tăiere', 'Alegere', 'Rezultat'].map((step, i) => (
                    <div key={step} className={`flex items-center gap-2 ${i <= getStepIndex(status) ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i <= getStepIndex(status) ? 'bg-[var(--text)] text-[var(--bg)]' : 'bg-[var(--border)]'}`}>
                            {i + 1}
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold">{step}</span>
                    </div>
                ))}
            </div>

            <div className="min-h-[400px]">
                {renderStep()}
            </div>
        </div>
    );
}

function getStepIndex(status: string) {
    if (['CREATED', 'UPLOADED'].includes(status)) return 0;
    if (status === 'BG_REMOVAL_QUEUED') return 1;
    if (['BG_REMOVAL_DONE', 'READY_FOR_TRYON'].includes(status)) return 2;
    if (['TRYON_QUEUED', 'TRYON_DONE'].includes(status)) return 3;
    return 0;
}
