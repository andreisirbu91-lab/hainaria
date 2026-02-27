import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Droplets, Leaf, ShieldCheck, Sparkles } from 'lucide-react';

export default function About() {
    return (
        <div className="bg-[#Fdfbf7] min-h-screen font-sans text-[#2D241E] overflow-hidden">
            {/* ── SEO Meta ── */}
            <title>Povestea Noastră | Hainaria</title>
            <meta name="description" content="Descoperă povestea Hainaria — modă premium, sustenabilă și verificată, o comunitate care învață să îmbrace autenticitatea." />

            {/* ── Hero Section ── */}
            <section className="relative pt-32 pb-24 px-6 md:pt-40 md:pb-32 lg:h-[90vh] flex flex-col justify-center items-center text-center">
                {/* Subtle textured noise overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/linen.png")' }} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="container mx-auto max-w-4xl relative z-10"
                >
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A68A7C] block mb-8">
                        Povestea Noastră
                    </span>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] text-[#1A1512] mb-8">
                        HAINARIA – Mai mult decât haine. <br className="hidden md:block" />
                        <span className="italic text-[#8C6E5D] font-light">O poveste despre stil, curaj și reinventare.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#5C4D43] font-light max-w-2xl mx-auto mb-12 leading-relaxed">
                        Dintr-o copilărie printre rafturi de second-hand, către o comunitate care învață să îmbrace autenticitatea.
                    </p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/60 backdrop-blur-md border border-[#E5D7D0] rounded-full text-sm uppercase tracking-widest font-bold text-[#8C6E5D] hover:bg-white hover:border-[#8C6E5D] transition-all duration-500 shadow-sm hover:shadow-md group"
                    >
                        Descoperă Colecțiile
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </section>

            {/* ── Cum a început totul ── */}
            <section className="py-24 px-6 bg-white relative">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-full md:w-1/2"
                        >
                            <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1485230895905-31d7439ea28e?auto=format&fit=crop&q=80&w=1200"
                                    alt="Atelier"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-[#A68A7C]/10 mix-blend-multiply" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-full md:w-1/2 space-y-8"
                        >
                            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1A1512] mb-6">
                                Cum a <span className="italic text-[#8C6E5D]">început</span> totul
                            </h2>
                            <div className="w-16 h-[1px] bg-[#DBC6BB]" />
                            <div className="space-y-6 text-[#5C4D43] leading-relaxed text-lg font-light">
                                <p>
                                    HAINARIA s-a născut dintr-o poveste personală. O copilărie petrecută printre haine second-hand nu a fost o limitare, ci <strong className="font-normal text-[#2D241E]">o școală a creativității</strong>.
                                </p>
                                <p>
                                    Fiecare piesă devenea o provocare: <br />
                                    <span className="italic">Cum o asortezi? Cum o transformi? Cum o faci să spună ceva despre tine?</span>
                                </p>
                                <p>
                                    Din această nevoie de a crea din puțin, de a vedea potențialul acolo unde alții vedeau doar “folosit”, s-a format gustul pentru styling și atenția pentru detalii.
                                </p>
                                <p>
                                    În 2023, HAINARIA a prins formă oficial. Astăzi suntem în cea mai mare parte online, aproape de femeile care caută stil fără compromisuri.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Filosofia Noastră ── */}
            <section className="py-32 px-6 bg-[#Fdfbf7] relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/linen.png")' }} />

                <div className="container mx-auto max-w-4xl text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A68A7C] block mb-6">
                        Filosofia Noastră
                    </span>
                    <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-[#1A1512] mb-12 leading-tight">
                        „Moda nu înseamnă preț. <br className="hidden md:block" />
                        <span className="italic text-[#8C6E5D]">Înseamnă viziune.</span>”
                    </h2>

                    <div className="text-[#5C4D43] leading-relaxed text-lg font-light space-y-6">
                        <p>
                            Credem că stilul autentic nu se cumpără, se construiește. Fiecare piesă este selectată cu atenție pentru calitate, croială și potențial de styling.
                        </p>
                        <p>
                            <strong className="font-normal text-[#2D241E]">Nu urmărim trenduri oarbe. Urmărim expresie personală.</strong>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-16 text-left">
                        {[
                            { icon: Sparkles, text: "Libertatea de a combina" },
                            { icon: Droplets, text: "Curajul de a experimenta" },
                            { icon: ShieldCheck, text: "Rafinament accesibil" },
                            { icon: Leaf, text: "Sustenabilitate prin reutilizare inteligentă" }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-6 bg-white/50 border border-[#E5D7D0] rounded-2xl">
                                <item.icon className="text-[#8C6E5D] flex-shrink-0" size={24} strokeWidth={1.5} />
                                <span className="text-[#2D241E] font-serif text-lg">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Misiunea Noastră ── */}
            <section className="py-24 px-6 bg-[#2D241E] text-[#Fdfbf7]">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row-reverse items-center gap-16 lg:gap-24">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-full md:w-1/2"
                        >
                            <div className="relative aspect-square md:aspect-[4/5] rounded-[32px] overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1550614000-4b95d4ebfa88?auto=format&fit=crop&q=80&w=1200"
                                    alt="Misiune"
                                    className="w-full h-full object-cover opacity-90 grayscale-[20%]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2D241E] via-transparent to-transparent opacity-80" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-full md:w-1/2 space-y-8"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#A68A7C] block mb-2">
                                Scop
                            </span>
                            <h2 className="font-serif text-3xl md:text-5xl text-white mb-6">
                                Misiunea <span className="italic text-[#DBC6BB]">Hainaria</span>
                            </h2>
                            <div className="w-16 h-[1px] bg-[#A68A7C]" />

                            <p className="text-[#DBC6BB] leading-relaxed text-lg font-light">
                                Misiunea noastră este să oferim femeilor posibilitatea de a construi ținute memorabile, fără presiunea etichetelor de preț.
                            </p>

                            <ul className="space-y-4 text-lg font-light text-[#E8DED8]">
                                <li className="flex items-start gap-4">
                                    <span className="text-[#A68A7C] mt-1">01.</span>
                                    <span>Să promovăm moda circulară</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-[#A68A7C] mt-1">02.</span>
                                    <span>Să reducem risipa din industria fashion</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-[#A68A7C] mt-1">03.</span>
                                    <span>Să educăm gustul pentru styling autentic</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-[#A68A7C] mt-1">04.</span>
                                    <span>Să construim o comunitate de femei sigure pe ele</span>
                                </li>
                            </ul>

                            <blockquote className="border-l-2 border-[#8C6E5D] pl-6 py-2 mt-10">
                                <p className="font-serif italic text-xl text-white">
                                    "HAINARIA nu este doar un magazin. Este o platformă de expresie personală."
                                </p>
                            </blockquote>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="py-24 px-6 bg-white border-b border-[#F5EGEA]">
                <div className="container mx-auto max-w-3xl">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl text-[#1A1512] mb-4">
                            Întrebări Frecvente
                        </h2>
                        <p className="text-[#8C6E5D] font-light">
                            Tot ce trebuie să știi despre experiența Hainaria.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                q: "Sunt toate produsele second-hand?",
                                a: "Majoritatea pieselor noastre sunt second-hand și vintage, selectate manual pentru calitate excepțională. Avem ocazional și piese cu etichetă nouă (deadstock) salvate din surplusuri, promovând astfel principiul modei circulare."
                            },
                            {
                                q: "Cum selectăm piesele?",
                                a: "Fiecare produs trece printr-un filtru riguros. Ne uităm la compoziția materialului (prioritizăm fibre naturale precum mătase, lână, bumbac, cașmir), la starea generală, la croială și la potențialul atemporal al piesei. Orice defect este menționat transparent."
                            },
                            {
                                q: "Cum pot primi recomandări de styling?",
                                a: "Studio-ul nostru Virtual Try-On îți permite să probezi piesele pe tine instant cu ajutorul AI-ului. În plus, pe paginile noastre de social media împărtășim constant idei editoriale de asortare și poți întotdeauna să ne dai un mesaj privat pentru sugestii."
                            }
                        ].map((faq, idx) => (
                            <details key={idx} className="group border-b border-[#E5D7D0] pb-6 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex items-center justify-between cursor-pointer font-serif text-lg md:text-xl text-[#2D241E]">
                                    {faq.q}
                                    <span className="transition group-open:rotate-45 text-[#8C6E5D] text-2xl font-light">+</span>
                                </summary>
                                <p className="text-[#5C4D43] font-light leading-relaxed mt-4">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="py-32 px-6 bg-[#Fdfbf7] text-center">
                <div className="container mx-auto max-w-2xl">
                    <h2 className="font-serif text-3xl md:text-5xl text-[#1A1512] mb-8 italic">
                        Ești gata să-ți redefinești stilul?
                    </h2>
                    <p className="text-[#5C4D43] font-light mb-12">
                        Pășește în colecția noastră și găsește piesa care te aștepta pe tine.
                    </p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center justify-center px-10 py-5 bg-[#2D241E] text-white rounded-full text-sm uppercase tracking-widest font-bold hover:bg-[#1A1512] transition-colors focus:ring-4 ring-[#8C6E5D]/20 shadow-xl"
                    >
                        Explorează Colecția
                    </Link>
                </div>
            </section>
        </div>
    );
}
