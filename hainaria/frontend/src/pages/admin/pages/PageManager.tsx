import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { Plus, Edit2, Trash2, Eye, FileText, Globe, Search } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

interface Page {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    updatedAt: string;
}

export default function PageManager() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { show: showToast } = useToast();
    const navigate = useNavigate();

    const fetchPages = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/pages');
            if (res.data.ok) {
                setPages(res.data.pages || []);
            }
        } catch (err) {
            showToast('Eroare la încărcarea paginilor', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Ești sigur că vrei să ștergi această pagină?')) return;
        try {
            await api.delete(`/admin/pages/${id}`);
            setPages(pages.filter(p => p.id !== id));
            showToast('Pagină ștearsă');
        } catch (err) {
            showToast('Eroare la ștergere', 'error');
        }
    };

    const filteredPages = pages.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center uppercase tracking-widest text-[10px] font-bold">Se încarcă paginile...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Gestiune Pagini</h1>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold text-[10px]">Pagini legale, despre noi și conținut brand</p>
                </div>
                <Button onClick={() => navigate('/admin/pages/new')} className="gap-2">
                    <Plus size={18} /> Pagină Nouă
                </Button>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Caută în pagini..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-hainaria-accent outline-none transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                            <tr>
                                <th className="px-8 py-4">Titlu Pagină</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Ultima Actualizare</th>
                                <th className="px-8 py-4 text-right">Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPages.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">
                                        Nu a fost găsită nicio pagină.
                                    </td>
                                </tr>
                            ) : (
                                filteredPages.map((page) => (
                                    <tr key={page.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 group-hover:text-hainaria-accent transition-colors">{page.title}</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">/{page.slug}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${page.published ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${page.published ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                {page.published ? 'Publicat' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-gray-500">
                                            {new Date(page.updatedAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-5 text-right space-x-2">
                                            <a
                                                href={`/p/${page.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex p-2 text-gray-400 hover:text-hainaria-text transition-colors"
                                                title="Vezi pe site"
                                            >
                                                <Eye size={18} />
                                            </a>
                                            <button
                                                onClick={() => navigate(`/admin/pages/edit/${page.id}`)}
                                                className="inline-flex p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editează"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(page.id)}
                                                className="inline-flex p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Șterge"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
