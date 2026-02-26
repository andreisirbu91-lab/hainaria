import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import {
    LayoutDashboard,
    Package,
    Layers,
    FileText,
    Image as ImageIcon,
    ShoppingCart,
    Settings,
    Key,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Home Builder', icon: LayoutDashboard, path: '/admin/home-builder' },
    { label: 'Produse', icon: Package, path: '/admin/products' },
    { label: 'Colecții', icon: Layers, path: '/admin/collections' },
    { label: 'Pagini', icon: FileText, path: '/admin/pages' },
    { label: 'Media', icon: ImageIcon, path: '/admin/media' },
    { label: 'Comenzi', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'Setări Site', icon: Settings, path: '/admin/settings' },
    { label: 'Integrări', icon: Key, path: '/admin/integrations' },
];

export default function AdminLayout() {
    const { admin, isLoading, checkAuth, logout } = useAdminAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading && !admin) {
            navigate('/admin/login');
        }
    }, [admin, isLoading, navigate]);

    if (isLoading) return <div className="h-screen flex items-center justify-center">Se încarcă...</div>;
    if (!admin) return null;

    return (
        <div className="flex h-screen bg-[#F9FAFB]">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] text-white transition-transform transform 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 lg:static lg:inset-0
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <h1 className="text-xl font-bold tracking-tighter uppercase italic">HAINARIA ADMIN</h1>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${location.pathname === item.path ? 'bg-[#1F2937] text-white' : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'}
                                `}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-[#1F2937]">
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                                {admin.name[0]}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold truncate">{admin.name}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{admin.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1F2937]"
                        >
                            <LogOut size={20} />
                            Deconectare
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 lg:hidden">
                    <h1 className="text-lg font-bold">HAINARIA</h1>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
