import React from 'react';
import { Button } from '../ui/Button';

interface BannerBlockProps {
    content: {
        title: string;
        description?: string;
        ctaLabel?: string;
        ctaHref?: string;
        imageUrl?: string;
        layout: 'full' | 'side-by-side' | 'minimal';
        alignment: 'left' | 'center' | 'right';
    };
}

export default function BannerBlock({ content }: BannerBlockProps) {
    return (
        <section className="px-6 py-12 bg-hainaria-bg">
            <div className={`container mx-auto overflow-hidden rounded-[24px] bg-hainaria-surface border border-hainaria-border min-h-[400px] flex items-center relative group`}>
                {content.imageUrl && (
                    <div className="absolute inset-0">
                        <img
                            src={content.imageUrl}
                            alt={content.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className={`absolute inset-0 ${content.alignment === 'center' ? 'bg-black/20' : 'bg-gradient-to-r from-black/50 via-black/20 to-transparent'}`} />
                    </div>
                )}

                <div className={`container relative z-10 px-10 md:px-20 py-20 ${content.alignment === 'center' ? 'text-center mx-auto' :
                        content.alignment === 'right' ? 'text-right ml-auto' : 'text-left mr-auto'
                    } max-w-2xl`}>
                    <h2 className="font-serif text-3xl md:text-5xl text-white mb-6 italic leading-tight">
                        {content.title}
                    </h2>
                    {content.description && (
                        <p className="text-white/80 text-lg mb-10 leading-relaxed font-sans">
                            {content.description}
                        </p>
                    )}
                    {content.ctaLabel && (
                        <Button href={content.ctaHref} variant="gold" size="lg">
                            {content.ctaLabel}
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
