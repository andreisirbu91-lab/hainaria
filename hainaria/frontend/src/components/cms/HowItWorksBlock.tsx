import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, Sparkles, Truck, RefreshCw } from 'lucide-react';

const iconMap: any = {
    Shirt,
    Sparkles,
    Truck,
    RefreshCw
};

interface HowItWorksBlockProps {
    content: {
        title: string;
        steps: Array<{
            title: string;
            description: string;
            icon: string;
        }>;
    };
}

export default function HowItWorksBlock({ content }: HowItWorksBlockProps) {
    return (
        <section className="py-24 px-6 bg-hainaria-surface/30">
            <div className="container mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-hainaria-muted block mb-4">
                        Experiența Hainaria
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl text-hainaria-text italic">
                        {content.title}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {content.steps.map((step, idx) => {
                        const Icon = iconMap[step.icon] || Sparkles;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center group"
                            >
                                <div className="w-16 h-16 rounded-full bg-hainaria-bg border border-hainaria-border flex items-center justify-center mx-auto mb-6 text-hainaria-accent group-hover:bg-hainaria-accent group-hover:text-white transition-colors duration-300">
                                    <Icon size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-serif text-xl text-hainaria-text mb-3 italic">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-hainaria-muted leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
