import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { ArrowLeft, Save, Globe, FileText, Layout } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

export default function PageEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { show: showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Page model
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [published, setPublished] = useState(true);
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');

    useEffect(() => {
        if (id) {
            const fetchPage = async () => {
                try {
                    setLoading(true);
                    const res = await api.get(`/admin/pages/${id}`);
                    if (res.data.ok) {
                        const page = res.data.page;
                        setTitle(page.title);
                        setSlug(page.slug);
                        setContent(page.content || '');
                        setPublished(page.status === 'PUBLISHED');
                        setSeoTitle(page.metaTitle || '');
                        setSeoDescription(page.metaDescription || '');
                    }
                } catch (err) {
                    showToast('Eroare la încărcarea paginii', 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchPage();
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleSave = async () => {
        if (!title || !slug) {
            showToast('Titlul și Slug-ul sunt obligatorii', 'error');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                title,
                slug,
                content,
                status: published ? 'PUBLISHED' : 'DRAFT',
                metaTitle: seoTitle,
                metaDescription: seoDescription
            };
            if (id) {
                await api.put(`/admin/pages/${id}`, payload);
                showToast('Pagina a fost actualizată');
            } else {
                await api.post('/admin/pages', payload);
                showToast('Pagina a fost creată');
            }
            navigate('/admin/pages');
        } catch (err) {
            showToast('Eroare la salvare', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center uppercase tracking-widest text-[10px] font-bold">Se încarcă editorul...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
                        <ArrowLeft size={16} /> Înapoi
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-[#111827]">{id ? 'Editează Pagina' : 'Pagină Nouă'}</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Editare Conținut & SEO</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 mr-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                            className="w-4 h-4 text-hainaria-accent rounded border-gray-300 focus:ring-hainaria-accent shadow-inner"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Publicată</span>
                    </label>
                    <Button onClick={handleSave} loading={saving} className="gap-2">
                        <Save size={18} /> Salvează
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── Main Content Editor ── */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardBody className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <InputField label="Titlu Pagină" value={title} onChange={setTitle} placeholder="ex: Termeni și Condiții" />
                                <InputField label="Slug URL" value={slug} onChange={setSlug} placeholder="ex: termeni-si-conditii" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Conținut (Markdown/HTML)</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-96 px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-serif focus:bg-white focus:border-hainaria-accent outline-none transition-all shadow-inner leading-relaxed"
                                    placeholder="Scrie conținutul paginii aici..."
                                />
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* ── SEO Settings ── */}
                <div className="space-y-6">
                    <Card>
                        <CardBody className="p-6 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe size={16} className="text-hainaria-accent" />
                                <h3 className="text-[10px] font-bold uppercase tracking-widest">Setări SEO</h3>
                            </div>

                            <InputField label="SEO Meta Title" value={seoTitle} onChange={setSeoTitle} placeholder="Titlu pentru Google" />

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">SEO Description</label>
                                <textarea
                                    value={seoDescription}
                                    onChange={(e) => setSeoDescription(e.target.value)}
                                    className="w-full h-32 px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-hainaria-accent outline-none transition-all shadow-inner"
                                    placeholder="Scurtă descriere pentru rezultatele căutării..."
                                />
                                <p className="text-[8px] text-gray-400 italic">Recomandat: ~160 caractere</p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-hainaria-surface/30">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText size={16} className="text-hainaria-muted" />
                                <h3 className="text-[10px] font-bold uppercase tracking-widest">Preview Rezultat</h3>
                            </div>
                            <div className="space-y-1">
                                <p className="text-blue-600 text-sm hover:underline font-medium truncate">{seoTitle || title || 'Titlu Pagină'}</p>
                                <p className="text-emerald-700 text-[10px] truncate">https://hainaria.ro/p/{slug || '...'}</p>
                                <p className="text-gray-500 text-[10px] line-clamp-2">{seoDescription || 'Nicio descriere setată. Google va încerca să extragă automat fragmente din conținut.'}</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-hainaria-accent outline-none transition-all shadow-inner"
            />
        </div>
    );
}
