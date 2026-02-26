import React, { useState, useEffect } from 'react';
import { Upload, FolderPlus, Grid, List as ListIcon, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../../../lib/api';

export default function MediaLibrary({ onSelect, multiple = false }: { onSelect?: (assets: any[]) => void, multiple?: boolean }) {
    const [assets, setAssets] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await api.get('/admin/media');
            setAssets(res.data.assets);
            setFolders(res.data.folders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/admin/media/upload', formData);
            setAssets([res.data.asset, ...assets]);
        } catch (err) {
            alert('Eroare la upload');
        } finally {
            setIsUploading(false);
        }
    };

    const toggleSelect = (id: string) => {
        if (!multiple) {
            setSelectedIds([id]);
            return;
        }
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const confirmSelection = () => {
        if (onSelect) {
            const selected = assets.filter(a => selectedIds.includes(a.id));
            onSelect(selected);
        }
    };

    return (
        <div className="bg-white rounded-2xl border h-[600px] flex flex-col overflow-hidden">
            <header className="px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="font-black italic tracking-tighter uppercase">Media Library</h2>
                    <div className="flex border rounded-lg overflow-hidden">
                        <button className="p-2 bg-gray-50 border-r"><Grid size={16} /></button>
                        <button className="p-2 hover:bg-gray-50"><ListIcon size={16} /></button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:scale-[1.02] transition-all flex items-center gap-2">
                        <Upload size={16} />
                        {isUploading ? 'Se încarcă...' : 'Upload'}
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {assets.map((asset) => (
                        <div
                            key={asset.id}
                            onClick={() => toggleSelect(asset.id)}
                            className={`
                                relative aspect-square rounded-xl border-2 overflow-hidden cursor-pointer group transition-all
                                ${selectedIds.includes(asset.id) ? 'border-indigo-600 scale-[0.98]' : 'border-transparent hover:border-gray-200'}
                            `}
                        >
                            {asset.thumbUrl ? (
                                <img src={asset.thumbUrl} className="w-full h-full object-cover" alt={asset.filename} />
                            ) : (
                                <div className="w-full h-full bg-[#f9fafb] flex items-center justify-center text-xs text-gray-400 italic text-center p-2">
                                    {asset.filename}
                                </div>
                            )}

                            {selectedIds.includes(asset.id) && (
                                <div className="absolute top-2 right-2 text-indigo-600">
                                    <CheckCircle2 size={20} fill="white" />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-[10px] text-white font-bold truncate max-w-[80%] px-2">
                                    {asset.filename}
                                </p>
                            </div>
                        </div>
                    ))}
                    {loading && <div className="col-span-full py-20 text-center text-gray-400 italic">Se caută fișiere...</div>}
                </div>
            </div>

            {selectedIds.length > 0 && onSelect && (
                <footer className="p-4 border-t bg-[#F9FAFB] flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {selectedIds.length} fișiere selectate
                    </p>
                    <button
                        onClick={confirmSelection}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all"
                    >
                        Inserează Media
                    </button>
                </footer>
            )}
        </div>
    );
}
