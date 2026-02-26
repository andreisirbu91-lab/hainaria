import { useState, useEffect } from 'react';
import api from '../lib/api';
import CmsBlockRenderer from '../components/cms/CmsBlockRenderer';
import { Skeleton } from '../components/ui/Skeleton';

export default function Home() {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                const res = await api.get('/public/home');
                if (res.data.ok) {
                    setBlocks(res.data.blocks || []);
                }
            } catch (err) {
                console.error('Failed to fetch home content', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    if (loading) {
        return (
            <div className="bg-hainaria-bg min-h-screen">
                <div className="w-full h-[85vh] bg-hainaria-surface animate-pulse" />
                <div className="container mx-auto py-24 px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="aspect-[3/4]" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (blocks.length === 0) {
        return (
            <div className="bg-hainaria-bg min-h-screen flex items-center justify-center p-20 text-center">
                <div>
                    <h1 className="font-serif text-3xl text-hainaria-text mb-4 italic">BINE AI VENIT LA HAINARIA</h1>
                    <p className="text-hainaria-muted uppercase tracking-widest text-xs">Momentan nu există conținut publicat.</p>
                </div>
            </div>
        );
    }

    return (
        <main className="bg-hainaria-bg overflow-x-hidden">
            <CmsBlockRenderer blocks={blocks} />
        </main>
    );
}
