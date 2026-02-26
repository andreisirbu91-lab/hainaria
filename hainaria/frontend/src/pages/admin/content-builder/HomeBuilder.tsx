import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import {
    Plus,
    GripVertical,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    ChevronUp,
    ChevronDown,
    Layers,
    Image as ImageIcon,
    LayoutGrid,
    Type,
    Navigation,
    Mail
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

interface ContentBlock {
    id: string;
    type: string;
    position: number;
    active: boolean;
    content: any;
}

const BLOCK_TYPES = [
    { type: 'HERO', label: 'Hero Slider', icon: ImageIcon },
    { type: 'CATEGORY_GRID', label: 'Category Grid', icon: LayoutGrid },
    { type: 'FEATURED_PRODUCTS', label: 'Featured Products', icon: Layers },
    { type: 'HOW_IT_WORKS', label: 'How It Works', icon: Type },
    { type: 'NEWSLETTER', label: 'Newsletter', icon: Mail },
    { type: 'BANNER', label: 'Promotion Banner', icon: Navigation },
];

export default function HomeBuilder() {
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const { show: showToast } = useToast();
    const navigate = useNavigate();

    const fetchBlocks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/home');
            if (res.data.ok) {
                setBlocks(res.data.blocks);
            }
        } catch (err) {
            console.error('Failed to fetch home blocks', err);
            showToast('Eroare la încărcarea blocurilor', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlocks();
    }, []);

    const handleReorder = async (id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;

        const newBlocks = [...blocks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];

        // Update positions
        const reordered = newBlocks.map((b, i) => ({ id: b.id, position: i }));

        try {
            setBlocks(newBlocks); // Optimistic UI
            await api.post('/admin/home/reorder', { blocks: reordered });
            showToast('Ordine actualizată');
        } catch (err) {
            fetchBlocks(); // Revert on error
            showToast('Eroare la reordonare', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Ești sigur că vrei să ștergi acest bloc?')) return;
        try {
            await api.delete(`/admin/home/${id}`);
            setBlocks(blocks.filter(b => b.id !== id));
            showToast('Bloc șters');
        } catch (err) {
            showToast('Eroare la ștergere', 'error');
        }
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        try {
            await api.put(`/admin/home/${id}`, { active: !current });
            setBlocks(blocks.map(b => b.id === id ? { ...b, active: !current } : b));
            showToast(current ? 'Bloc dezactivat' : 'Bloc activat');
        } catch (err) {
            showToast('Eroare la actualizare', 'error');
        }
    };

    if (loading) return <div className="p-10 text-center uppercase tracking-widest text-xs">Se încarcă...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Home Builder</h1>
                    <p className="text-sm text-gray-500 mt-1">Gestionează secțiunile paginii principale și ordinea acestora.</p>
                </div>
                <div className="relative">
                    <Button
                        variant="accent"
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="gap-2"
                    >
                        <Plus size={18} /> Adaugă Secțiune
                    </Button>

                    {showAddMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50">
                            {BLOCK_TYPES.map(bt => (
                                <button
                                    key={bt.type}
                                    onClick={() => {
                                        navigate(`/admin/home-builder/new/${bt.type}`);
                                        setShowAddMenu(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50 text-left transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-hainaria-surface flex items-center justify-center text-hainaria-text">
                                        <bt.icon size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">{bt.label}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{bt.type}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            <div className="space-y-4">
                {blocks.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-20 text-center">
                        <Layers size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Nu există nicio secțiune configurată.</p>
                        <p className="text-xs text-gray-400 mt-2 italic">Începe prin a adăuga prima secțiune pentru a construi homepage-ul.</p>
                    </div>
                ) : (
                    blocks.map((block, index) => {
                        const btInfo = BLOCK_TYPES.find(bt => bt.type === block.type) || BLOCK_TYPES[0];
                        return (
                            <Card key={block.id} className={`overflow-hidden transition-all duration-300 ${!block.active ? 'opacity-60 bg-gray-50' : 'bg-white shadow-sm hover:shadow-md'}`}>
                                <CardBody className="p-0">
                                    <div className="flex items-center">
                                        {/* Reorder Handle */}
                                        <div className="px-4 py-8 border-r border-gray-100 flex flex-col gap-2 bg-gray-50/50">
                                            <button
                                                onClick={() => handleReorder(block.id, 'up')}
                                                disabled={index === 0}
                                                className="text-gray-400 hover:text-hainaria-accent disabled:opacity-20"
                                            >
                                                <ChevronUp size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleReorder(block.id, 'down')}
                                                disabled={index === blocks.length - 1}
                                                className="text-gray-400 hover:text-hainaria-accent disabled:opacity-20"
                                            >
                                                <ChevronDown size={20} />
                                            </button>
                                        </div>

                                        {/* Block Info */}
                                        <div className="flex-1 px-6 py-4 flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-xl bg-hainaria-bg flex items-center justify-center text-hainaria-accent shadow-inner">
                                                <btInfo.icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-gray-900">{btInfo.label}</h3>
                                                    <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-bold uppercase tracking-widest">
                                                        {block.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 truncate max-w-sm">
                                                    {Object.keys(block.content || {}).length > 0 ? "Configurat" : "Fără conținut"} • Poziție: {block.position}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleActive(block.id, block.active)}
                                                    className={`p-2 rounded-lg transition-colors ${block.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                    title={block.active ? "Activ" : "Inactiv"}
                                                >
                                                    {block.active ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/home-builder/edit/${block.id}`)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editează conținut"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(block.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Șterge bloc"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
