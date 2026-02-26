import React from 'react';

export default function Dashboard() {
    const stats = [
        { label: 'Vânzări Totale', value: '12,540 RON', change: '+12%', icon: '💰' },
        { label: 'Comenzi Noi', value: '48', change: '+5', icon: '🛒' },
        { label: 'Vizitatori', value: '1,204', change: '+18%', icon: '👥' },
        { label: 'Try-On AI', value: '342', change: '+24%', icon: '✨' },
    ];

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Statistici Generale</h1>
                <p className="text-gray-500">Performanța magazinului tău în ultimele 30 de zile.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl">{stat.icon}</span>
                            <span className="text-xs font-black text-green-600 py-1 px-2 bg-green-50 rounded-lg">{stat.change}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black italic tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-black opacity-5 transform group-hover:scale-110 transition-transform">
                        <span className="text-9xl font-black italic tracking-tighter leading-none select-none">AI</span>
                    </div>
                    <h2 className="text-xl font-black italic tracking-tighter uppercase mb-6">Probe Virtuală</h2>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl">
                            <span className="text-sm font-medium">Poze Procesate (AI)</span>
                            <span className="font-bold">2,410</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl">
                            <span className="text-sm font-medium">Conversie din Try-On</span>
                            <span className="font-bold text-indigo-600">8.4%</span>
                        </div>
                        <button className="w-full mt-4 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all">
                            Vezi Raport AI Complet
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black italic tracking-tighter uppercase mb-6">Activitate Recentă</h2>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold">Comandă nouă #4521 primită de la Andrei S.</p>
                                    <p className="text-xs text-gray-400 italic">acum 10 minute</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
