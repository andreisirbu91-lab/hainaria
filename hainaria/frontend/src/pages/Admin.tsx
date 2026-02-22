import { useState } from 'react';
import api, { getErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Input, Label, Button, Card, CardHeader, CardBody, Divider, useToast } from '../components/ui';

export default function Admin() {
    const { user, token } = useAuthStore();
    const navigate = useNavigate();
    const { show: showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [size, setSize] = useState('M');
    const [condition, setCondition] = useState('SECOND_HAND');
    const [stock, setStock] = useState('1');

    const [image, setImage] = useState<File | null>(null);

    // Non-admin block
    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4" style={{ background: 'var(--bg)' }}>
                <h1 className="text-3xl font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text)' }}>Acces Interzis</h1>
                <p className="text-[10px] uppercase tracking-widest mb-8" style={{ color: 'var(--muted)' }}>
                    Trebuie să fii autentificat ca administrator pentru a vedea această pagină.
                </p>
                <Button onClick={() => navigate('/')}>Înapoi la Home</Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) {
            showToast('Imaginea principală este obligatorie!', 'error');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('size', size);
        formData.append('condition', condition);
        formData.append('stock', stock);
        formData.append('image', image);

        try {
            await api.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } // token is injected automatically by api.ts interceptor
            });
            showToast('Produs adăugat cu succes!');
            // Reset form
            setTitle(''); setDescription(''); setPrice(''); setCategory('');
            setImage(null);
        } catch (err: any) {
            console.error(err);
            showToast(`Eroare: ${getErrorMessage(err)}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* ── Header ── */}
                <div className="page-header">
                    <p className="page-header-subtitle">Management</p>
                    <h1 className="page-header-title">Panou Administrator</h1>
                </div>

                <Card>
                    <CardHeader>
                        <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--text)' }}>
                            Adaugă Produs Nou
                        </h2>
                    </CardHeader>

                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Titlu Produs" required value={title} onChange={e => setTitle(e.target.value)} />
                                <Input label="Preț (lei)" type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label>Descriere</Label>
                                <textarea
                                    required
                                    rows={3}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="input-base resize-y"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Input label="Categorie" required value={category} onChange={e => setCategory(e.target.value)} placeholder="Ex: Geci, Tricouri" />
                                <Input label="Mărime" required value={size} onChange={e => setSize(e.target.value)} />

                                <div className="flex flex-col gap-1.5">
                                    <Label>Stare</Label>
                                    <select
                                        value={condition}
                                        onChange={e => setCondition(e.target.value)}
                                        className="input-base appearance-none bg-no-repeat"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888880'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                                    >
                                        <option value="SECOND_HAND">Second Hand</option>
                                        <option value="OUTLET">Outlet</option>
                                    </select>
                                </div>

                                <Input label="Stoc" type="number" required min="1" value={stock} onChange={e => setStock(e.target.value)} />
                            </div>

                            <div className="border border-dashed p-6 mt-8" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                                <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--text)' }}>
                                    Imagini
                                </h3>
                                <div>
                                    <Label>Imagine Principală (Obligatorie)</Label>
                                    <input
                                        type="file"
                                        required
                                        accept="image/*"
                                        onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-sm block cursor-pointer
                                                   file:mr-4 file:py-2 file:px-4 
                                                   file:border-0 file:text-[10px] file:font-semibold file:uppercase file:tracking-widest
                                                   file:bg-[var(--text)] file:text-[var(--bg)]
                                                   hover:file:bg-[#2a2a2a] file:transition-colors file:cursor-pointer"
                                        style={{ color: 'var(--muted)' }}
                                    />
                                </div>
                            </div>

                            <Divider className="my-6" />

                            <div className="pt-2">
                                <Button type="submit" loading={loading} className="w-full">
                                    Salvează Produs
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
