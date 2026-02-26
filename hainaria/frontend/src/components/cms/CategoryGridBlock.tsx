import React from 'react';
import { motion } from 'framer-motion';

interface Collection {
    id: string;
    title: string;
    slug: string;
    imageUrl?: string;
}

interface CategoryGridBlockProps {
    content: {
        title: string;
        categories: Array<{
            id: string;
            label: string;
            href: string;
            imageUrl?: string;
            span?: 'normal' | 'wide' | 'tall';
        }>;
        showUnder99?: boolean;
        under99Url?: string;
    };
}

export default function CategoryGridBlock({ content }: CategoryGridBlockProps) {
    return (
        <section className="py-24 px-6 bg-hainaria-bg">
            <div className="container mx-auto">
                {content.title && (
                    <h2 className="font-serif text-3xl md:text-4xl text-hainaria-text mb-12 text-center">
                        {content.title}
                    </h2>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {content.categories.map((cat, idx) => (
                        <motion.a
                            key={cat.id}
                            href={cat.href}
                            whileHover={{ y: -5 }}
                            className={`relative group overflow-hidden rounded-[18px] bg-hainaria-surface ${cat.span === 'wide' ? 'md:col-span-2' :
                                    cat.span === 'tall' ? 'row-span-2' : ''
                                } aspect-[4/5]`}
                        >
                            <img
                                src={cat.imageUrl || `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800`}
                                alt={cat.label}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-hainaria-text/60 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-2">
                                    Explorează
                                </span>
                                <h3 className="text-xl md:text-2xl text-white font-serif italic">
                                    {cat.label}
                                </h3>
                            </div>
                        </motion.a>
                    ))}

                    {content.showUnder99 && (
                        <a
                            href={content.under99Url || "/shop?maxPrice=99"}
                            className="relative col-span-2 md:col-span-1 bg-hainaria-accent rounded-[18px] p-8 flex flex-col justify-end group overflow-hidden h-full min-h-[250px]"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <span className="text-8xl font-serif text-white italic font-black">99</span>
                            </div>
                            <div className="relative z-10">
                                <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/80 mb-2 font-sans">
                                    Budget Friendly
                                </span>
                                <h3 className="text-2xl text-white font-serif italic mb-4">
                                    Sub 99 RON
                                </h3>
                                <div className="w-10 h-[1px] bg-white group-hover:w-full transition-all duration-500" />
                            </div>
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}
