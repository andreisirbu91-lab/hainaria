import { useState, useCallback, useEffect } from 'react';

interface ToastMessage {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

let _setToast: ((t: ToastMessage | null) => void) | null = null;

export function useToast() {
    const show = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
        if (_setToast) {
            const id = Date.now().toString();
            _setToast({ id, message, type });
        }
    }, []);
    return { show };
}

export function Toast() {
    const [toast, setToast] = useState<ToastMessage | null>(null);

    useEffect(() => {
        _setToast = setToast;
        return () => { _setToast = null; };
    }, []);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2800);
        return () => clearTimeout(t);
    }, [toast]);

    if (!toast) return null;

    const icons = { success: '✓', error: '✕', info: 'i' };

    return (
        <div className="toast" role="status" aria-live="polite">
            <span className="text-base leading-none opacity-80">{icons[toast.type || 'success']}</span>
            <span className="text-sm">{toast.message}</span>
        </div>
    );
}
