import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, ExternalLink } from 'lucide-react';
import api from '../../../lib/api';
import { Link } from 'react-router-dom';

export default function ProductList() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/admin/products');
            setProducts(res.data.products);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        if (!window.confirm('Ești sigur că vrei să ștergi acest produs?')) return;
        try {
            await api.delete(`/admin/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert('Eroare la ștergere');
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">Gestiune Produse</h1>
                    <p className="text-sm text-gray-500">Administrează inventarul, prețurile și statusul produselor tale.</p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus size={18} />
                    Produs Nou
                </Link>
            </div>

            {/* Filters bar */}
            <div className="bg-white p-4 rounded-xl border flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Caută după nume sau SKU..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-100 bg-[#F9FAFB] outline-none focus:border-black transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">
                    <Filter size={18} />
                    Filtrează
                </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#F9FAFB] border-b">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Produs</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">SKU</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Preț</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Stoc</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">Se încarcă produsele...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">Nu s-au găsit produse.</td></tr>
                        ) : filteredProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border">
                                            {p.images?.[0] ? (
                                                <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Plus size={16} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{p.title}</p>
                                            <p className="text-xs text-gray-400 italic">{p.category || 'Fără categorie'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {p.status === 'PUBLISHED' ? 'Activ' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">{p.sku || '-'}</td>
                                <td className="px-6 py-4 font-bold text-sm">
                                    {p.salePrice ? (
                                        <div className="flex flex-col">
                                            <span className="text-red-600">{p.salePrice} RON</span>
                                            <span className="text-[10px] text-gray-400 line-through">{p.price} RON</span>
                                        </div>
                                    ) : (
                                        <span>{p.price} RON</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-sm font-medium text-gray-600">{p.stock} pcs</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            to={`/product/${p.slug}`}
                                            target="_blank"
                                            className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg border border-transparent hover:border-gray-100 flex items-center justify-center transition-all"
                                        >
                                            <ExternalLink size={16} />
                                        </Link>
                                        <Link
                                            to={`/admin/products/edit/${p.id}`}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 flex items-center justify-center transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </Link>
                                        <button
                                            onClick={() => deleteProduct(p.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 flex items-center justify-center transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
