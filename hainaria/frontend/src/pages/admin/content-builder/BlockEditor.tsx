import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { ArrowLeft, Save, Plus, Trash2, Layout, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

export default function BlockEditor() {
    const { id, type: newType } = useParams();
    const navigate = useNavigate();
    const { show: showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [type, setType] = useState(newType || 'HERO');
    const [active, setActive] = useState(true);
    const [content, setContent] = useState<any>({});

    useEffect(() => {
        if (id) {
            const fetchBlock = async () => {
                try {
                    setLoading(true);
                    const res = await api.get(`/admin/home/${id}`);
                    if (res.data.ok) {
                        const block = res.data.block;
                        setType(block.type);
                        setActive(block.active);
                        setContent(block.content || {});
                    }
                } catch (err) {
                    showToast('Eroare la încărcarea blocului', 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchBlock();
        } else {
            // Initialize default content for new block
            setLoading(false);
            initializeDefaultContent(newType || 'HERO');
        }
    }, [id, newType]);

    const initializeDefaultContent = (t: string) => {
        switch (t) {
            case 'HERO':
                setContent({ slides: [{ image: '', title: '', subtitle: '', ctaText: '', ctaLink: '' }] });
                break;
            case 'CATEGORY_GRID':
                setContent({ title: '', categories: [{ id: '', label: '', image: '', span: 'normal', link: '' }] });
                break;
            case 'FEATURED_PRODUCTS':
                setContent({ title: '', subtitle: '', limit: 4, collectionSlug: '' });
                break;
            case 'BANNER':
                setContent({ image: '', title: '', subtitle: '', buttonText: '', buttonLink: '', alignment: 'center' });
                break;
            case 'NEWSLETTER':
                setContent({ title: 'Rămâi în contact', subtitle: 'Abonează-te pentru noutăți' });
                break;
            default:
                setContent({});
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = { type, active, content };
            if (id) {
                await api.put(`/admin/home/${id}`, payload);
                showToast('Bloc actualizat cu succes');
            } else {
                await api.post('/admin/home', payload);
                showToast('Bloc creat cu succes');
            }
            navigate('/admin/home-builder');
        } catch (err) {
            showToast('Eroare la salvare', 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateContent = (field: string, value: any) => {
        setContent((prev: any) => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="p-10 text-center uppercase tracking-[0.2em] text-[10px] font-bold">Se încarcă editorul...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {id ? `Editează ${type}` : `Creează ${type}`}
                        </h1>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Configurează conținutul vizual</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 mr-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            className="w-4 h-4 text-hainaria-accent rounded border-gray-300 focus:ring-hainaria-accent"
                        />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Activ</span>
                    </label>
                    <Button onClick={handleSave} loading={saving} className="gap-2">
                        <Save size={18} /> Salvează
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {/* ── Type Specific Editor ── */}
                {type === 'HERO' && <HeroEditor content={content} update={updateContent} />}
                {type === 'CATEGORY_GRID' && <CategoryGridEditor content={content} update={updateContent} />}
                {type === 'FEATURED_PRODUCTS' && <FeaturedProductsEditor content={content} update={updateContent} />}
                {type === 'BANNER' && <BannerEditor content={content} update={updateContent} />}
                {type === 'NEWSLETTER' && <NewsletterEditor content={content} update={updateContent} />}
            </div>
        </div>
    );
}

/* ──── Sub-Editors ──── */

function HeroEditor({ content, update }: any) {
    const slides = content.slides || [];
    const updateSlide = (idx: number, field: string, value: any) => {
        const newSlides = [...slides];
        newSlides[idx] = { ...newSlides[idx], [field]: value };
        update('slides', newSlides);
    };

    return (
        <div className="space-y-6">
            {slides.map((slide: any, idx: number) => (
                <Card key={idx}>
                    <CardHeader className="flex justify-between items-center py-4 px-6 border-b border-gray-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest">Slide #{idx + 1}</h3>
                        <button
                            onClick={() => update('slides', slides.filter((_: any, i: number) => i !== idx))}
                            className="text-red-500 hover:text-red-700 p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </CardHeader>
                    <CardBody className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Titlu Principal" value={slide.title} onChange={(v) => updateSlide(idx, 'title', v)} />
                            <InputField label="Subtitlu" value={slide.subtitle} onChange={(v) => updateSlide(idx, 'subtitle', v)} />
                        </div>
                        <InputField label="URL Imagine" value={slide.image} onChange={(v) => updateSlide(idx, 'image', v)} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Text Buton" value={slide.ctaText} onChange={(v) => updateSlide(idx, 'ctaText', v)} />
                            <InputField label="Link Buton" value={slide.ctaLink} onChange={(v) => updateSlide(idx, 'ctaLink', v)} />
                        </div>
                    </CardBody>
                </Card>
            ))}
            <Button variant="outline" fullWidth onClick={() => update('slides', [...slides, { image: '', title: '', subtitle: '', ctaText: '', ctaLink: '' }])}>
                <Plus size={16} className="mr-2" /> Adaugă Slide
            </Button>
        </div>
    );
}

function CategoryGridEditor({ content, update }: any) {
    const categories = content.categories || [];
    const updateCat = (idx: number, field: string, value: any) => {
        const newCats = [...categories];
        newCats[idx] = { ...newCats[idx], [field]: value };
        update('categories', newCats);
    };

    return (
        <Card>
            <CardBody className="p-6 space-y-6">
                <InputField label="Titlu Secțiune (opțional)" value={content.title} onChange={(v) => update('title', v)} />
                <div className="space-y-6">
                    {categories.map((cat: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400">Categorie #{idx + 1}</span>
                                <button onClick={() => update('categories', categories.filter((_: any, i: number) => i !== idx))}>
                                    <Trash2 size={14} className="text-red-400" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Etichetă" value={cat.label} onChange={(v) => updateCat(idx, 'label', v)} />
                                <InputField label="Imagine URL" value={cat.image} onChange={(v) => updateCat(idx, 'image', v)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Link" value={cat.link} onChange={(v) => updateCat(idx, 'link', v)} />
                                <SelectField
                                    label="Dimensiune"
                                    value={cat.span}
                                    options={[{ v: 'normal', l: 'Normal' }, { v: 'large', l: 'Lată (2 coloane)' }]}
                                    onChange={(v) => updateCat(idx, 'span', v)}
                                />
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => update('categories', [...categories, { id: '', label: '', image: '', span: 'normal', link: '' }])}>
                        <Plus size={14} className="mr-2" /> Adaugă Categorie
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}

function FeaturedProductsEditor({ content, update }: any) {
    return (
        <Card>
            <CardBody className="p-6 space-y-4">
                <InputField label="Titlu" value={content.title} onChange={(v) => update('title', v)} />
                <InputField label="Subtitlu" value={content.subtitle} onChange={(v) => update('subtitle', v)} />
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Limită Produse" type="number" value={content.limit} onChange={(v) => update('limit', parseInt(v))} />
                    <InputField label="Colecție Slug (opțional)" value={content.collectionSlug} onChange={(v) => update('collectionSlug', v)} />
                </div>
            </CardBody>
        </Card>
    );
}

function BannerEditor({ content, update }: any) {
    return (
        <Card>
            <CardBody className="p-6 space-y-4">
                <InputField label="Imagine Fundal" value={content.image} onChange={(v) => update('image', v)} />
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Titlu" value={content.title} onChange={(v) => update('title', v)} />
                    <InputField label="Subtitlu" value={content.subtitle} onChange={(v) => update('subtitle', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Text Buton" value={content.buttonText} onChange={(v) => update('buttonText', v)} />
                    <InputField label="Link Buton" value={content.buttonLink} onChange={(v) => update('buttonLink', v)} />
                </div>
                <SelectField
                    label="Aliniere"
                    value={content.alignment}
                    options={[{ v: 'left', l: 'Stânga' }, { v: 'center', l: 'Centru' }, { v: 'right', l: 'Dreapta' }]}
                    onChange={(v) => update('alignment', v)}
                />
            </CardBody>
        </Card>
    );
}

function NewsletterEditor({ content, update }: any) {
    return (
        <Card>
            <CardBody className="p-6 space-y-4">
                <InputField label="Titlu" value={content.title} onChange={(v) => update('title', v)} />
                <InputField label="Subtitlu" value={content.subtitle} onChange={(v) => update('subtitle', v)} />
            </CardBody>
        </Card>
    );
}

/* ──── Form Helpers ──── */

function InputField({ label, value, onChange, type = 'text' }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-hainaria-accent focus:border-transparent outline-none transition-all shadow-sm"
            />
        </div>
    );
}

function SelectField({ label, value, options, onChange }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-hainaria-accent focus:border-transparent outline-none transition-all shadow-sm appearance-none"
            >
                {options.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
        </div>
    );
}
