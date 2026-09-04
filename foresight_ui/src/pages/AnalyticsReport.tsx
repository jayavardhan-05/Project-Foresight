import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Activity, PieChart as PieIcon } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AnalyticsReport = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/analytics`)
            .then(res => res.json())
            .then(data => setStats(data));
    }, []);

    if (!stats) return <div className="p-8 text-slate-500">Loading Intelligence...</div>;

    const pieData = [
        { name: 'Legitimate', value: stats.total_transactions - stats.fraud_attempts },
        { name: 'Fraud', value: stats.fraud_attempts }
    ];
    const COLORS = ['#10B981', '#F43F5E'];

    const barData = [
        { name: 'Total Vol', amount: stats.total_volume / 1000000 },
        { name: 'Fraud Vol', amount: stats.fraud_volume / 1000000 },
    ];

    return (
        <div className="p-8 h-full overflow-y-auto custom-scrollbar">
            <h1 className="text-3xl font-bold text-slate-100 mb-8 flex items-center gap-3">
                <Activity className="w-8 h-8 text-amber-500" />
                Risk Analytics & Reporting
            </h1>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-xl border border-obsidian-700 bg-emerald-500/5">
                    <h3 className="text-emerald-400 font-bold text-sm mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4" /> SAFE VOLUME</h3>
                    <div className="text-3xl font-bold text-slate-100">${(stats.total_volume - stats.fraud_volume).toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-2">Processed successfully</p>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-obsidian-700 bg-crimson-500/5">
                    <h3 className="text-crimson-400 font-bold text-sm mb-2 flex items-center gap-2"><AlertOctagon className="w-4 h-4" /> RISK EXPOSURE</h3>
                    <div className="text-3xl font-bold text-slate-100">${stats.fraud_volume.toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-2">Detected threats</p>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-obsidian-700">
                    <h3 className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> FAILURE RATE</h3>
                    <div className="text-3xl font-bold text-slate-100">{(stats.fraud_attempts / stats.total_transactions * 100).toFixed(2)}%</div>
                    <p className="text-xs text-slate-500 mt-2">Ratio of anomalies</p>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-obsidian-700">
                    <h3 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> PREVENTION</h3>
                    <div className="text-3xl font-bold text-slate-100">{(stats.prevention_rate * 100).toFixed(1)}%</div>
                    <p className="text-xs text-slate-500 mt-2">Auto-block efficiency</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-8 h-96">
                <div className="glass-panel p-6 rounded-xl border border-obsidian-700 flex flex-col">
                    <h3 className="text-slate-200 font-bold mb-6">Transaction Volume Distribution (Millions)</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <XAxis dataKey="name" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip cursor={{ fill: '#1E293B' }} contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }} />
                                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-obsidian-700 flex flex-col">
                    <h3 className="text-slate-200 font-bold mb-6">Fraud vs. Legit Ratio</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-emerald-400"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Legitimate</div>
                        <div className="flex items-center gap-2 text-crimson-400"><div className="w-3 h-3 bg-crimson-500 rounded-full"></div> High Risk</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Missing imports patch
import { Shield, AlertOctagon } from 'lucide-react';

export default AnalyticsReport;
