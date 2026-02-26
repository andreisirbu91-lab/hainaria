import React, { useState, useEffect } from 'react';
import { useTryOnStore } from '../../../store/tryonStore';
import api from '../../../lib/api';
import CurrentlyWearing from './CurrentlyWearing';
import { Search, Sparkles, Loader2 } from 'lucide-react';

export default function Step3Selection() {
    const { session, startTryOn } = useTryOnStore();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const isQueued = session?.status === 'TRYON_QUEUED';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setProducts(res.data.products);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-8">
                <div className="space-y-4">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase">Pasul 3: Alege Produsul</h2>
                    <p className="text-gray-500">Selectează produsul pe care vrei să îl probezi virtual pe modelul tău.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Caută haine..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-[#F9FAFB] outline-none focus:border-black transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-[3/4] bg-gray-50 rounded-2xl animate-pulse" />
                        ))
                    ) : filtered.map(product => (
                        <div
                            key={product.id}
                            onClick={() => !isQueued && startTryOn(product)}
                            className="group cursor-pointer space-y-3"
                        >
                            <div className="aspect-[3/4] bg-[#F9FAFB] rounded-2xl overflow-hidden border border-transparent group-hover:border-black transition-all relative">
                                <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.title} />
                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/60 to-transparent">
                                    <button className="w-full bg-white text-black py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Sparkles size={12} /> Probă AI
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold truncate leading-none mb-1">{product.title}</h4>
                                <p className="text-xs font-black italic text-gray-400">{product.price} RON</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <aside className="w-full lg:w-80 shrink-0">
                <CurrentlyWearing />
            </aside>

            {isQueued && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-white">
                    <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-white rounded-full animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" size={40} />
                    </div>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Se generează proba</h3>
                    <p className="text-white/60 text-sm font-bold uppercase tracking-widest">Aproximativ 20-30 secunde...</p>
                    <div className="mt-12 max-w-xs text-center text-xs italic text-white/40">
                        "Știai că AI-ul nostru analizează peste 1 milion de texturi pentru a reda materialul cât mai fidel?"
                    </div>
                </div>
            )}
        </div>
    );
}
