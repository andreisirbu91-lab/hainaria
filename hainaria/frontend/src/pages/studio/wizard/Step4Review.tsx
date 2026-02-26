import React from 'react';
import { useTryOnStore } from '../../../store/tryonStore';
import { ShoppingCart, Download, Share2, ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../../store/cartStore';

export default function Step4Review() {
    const { session, reset, selectedProduct } = useTryOnStore();
    const { addItem } = useCartStore();
    const navigate = useNavigate();

    const resultImage = session?.currentResultUrl;

    const handleAddToCart = () => {
        if (!selectedProduct) return;
        addItem({
            productId: selectedProduct.id,
            title: selectedProduct.title,
            price: selectedProduct.price,
            imageUrl: selectedProduct.images?.[0]?.url || selectedProduct.imageUrl,
            quantity: 1
        });
        // Optionally navigate to cart or show success
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase">Rezultatul Tău</h2>
                    <p className="text-gray-500">Iată cum îți stă! Ești gata să îl adaugi în garderobă?</p>
                </div>
                <button
                    onClick={reset}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                    <ArrowLeft size={16} />
                    Începe de la capăt
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="aspect-[3/4] bg-white rounded-[3rem] overflow-hidden border shadow-2xl relative group">
                    {resultImage && <img src={resultImage} className="w-full h-full object-cover" alt="Final Result" />}

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
                        <button className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-black">
                            <Download size={24} />
                        </button>
                        <button className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-black">
                            <Share2 size={24} />
                        </button>
                        <button className="p-4 bg-white text-red-500 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                            <Heart size={24} fill="currentColor" />
                        </button>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border">
                                {selectedProduct && (
                                    <img
                                        src={selectedProduct.images?.[0]?.url || selectedProduct.imageUrl}
                                        className="w-full h-full object-cover"
                                        alt={selectedProduct.title}
                                    />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none mb-1">
                                    {selectedProduct?.title || 'Produsul Selectat'}
                                </h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Disponibil în stoc</p>
                            </div>
                        </div>

                        <div className="p-4 bg-[#F9FAFB] rounded-2xl flex justify-between items-center">
                            <span className="text-sm font-medium">Total de plată</span>
                            <span className="text-xl font-black italic tracking-tighter">
                                {selectedProduct?.price || 0} RON
                            </span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-black text-white py-6 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:scale-[1.02] shadow-xl hover:shadow-black/20 transition-all flex items-center justify-center gap-4 group"
                        >
                            <ShoppingCart className="group-hover:translate-x-1 transition-transform" />
                            Adaugă în Coș
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-green-50 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Potrivire</p>
                            <p className="text-2xl font-black italic tracking-tighter text-green-800">98%</p>
                        </div>
                        <div className="p-6 bg-indigo-50 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-1">Mărime Recomandată</p>
                            <p className="text-2xl font-black italic tracking-tighter text-indigo-800">M</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
