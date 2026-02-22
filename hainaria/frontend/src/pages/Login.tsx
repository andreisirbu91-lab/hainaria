import { useState } from 'react';
import api, { getErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailErr, setEmailErr] = useState('');
    const [passErr, setPassErr] = useState('');
    const [serverErr, setServerErr] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const loginStore = useAuthStore((s) => s.login);
    const navigate = useNavigate();

    const validate = () => {
        let ok = true;
        setEmailErr(''); setPassErr('');
        if (!email.includes('@')) { setEmailErr('Adresă de email invalidă.'); ok = false; }
        if (password.length < 8) { setPassErr('Parola trebuie să aibă cel puțin 8 caractere.'); ok = false; }
        return ok;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerErr(''); setSuccess('');
        if (!validate()) return;
        setLoading(true);
        try {
            if (isRegister) {
                await api.post('/auth/register', { email, password });
                setSuccess('Cont creat cu succes! Autentifică-te acum.');
                setIsRegister(false);
                setEmail(''); setPassword('');
            } else {
                const res = await api.post('/auth/login', { email, password });
                loginStore(res.data.user, res.data.token);
                navigate('/');
            }
        } catch (err: any) {
            setServerErr(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsRegister(!isRegister);
        setServerErr(''); setSuccess('');
        setEmailErr(''); setPassErr('');
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #0f0e0c 0%, #1a1815 55%, #0f0e0c 100%)' }}
        >
            {/* Subtle vignette blob */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,185,154,0.07) 0%, transparent 70%)'
                }}
            />

            <div className="w-full max-w-[400px] relative z-10">
                {/* Brand */}
                <div className="text-center mb-10">
                    <p className="text-[9px] tracking-[0.5em] uppercase mb-3" style={{ color: 'rgba(201,185,154,0.5)' }}>
                        hainăria
                    </p>
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-white">
                        {isRegister ? 'Creare cont' : 'Autentificare'}
                    </h1>
                    <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {isRegister ? 'Alătură-te comunității Hainăria.' : 'Bine ai revenit.'}
                    </p>
                </div>

                {/* Card */}
                <div
                    className="rounded-lg p-8"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.4)'
                    }}
                >
                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                        {/* Use inline styles so Input renders correctly on dark bg */}
                        <div className="flex flex-col gap-1.5">
                            <label className="block text-[10px] font-semibold uppercase tracking-[0.2em]"
                                style={{ color: 'rgba(255,255,255,0.4)' }}>
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                                placeholder="adresa@email.ro"
                                aria-invalid={!!emailErr}
                                className="w-full px-4 py-3 text-sm rounded bg-transparent text-white placeholder-white/20 outline-none transition-colors focus:border-white/30"
                                style={{
                                    border: `1px solid ${emailErr ? 'rgba(185,64,64,0.6)' : 'rgba(255,255,255,0.1)'}`,
                                }}
                            />
                            {emailErr && <p className="text-[11px]" style={{ color: 'rgba(230,130,130,0.9)' }}>{emailErr}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="block text-[10px] font-semibold uppercase tracking-[0.2em]"
                                style={{ color: 'rgba(255,255,255,0.4)' }}>
                                Parolă
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                required
                                autoComplete={isRegister ? 'new-password' : 'current-password'}
                                value={password}
                                onChange={e => { setPassword(e.target.value); setPassErr(''); }}
                                placeholder="min. 8 caractere"
                                aria-invalid={!!passErr}
                                className="w-full px-4 py-3 text-sm rounded bg-transparent text-white placeholder-white/20 outline-none transition-colors"
                                style={{
                                    border: `1px solid ${passErr ? 'rgba(185,64,64,0.6)' : 'rgba(255,255,255,0.1)'}`,
                                }}
                            />
                            {passErr && <p className="text-[11px]" style={{ color: 'rgba(230,130,130,0.9)' }}>{passErr}</p>}
                        </div>

                        {serverErr && (
                            <div className="rounded px-4 py-3 text-[11px]"
                                style={{ background: 'rgba(185,64,64,0.12)', border: '1px solid rgba(185,64,64,0.25)', color: 'rgba(230,130,130,0.9)' }}>
                                {serverErr}
                            </div>
                        )}
                        {success && (
                            <div className="rounded px-4 py-3 text-[11px]"
                                style={{ background: 'rgba(45,122,79,0.15)', border: '1px solid rgba(45,122,79,0.3)', color: 'rgba(100,200,140,0.9)' }}>
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] rounded transition-colors disabled:opacity-40"
                            style={{ background: 'rgba(255,255,255,0.92)', color: '#141414' }}
                        >
                            {loading
                                ? <span className="inline-flex items-center gap-2 justify-center">
                                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Se procesează...
                                </span>
                                : isRegister ? 'Creează cont' : 'Intră în cont'}
                        </button>
                    </form>

                    <div className="pt-6 mt-5 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <button
                            onClick={switchMode}
                            className="text-[10px] uppercase tracking-widest transition-colors"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                        >
                            {isRegister ? 'Ai deja cont? Autentifică-te →' : 'Nu ai cont? Înregistrează-te →'}
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
}
