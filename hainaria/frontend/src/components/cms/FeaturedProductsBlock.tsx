import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ShoppingCart, Heart } from 'lucide-react';
import api from '../../lib/api';

interface Product {
    id: string;
    title: string;
    price: number;
    slug: string;
    images: Array<{ url: string }>;
    category: string;
}

interface FeaturedProductsBlockProps {
    content: {
        title: string;
        mode: 'manual' | 'collection' | 'new_in';
        collectionId?: string;
        productIds?: string[];
        maxItems?: number;
    };
}

export default function FeaturedProductsBlock({ content }: FeaturedProductsBlockProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let url = '/public/products';
                if (content.mode === 'collection' && content.collectionId) {
                    url = `/public/products?collection=${content.collectionId}&limit=${content.maxItems || 4}`;
                } else if (content.mode === 'new_in') {
                    url = `/public/products?sort=new&limit=${content.maxItems || 4}`;
                }

                const res = await api.get(url);
                setProducts(res.data.products?.slice(0, content.maxItems || 4) || []);
            } catch (err) {
                console.error('Failed to fetch featured products', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [content]);

    if (loading) return (
        <section className="py-24 px-6 bg-hainaria-bg">
            <div className="container mx-auto">
                <div className="h-8 w-64 bg-hainaria-surface animate-pulse mb-12 mx-auto rounded-full" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-[3/4] bg-hainaria-surface animate-pulse rounded-[18px]" />
                    ))}
                </div>
            </div>
        </section>
    );

    return (
        <section className="py-24 px-6 bg-hainaria-bg">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-hainaria-muted block mb-2">
                            Curated Selection
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl text-hainaria-text italic">
                            {content.title}
                        </h2>
                    </div>
                    <Button variant="outline" href="/shop" className="md:px-10">
                        Vezi Tot Catalogul
                    </Button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="group cursor-pointer">
                            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-hainaria-surface mb-4">
                                <img
                                    src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1539109132314-347f8541e4a0?auto=format&fit=crop&q=80&w=800"}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                    <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-hainaria-text hover:bg-hainaria-gold hover:text-white transition-colors">
                                        <Heart size={18} />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-hainaria-text hover:bg-hainaria-accent hover:text-white transition-colors">
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-hainaria-text mb-1 group-hover:text-hainaria-accent transition-colors">
                                {product.title}
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-hainaria-muted uppercase tracking-widest">{product.category}</span>
                                <span className="text-sm font-bold text-hainaria-text">{product.price} RON</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
