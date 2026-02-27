import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/adminAuthStore';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');
    const { login } = useAdminAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLocalError('');
        try {
            await login(email, password);
            navigate('/admin');
        } catch (err: any) {
            setLocalError(err?.response?.data?.message || 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-black italic tracking-tighter mb-2">HAINARIA CMS</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Portal Administrativ</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black outline-none transition-colors"
                            placeholder="admin@site.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Parolă</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black outline-none transition-colors"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {localError && (
                        <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg font-bold italic">
                            {localError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Se procesează...' : 'Autentificare'}
                    </button>
                </form>

                <p className="mt-8 text-center text-[10px] text-gray-400 italic">
                    Acest portal este rezervat personalului autorizat Hainaria. Toate acțiunile sunt înregistrate.
                </p>
            </div>
        </div>
    );
}
