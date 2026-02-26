import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { Skeleton } from '../components/ui/Skeleton';

interface PageData {
    title: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
}

export default function StaticPage() {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                setLoading(true);
                setError(false);
                const res = await api.get(`/public/pages/${slug}`);
                if (res.data.ok) {
                    setPage(res.data.page);

                    // Update SEO metadata
                    document.title = `${res.data.page.metaTitle || res.data.page.title} | Hainaria`;
                    const metaDesc = document.querySelector('meta[name="description"]');
                    if (metaDesc) {
                        metaDesc.setAttribute('content', res.data.page.metaDescription || '');
                    }
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Failed to fetch static page', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="bg-hainaria-bg min-h-screen pt-32 pb-24 px-6">
                <div className="container mx-auto max-w-3xl">
                    <Skeleton className="h-12 w-3/4 mb-12" />
                    <Skeleton className="h-6 w-full mb-4" />
                    <Skeleton className="h-6 w-full mb-4" />
                    <Skeleton className="h-6 w-4/5 mb-4" />
                    <Skeleton className="h-6 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-4" />
                </div>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="bg-hainaria-bg min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center">
                <h1 className="font-serif text-3xl text-hainaria-text mb-4 italic">PAGINA NU A FOST GĂSITĂ</h1>
                <p className="text-hainaria-muted uppercase tracking-widest text-xs">Ne cerem scuze, dar pagina căutată nu există sau a fost mutată.</p>
            </div>
        );
    }

    return (
        <div className="bg-hainaria-bg min-h-screen pt-32 pb-24 px-6">
            <article className="container mx-auto max-w-3xl">
                <header className="mb-16 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-hainaria-muted block mb-4">
                        Informații Utile
                    </span>
                    <h1 className="font-serif text-4xl md:text-5xl text-hainaria-text italic leading-tight">
                        {page.title}
                    </h1>
                    <div className="w-12 h-[1px] bg-hainaria-gold mx-auto mt-8" />
                </header>

                <div
                    className="prose prose-hainaria max-w-none text-hainaria-text/90 leading-relaxed font-sans prose-headings:font-serif prose-headings:italic prose-headings:text-hainaria-text prose-a:text-hainaria-accent prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            </article>
        </div>
    );
}
