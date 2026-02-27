import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Save, Palette, Globe, Phone, Navigation, Plus, Trash2, Mail, Instagram, Facebook } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

export default function SettingsEditor() {
    const { show: showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({
        storeName: 'Hainaria',
        accentColor: '#7A5C45',
        highlightColor: '#C6A76E',
        borderRadius: 14,
        contactEmail: '',
        contactPhone: '',
        menuItems: [],
        footerColumns: []
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const res = await api.get('/admin/settings');
                if (res.data.ok) {
                    setSettings(res.data.settings || {});
                }
            } catch (err) {
                showToast('Eroare la încărcarea setărilor', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.patch('/admin/settings', settings);
            showToast('Setări salvate cu succes');
        } catch (err) {
            showToast('Eroare la salvare', 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="p-10 text-center uppercase tracking-widest text-[10px] font-bold">Se încarcă setările store-ului...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Setări Store</h1>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold text-[10px]">Configurări globale și identitate vizuală</p>
                </div>
                <Button onClick={handleSave} loading={saving} className="gap-2">
                    <Save size={18} /> Salvează Tot
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Visual Identity ── */}
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader className="flex items-center gap-3 border-b border-gray-100 py-4 px-6">
                            <Palette size={18} className="text-hainaria-accent" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Identitate Vizuală</h3>
                        </CardHeader>
                        <CardBody className="p-6 space-y-4">
                            <InputField label="Nume Store" value={settings.storeName} onChange={(v) => updateField('storeName', v)} />
                            <div className="grid grid-cols-2 gap-4">
                                <ColorField label="Accent" value={settings.accentColor} onChange={(v) => updateField('accentColor', v)} />
                                <ColorField label="Gold" value={settings.highlightColor} onChange={(v) => updateField('highlightColor', v)} />
                            </div>
                            <InputField label="Border Radius (px)" type="number" value={settings.borderRadius} onChange={(v) => updateField('borderRadius', parseInt(v))} />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader className="flex items-center gap-3 border-b border-gray-100 py-4 px-6">
                            <Phone size={18} className="text-hainaria-accent" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Contact & Social</h3>
                        </CardHeader>
                        <CardBody className="p-6 space-y-4">
                            <InputField label="Email Contact" value={settings.contactEmail} onChange={(v) => updateField('contactEmail', v)} />
                            <InputField label="Telefon" value={settings.contactPhone} onChange={(v) => updateField('contactPhone', v)} />
                            <InputField label="Instagram URL" value={settings.instagramUrl} onChange={(v) => updateField('instagramUrl', v)} />
                        </CardBody>
                    </Card>
                </div>

                {/* ── Navigation ── */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader className="flex items-center justify-between border-b border-gray-100 py-4 px-6">
                            <div className="flex items-center gap-3">
                                <Navigation size={18} className="text-hainaria-accent" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Meniu Navigație (Header)</h3>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => updateField('menuItems', [...(settings.menuItems || []), { label: '', href: '' }])}>
                                <Plus size={14} />
                            </Button>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="space-y-3">
                                {(settings.menuItems || []).map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl">
                                        <InputField label="Etichetă" className="flex-grow" value={item.label} onChange={(v) => {
                                            const nav = [...settings.menuItems];
                                            nav[idx].label = v;
                                            updateField('menuItems', nav);
                                        }} />
                                        <InputField label="Link (ex: /shop)" className="flex-grow" value={item.href} onChange={(v) => {
                                            const nav = [...settings.menuItems];
                                            nav[idx].href = v;
                                            updateField('menuItems', nav);
                                        }} />
                                        <button className="text-red-400 mt-6" onClick={() => updateField('menuItems', settings.menuItems.filter((_: any, i: number) => i !== idx))}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader className="flex items-center justify-between border-b border-gray-100 py-4 px-6">
                            <div className="flex items-center gap-3">
                                <Globe size={18} className="text-hainaria-accent" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Coloane Footer</h3>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => updateField('footerColumns', [...(settings.footerColumns || []), { title: '', links: [{ label: '', href: '' }] }])}>
                                <Plus size={14} /> Coloană Nouă
                            </Button>
                        </CardHeader>
                        <CardBody className="p-6 space-y-6">
                            {(settings.footerColumns || []).map((col: any, idx: number) => (
                                <div key={idx} className="border border-gray-100 rounded-2xl p-6 relative">
                                    <button className="absolute top-4 right-4 text-red-400" onClick={() => updateField('footerColumns', settings.footerColumns.filter((_: any, i: number) => i !== idx))}>
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="w-1/2 mb-6">
                                        <InputField label="Titlu Coloană" value={col.title} onChange={(v) => {
                                            const cols = [...settings.footerColumns];
                                            cols[idx].title = v;
                                            updateField('footerColumns', cols);
                                        }} />
                                    </div>
                                    <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                                        {col.links.map((link: any, lIdx: number) => (
                                            <div key={lIdx} className="flex gap-4 items-center">
                                                <InputField label="Text Link" value={link.label} onChange={(v) => {
                                                    const cols = [...settings.footerColumns];
                                                    cols[idx].links[lIdx].label = v;
                                                    updateField('footerColumns', cols);
                                                }} />
                                                <InputField label="HREF" value={link.href} onChange={(v) => {
                                                    const cols = [...settings.footerColumns];
                                                    cols[idx].links[lIdx].href = v;
                                                    updateField('footerColumns', cols);
                                                }} />
                                                <button className="text-red-400 mt-6" onClick={() => {
                                                    const cols = [...settings.footerColumns];
                                                    cols[idx].links = cols[idx].links.filter((_: any, i: number) => i !== lIdx);
                                                    updateField('footerColumns', cols);
                                                }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button className="text-[10px] font-bold uppercase text-hainaria-accent mt-2 hover:underline" onClick={() => {
                                            const cols = [...settings.footerColumns];
                                            cols[idx].links.push({ label: '', href: '' });
                                            updateField('footerColumns', cols);
                                        }}>
                                            + Adaugă Link
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* ──── Form Helpers ──── */

function InputField({ label, value, onChange, className = '', type = 'text' }: any) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-hainaria-accent focus:border-transparent outline-none transition-all shadow-inner"
            />
        </div>
    );
}

function ColorField({ label, value, onChange }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">{label}</label>
            <div className="flex gap-2">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-10 h-10 border-0 p-0 rounded-lg cursor-pointer bg-transparent"
                />
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-mono focus:ring-1 focus:ring-hainaria-accent outline-none"
                    placeholder="#hex"
                />
            </div>
        </div>
    );
}
