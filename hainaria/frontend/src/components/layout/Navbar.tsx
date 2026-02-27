import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../lib/api';
import Logo from '../ui/Logo';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const cartItems = useCartStore((state) => state.items);
    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/public/settings');
                if (res.data.ok) {
                    setSettings(res.data.settings);
                }
            } catch (err) {
                console.error('Failed to fetch navbar settings', err);
            }
        };
        fetchSettings();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = settings?.menuItems || [
        { label: 'Colecție', href: '/shop' },
        { label: 'Studio VTO', href: '/studio' },
    ];

    const navLink = (to: string, label: string) => (
        <Link
            to={to}
            onClick={() => setMobileOpen(false)}
            className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 relative pb-1 ${isActive(to)
                ? 'text-hainaria-text border-b border-hainaria-gold'
                : 'text-hainaria-muted hover:text-hainaria-accent'
                }`}
        >
            {label}
        </Link>
    );

    return (
        <nav className="sticky top-0 z-50 bg-hainaria-bg/80 backdrop-blur-lg border-b border-hainaria-border">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="flex justify-between items-center h-36 md:h-32">

                    {/* Logo */}
                    <Link to="/" className="hover:opacity-80 transition-opacity">
                        <Logo size="lg" />
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-10">
                        {navItems.map((item: any, idx: number) => (
                            <React.Fragment key={idx}>
                                {navLink(item.href, item.label)}
                            </React.Fragment>
                        ))}
                        {user?.role === 'ADMIN' && navLink('/admin', 'Admin Panel')}
                    </nav>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/dashboard"
                                    className={`transition-colors duration-300 ${isActive('/dashboard') ? 'text-hainaria-accent' : 'text-hainaria-muted hover:text-hainaria-text'}`}
                                    title="Contul Meu"
                                >
                                    <User size={18} />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-hainaria-muted hover:text-hainaria-accent transition-colors"
                                    title="Deconectare"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${isActive('/login') ? 'text-hainaria-text' : 'text-hainaria-muted hover:text-hainaria-text'}`}
                            >
                                Login
                            </Link>
                        )}

                        <div className="w-[1px] h-4 bg-hainaria-border mx-2" />

                        {/* Cart */}
                        <Link
                            to="/cart"
                            className={`relative transition-colors duration-300 ${isActive('/cart') ? 'text-hainaria-accent' : 'text-hainaria-muted hover:text-hainaria-text'}`}
                            title={`Coș (${cartCount})`}
                        >
                            <ShoppingBag size={18} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center text-[8px] font-bold rounded-full bg-hainaria-accent text-white shadow-sm">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="flex md:hidden items-center gap-5">
                        <Link to="/cart" className="relative text-hainaria-muted">
                            <ShoppingBag size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 text-[9px] font-bold rounded-full flex items-center justify-center bg-hainaria-accent text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="text-hainaria-text p-1"
                        >
                            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-hainaria-bg border-b border-hainaria-border px-8 py-10 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top">
                    {navItems.map((item: any, idx: number) => (
                        <React.Fragment key={idx}>
                            {navLink(item.href, item.label)}
                        </React.Fragment>
                    ))}
                    {user?.role === 'ADMIN' && navLink('/admin', 'Admin Panel')}
                    <div className="h-[1px] bg-hainaria-border w-16 my-2" />
                    {user ? (
                        <>
                            {navLink('/dashboard', 'Profil')}
                            <button
                                onClick={handleLogout}
                                className="text-xs font-bold uppercase tracking-[0.2em] text-left text-hainaria-muted py-2"
                            >
                                Deconectare
                            </button>
                        </>
                    ) : (
                        navLink('/login', 'Autentificare')
                    )}
                </div>
            )}
        </nav>
    );
}
