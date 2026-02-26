import React, { useEffect } from 'react';
import { useTryOnStore } from '../../../store/tryonStore';
import Step1Upload from './Step1Upload';
import Step2Background from './Step2Background';
import Step3Selection from './Step3Selection';
import Step4Review from './Step4Review';
import ProgressBar from './ProgressBar';

export default function TryOnWizard() {
    const { sessionId, session, createSession, fetchSession, isLoading } = useTryOnStore();

    useEffect(() => {
        if (!sessionId) {
            createSession();
        } else {
            fetchSession(sessionId);
        }
    }, []);

    if (!session && isLoading) {
        return <div className="py-20 text-center animate-pulse italic text-gray-400">Inițializare sesiune de probă...</div>;
    }

    if (!session) return null;

    const renderStep = () => {
        switch (session.status) {
            case 'CREATED':
                return <Step1Upload />;
            case 'UPLOADED':
            case 'BG_REMOVAL_QUEUED':
                return <Step2Background />;
            case 'BG_REMOVAL_DONE':
            case 'READY_FOR_TRYON':
            case 'TRYON_QUEUED':
                return <Step3Selection />;
            case 'TRYON_DONE':
                return <Step4Review />;
            case 'FAILED':
                return <div className="p-8 bg-red-50 text-red-600 rounded-2xl text-center">
                    Ceva nu a mers bine. Te rugăm să reîncarci pagina sau să încerci din nou.
                </div>;
            default:
                return <Step1Upload />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <ProgressBar status={session.status} />
            <div className="mt-8 transition-all duration-500 ease-in-out">
                {renderStep()}
            </div>
        </div>
    );
}
