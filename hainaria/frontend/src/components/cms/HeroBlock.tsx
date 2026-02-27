import React from 'react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

interface HeroBlockProps {
    content: {
        heading: string;
        subheading: string;
        primaryCtaLabel: string;
        primaryCtaHref: string;
        secondaryCtaLabel?: string;
        secondaryCtaHref?: string;
        imageUrl?: string;
        trustItems?: string[];
    };
}

export default function HeroBlock({ content }: HeroBlockProps) {
    const slide = content?.slides?.[0] || content;

    return (
        <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-hainaria-bg">
            {/* Background Image with Warm Overlay */}
            <div className="absolute inset-0">
                <img
                    src={slide.image || slide.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000"}
                    alt="Hero"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-hainaria-bg/40 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Content Card (Luxury Boutique Style) */}
            <div className="container relative z-10 px-6 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-2xl bg-hainaria-bg/85 backdrop-blur-md p-6 sm:p-10 md:p-16 w-full rounded-[20px] shadow-2xl border border-hainaria-border"
                >
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl mb-4 md:mb-6 leading-[1.1] text-hainaria-text italic">
                        {slide.title || slide.heading}
                    </h1>
                    <p className="text-hainaria-muted text-lg mb-10 leading-relaxed max-w-md">
                        {slide.subtitle || slide.subheading}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-0">
                        <Button href={slide.ctaLink || slide.primaryCtaHref} variant="gold" size="lg" className="w-full sm:w-auto min-w-[200px]">
                            {slide.ctaText || slide.primaryCtaLabel}
                        </Button>
                        {slide.secondaryCtaLabel && (
                            <Button href={slide.secondaryCtaHref} variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
                                {slide.secondaryCtaLabel}
                            </Button>
                        )}
                    </div>

                    {slide.trustItems && slide.trustItems.length > 0 && (
                        <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-hainaria-border pt-8">
                            {content.trustItems.map((item, idx) => (
                                <span key={idx} className="text-[10px] font-bold uppercase tracking-[0.2em] text-hainaria-muted flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-hainaria-gold" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
