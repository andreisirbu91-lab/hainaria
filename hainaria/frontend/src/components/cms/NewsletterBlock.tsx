import React from 'react';
import { Button } from '../ui/Button';

interface NewsletterBlockProps {
    content: {
        title: string;
        description: string;
        placeholder?: string;
        buttonLabel?: string;
    };
}

export default function NewsletterBlock({ content }: NewsletterBlockProps) {
    return (
        <section className="py-24 px-6 bg-hainaria-bg">
            <div className="container mx-auto max-w-4xl">
                <div className="bg-hainaria-accent rounded-[24px] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-hainaria-gold/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <h2 className="font-serif text-3xl md:text-5xl text-white mb-6 italic">
                            {content.title}
                        </h2>
                        <p className="text-white/80 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                            {content.description}
                        </p>

                        <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder={content.placeholder || "Adresa ta de email..."}
                                className="flex-1 bg-white/10 border border-white/20 rounded-[14px] px-6 py-4 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 transition-colors"
                            />
                            <Button variant="gold" className="md:px-8">
                                {content.buttonLabel || "Abonează-te"}
                            </Button>
                        </form>

                        <p className="mt-6 text-[10px] text-white/50 uppercase tracking-widest font-sans">
                            Prin abonare, ești de acord cu Politica de Confidențialitate.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
