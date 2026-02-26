import React, { useCallback } from 'react';
import { useTryOnStore } from '../../../store/tryOnStore';

export default function UploadStep() {
    const { uploadImage, status, triggerBgRemoval } = useTryOnStore();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadImage(file);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
            <h2 className="text-xl font-bold">Încarcă o poză cu tine</h2>
            <p className="text-[var(--muted)] text-sm text-center max-w-sm">
                Pentru cele mai bune rezultate, folosește o poză clară, cu lumină bună, stând drept.
            </p>

            <div className="relative">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                />
                <button className="btn-primary px-8">
                    Selectează Imaginea
                </button>
            </div>

            {status === 'UPLOADED' && (
                <button
                    onClick={triggerBgRemoval}
                    className="mt-4 text-sm font-bold border-b border-[var(--text)] pb-1"
                >
                    Continuă la tăierea fundalului →
                </button>
            )}
        </div>
    );
}
