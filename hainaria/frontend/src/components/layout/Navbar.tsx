import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const cartItems = useCartStore((state) => state.items);
    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;

    const navLink = (to: string, label: string) => (
        <Link
            to={to}
            onClick={() => setMobileOpen(false)}
            className={`text-[10px] font-semibold uppercase tracking-[0.25em] transition-colors duration-150 relative pb-0.5 ${isActive(to)
                ? 'text-[var(--text)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-[var(--text)]'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
        >
            {label}
        </Link>
    );

    return (
        <>
            <nav
                className="sticky top-0 z-50 border-b"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <Link
                            to="/"
                            className="text-base font-bold tracking-[0.25em] uppercase"
                            style={{ color: 'var(--text)' }}
                        >
                            Hainăria
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLink('/shop', 'Colecție')}
                            {navLink('/studio', 'Studio')}
                            {user?.role === 'ADMIN' && navLink('/admin', 'Admin')}
                        </nav>

                        {/* Desktop actions */}
                        <div className="hidden md:flex items-center gap-5">
                            {user ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="transition-colors duration-150"
                                        style={{ color: isActive('/dashboard') ? 'var(--text)' : 'var(--muted)' }}
                                        aria-label="Profil"
                                        title="Profil"
                                    >
                                        <User className="w-[18px] h-[18px]" />
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="transition-colors duration-150"
                                        style={{ color: 'var(--muted)' }}
                                        aria-label="Deconectare"
                                        title="Deconectare"
                                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                                    >
                                        <LogOut className="w-[18px] h-[18px]" />
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className={`text-[10px] font-semibold uppercase tracking-[0.25em] transition-colors duration-150 ${isActive('/login') ? 'text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
                                        }`}
                                >
                                    Intră în cont
                                </Link>
                            )}

                            {/* Cart */}
                            <Link
                                to="/cart"
                                className="relative transition-colors duration-150"
                                style={{ color: isActive('/cart') ? 'var(--text)' : 'var(--muted)' }}
                                aria-label={`Coș (${cartCount} produse)`}
                                title="Coș"
                            >
                                <ShoppingBag className="w-[18px] h-[18px]" />
                                {cartCount > 0 && (
                                    <span
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full"
                                        style={{ background: 'var(--text)', color: 'var(--bg)' }}
                                    >
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* Mobile: cart + hamburger */}
                        <div className="flex md:hidden items-center gap-4">
                            <Link
                                to="/cart"
                                className="relative"
                                style={{ color: 'var(--muted)' }}
                                aria-label="Coș"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center"
                                        style={{ background: 'var(--text)', color: 'var(--bg)' }}
                                    >
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                aria-label="Meniu"
                                style={{ color: 'var(--muted)' }}
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div
                        className="md:hidden border-t px-4 py-6 flex flex-col gap-5"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                        {navLink('/shop', 'Colecție')}
                        {navLink('/studio', 'Studio')}
                        {user?.role === 'ADMIN' && navLink('/admin', 'Admin')}
                        <div className="divider" />
                        {user ? (
                            <>
                                {navLink('/dashboard', 'Profil')}
                                <button
                                    onClick={handleLogout}
                                    className="text-[10px] font-semibold uppercase tracking-[0.25em] text-left"
                                    style={{ color: 'var(--muted)' }}
                                >
                                    Deconectare
                                </button>
                            </>
                        ) : (
                            navLink('/login', 'Intră în cont')
                        )}
                    </div>
                )}
            </nav>
        </>
    );
}
