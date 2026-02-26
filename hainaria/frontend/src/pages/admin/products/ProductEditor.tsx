import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, Plus, Trash2, Globe, Eye } from 'lucide-react';
import { useProductStore } from '../../../store/adminProductStore';
import MediaLibrary from '../media/MediaLibrary';

export default function ProductEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, saveProduct } = useProductStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        salePrice: null as number | null,
        sku: '',
        stock: 0,
        status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
        category: '',
        brand: '',
        images: [] as any[]
    });

    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id && id !== 'new') {
            const product = products.find(p => p.id === id);
            if (product) setFormData({ ...formData, ...product });
        }
    }, [id, products]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await saveProduct({ ...formData, id: id === 'new' ? undefined : id });
            navigate('/admin/products');
        } catch (err) {
            alert('Eroare la salvare');
        } finally {
            setSaving(false);
        }
    };

    const addImages = (selectedAssets: any[]) => {
        const newImages = selectedAssets.map(asset => ({
            url: asset.url,
            alt: asset.filename,
            isMain: formData.images.length === 0
        }));
        setFormData({ ...formData, images: [...formData.images, ...newImages] });
        setIsMediaModalOpen(false);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-[#F9FAFB]/80 backdrop-blur-md z-30 py-4">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => navigate('/admin/products')} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black italic tracking-tighter uppercase">
                            {id === 'new' ? 'Adaugă Produs' : 'Editează Produs'}
                        </h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Detalii și Inventar</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Se salvează...' : 'Salvează Produsul'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: General Info */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="text-sm font-black italic uppercase tracking-tighter flex items-center gap-2">
                            <Globe size={16} />
                            Informații Generale
                        </h2>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Titlu Produs</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#F9FAFB] outline-none focus:border-black transition-colors font-medium"
                                placeholder="ex: Geacă de piele Biker"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Descriere</label>
                            <textarea
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#F9FAFB] outline-none focus:border-black transition-colors text-sm"
                                placeholder="Descrie produsul în detaliu..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="text-sm font-black italic uppercase tracking-tighter flex items-center gap-2">
                            <ImageIcon size={16} />
                            Media
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl border overflow-hidden group">
                                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setIsMediaModalOpen(true)}
                                className="aspect-square rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                            >
                                <Plus size={24} className="text-gray-300" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Adaugă Media</span>
                            </button>
                        </div>
                    </section>
                </div>

                {/* Right Column: Pricing & Options */}
                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="text-sm font-black italic uppercase tracking-tighter">Preț & Stoc</h2>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Preț (RON)</label>
                            <input
                                type="number"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#F9FAFB] outline-none focus:border-black transition-colors font-bold"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Preț Redus (Opțional)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#F9FAFB] outline-none focus:border-black transition-colors font-bold text-red-600"
                                value={formData.salePrice || ''}
                                onChange={e => setFormData({ ...formData, salePrice: e.target.value ? parseFloat(e.target.value) : null })}
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-50">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Stoc Disponibil</label>
                            <input
                                type="number"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#F9FAFB] outline-none focus:border-black transition-colors font-medium"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                            />
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="text-sm font-black italic uppercase tracking-tighter">Status & Vizibilitate</h2>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#F9FAFB] outline-none focus:border-black transition-colors font-bold text-xs uppercase tracking-widest"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                        >
                            <option value="DRAFT">⚪ Draft</option>
                            <option value="PUBLISHED">🟢 Publicat</option>
                        </select>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-[10px] text-gray-400 italic">
                                Produsele în status **Draft** nu vor fi vizibile clienților în shop-ul Hainaria.
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Media Modal */}
            {isMediaModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl">
                        <div className="bg-white p-4 border-b flex items-center justify-between">
                            <h3 className="font-black italic tracking-tighter uppercase">Alege Imagini Produs</h3>
                            <button onClick={() => setIsMediaModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg font-bold">ÎNCHIDE</button>
                        </div>
                        <div className="overflow-y-auto">
                            <MediaLibrary multiple onSelect={addImages} />
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
