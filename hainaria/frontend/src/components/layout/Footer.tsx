import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import Logo from '../ui/Logo';

interface FooterColumn {
    title: string;
    links: Array<{ label: string, href: string }>;
}

export default function Footer() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/public/settings');
                if (res.data.ok) {
                    setSettings(res.data.settings);
                }
            } catch (err) {
                console.error('Failed to fetch footer settings', err);
            }
        };
        fetchSettings();
    }, []);

    const columns: FooterColumn[] = settings?.footerColumns || [
        {
            title: 'Hainăria',
            links: [
                { label: 'Despre Noi', href: '/p/despre-noi' },
                { label: 'Colecție', href: '/shop' },
                { label: 'Studio VTO', href: '/studio' },
            ]
        },
        {
            title: 'Asistență',
            links: [
                { label: 'Contact', href: '/p/contact' },
                { label: 'Întrebări Frecvente', href: '/p/faq' },
                { label: 'Livrare și Retur', href: '/p/livrare' },
            ]
        },
        {
            title: 'Legal',
            links: [
                { label: 'Termeni și Condiții', href: '/p/termeni' },
                { label: 'Politică de Confidențialitate', href: '/p/privacy' },
                { label: 'ANPC', href: 'https://anpc.ro' },
            ]
        }
    ];

    return (
        <footer className="bg-hainaria-bg border-t border-hainaria-border pt-24 pb-12 px-6">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="mb-8 block">
                            <Logo size="lg" />
                        </Link>
                        <p className="text-hainaria-muted text-sm leading-relaxed max-w-sm mb-10">
                            Curatorii tăi de modă sustenabilă. Descoperă piese unice, verificate și pregătite pentru o nouă viață. Eleganță fără compromisuri.
                        </p>
                        <div className="flex items-center gap-4 text-hainaria-text/60">
                            {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-hainaria-accent transition-colors"><Instagram size={20} /></a>}
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-hainaria-accent transition-colors"><Facebook size={20} /></a>
                        </div>
                    </div>

                    {/* Columns */}
                    {columns.map((col, idx) => (
                        <div key={idx}>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-hainaria-text mb-8">
                                {col.title}
                            </h4>
                            <ul className="flex flex-col gap-4">
                                {col.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link
                                            to={link.href}
                                            className="text-sm text-hainaria-muted hover:text-hainaria-accent transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-hainaria-border flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] text-hainaria-muted uppercase tracking-widest">
                        © {new Date().getFullYear()} {settings?.storeName || 'Hainaria'}. Toate drepturile rezervate.
                    </p>
                    <div className="flex items-center gap-8 text-[10px] text-hainaria-muted uppercase tracking-widest">
                        {settings?.address && <span className="flex items-center gap-2">
                            <MapPin size={12} className="text-hainaria-gold" /> {settings.address}
                        </span>}
                        {settings?.contactPhone && <span className="flex items-center gap-2">
                            <Phone size={12} className="text-hainaria-gold" /> {settings.contactPhone}
                        </span>}
                        {settings?.contactEmail && <span className="flex items-center gap-2">
                            <Mail size={12} className="text-hainaria-gold" /> {settings.contactEmail}
                        </span>}
                    </div>
                </div>
            </div>
        </footer>
    );
}
