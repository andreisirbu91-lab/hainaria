import React, { useRef } from 'react';
import { Upload, Camera, AlertCircle } from 'lucide-react';
import { useTryOnStore } from '../../../store/tryonStore';

export default function Step1Upload() {
    const { uploadImage, isLoading } = useTryOnStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadImage(file);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase">Pasul 1: Încarcă Poza Ta</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Pentru cele mai bune rezultate, folosește o poză clară, într-o lumină bună, stând drept.
                </p>
            </div>

            <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/5] bg-[#F9FAFB] border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-black transition-all group relative overflow-hidden"
            >
                <div className="flex flex-col items-center gap-6 group-hover:scale-110 transition-transform relative z-10">
                    <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center text-black">
                        <Upload size={40} />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-black italic uppercase tracking-tighter">Apasă pentru Upload</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">sau trage fișierul aici</p>
                    </div>
                </div>

                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs font-black uppercase tracking-widest italic animate-pulse">Se procesează...</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-start gap-4 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                <AlertCircle className="text-yellow-600 shrink-0" size={24} />
                <div className="text-sm text-yellow-800">
                    <p className="font-bold mb-1">Sfaturi pentru Success:</p>
                    <ul className="list-disc list-inside space-y-1 opacity-80 italic">
                        <li>Evită hainele foarte largi sau strâmte</li>
                        <li>Fundalul ar trebui să fie cât mai simplu</li>
                        <li>Privește direct spre cameră</li>
                    </ul>
                </div>
            </div>

            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
            />
        </div>
    );
}
