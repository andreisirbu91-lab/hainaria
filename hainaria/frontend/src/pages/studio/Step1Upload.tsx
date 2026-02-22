import React, { useState } from 'react';
import { useStudioStore } from '../../store/studioStore';
import api, { getErrorMessage } from '../../lib/api';

export default function Step1Upload({ onNext }: { onNext: () => void }) {
    const { setAvatar } = useStudioStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            // MVP: API endpoint upload
            const res = await api.post('/avatars/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const avatar = res.data.data;

            // Start background processing
            const bgRes = await api.post('/studio/remove-bg', { avatarId: avatar.id });
            const processedAvatar = bgRes.data.data;

            setAvatar(processedAvatar.id, processedAvatar.originalUrl, processedAvatar.cutoutUrl);
            onNext();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-xl max-w-xl mx-auto mt-10" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Începe cu tine</h2>
            <p className="text-sm mb-8 text-center" style={{ color: 'var(--muted)' }}>
                Încarcă o poză full-body într-o lumină bună pentru cele mai bune rezultate. Fundalul va fi eliminat automat (poate dura până la 30s prima dată).
            </p>

            <label className="cursor-pointer btn-primary px-8 py-3 w-48 text-center flex items-center justify-center">
                {loading ? (
                    <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 flex-shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Se rocesează...
                    </span>
                ) : (
                    <span>Alege o poză</span>
                )}
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={loading}
                />
            </label>

            {error && (
                <p className="mt-4 text-xs tracking-widest uppercase text-center" style={{ color: 'var(--error)' }}>
                    {error}
                </p>
            )}
        </div>
    );
}
