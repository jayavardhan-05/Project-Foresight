import React from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '../components/KPICard';
import { TransactionFeed } from '../components/TransactionFeed';
import { Activity, ShieldAlert, ShieldCheck, Zap, Lock, AlertTriangle, Atom, ArrowRight } from 'lucide-react';
import { useRiskStream } from '../hooks/useRiskStream';
import { KPI_DATA } from '../data/mockData';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { API_BASE_URL } from '../config';

export const GlobalCommand = () => {
    const navigate = useNavigate();
    const { transactions, metrics, history } = useRiskStream();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ZONE 1: Executive Status Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    label="Transactions Processed"
                    value={transactions.length > 0 ? "2.4M" : "Connecting..."}
                    icon={Activity}
                    color="blue"
                    trend="+12% vs avg"
                    trendUp={true}
                />
                <KPICard
                    label="High-Risk Intercepted"
                    value={metrics.stability === 'CRITICAL' ? "ACTIVE" : "0"}
                    icon={ShieldAlert}
                    color="crimson"
                    trend={metrics.stability === 'CRITICAL' ? "THREAT DETECTED" : "SECURE"}
                    trendUp={false}
                />
                <KPICard
                    label="Fraud Prevented"
                    value={KPI_DATA.prevented}
                    icon={Lock}
                    color="emerald"
                />
                <KPICard
                    label="System Stability"
                    value={KPI_DATA.stability}
                    icon={Zap}
                    color="amber"
                />
            </div>

            {/* ZONE 2: Live Risk Situation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">

                {/* Left: Transaction Feed */}
                <div className="lg:col-span-4 h-full min-h-0">
                    <div className="glass-panel rounded-xl border border-obsidian-700/50 flex flex-col h-full overflow-hidden">
                        <div className="p-4 border-b border-obsidian-800 flex justify-between items-center bg-obsidian-900/50 rounded-t-xl shrink-0">
                            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${metrics.stability === 'CRITICAL' ? 'bg-crimson-500' : 'bg-emerald-500'}`}></span>
                                LIVE FEED ({transactions.length})
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono">WS://LINKED</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    onClick={() => navigate(`/investigation?id=${tx.id}`)}
                                    className={`flex justify-between items-center p-2 text-xs border-b border-obsidian-800/50 cursor-pointer hover:bg-obsidian-800/50 transition-colors group ${tx.status === 'BLOCKED' ? 'opacity-50 grayscale' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-slate-400 group-hover:text-amber-400 transition-colors">{tx.id}</span>
                                        {/* Fraud Type Indicators */}
                                        {tx.benchmark?.blindspot_detected ? (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-400 font-bold" title="Sophisticated Star-Topology detected by Quantum Kernel (Mule Ring Logic)">
                                                <Atom className="w-3 h-3" />
                                                <span className="hidden xl:inline">MULE RING</span>
                                            </div>
                                        ) : tx.is_fraud ? (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-crimson-500/10 border border-crimson-500/20 rounded text-[10px] text-crimson-400 font-bold">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span className="hidden xl:inline">FRAUD</span>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={tx.type === 'Transfer' ? 'text-crimson-400' : 'text-emerald-400'}>{tx.amount}</span>
                                        <ArrowRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {tx.status === 'BLOCKED' && <Lock className="w-3 h-3 text-slate-500" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Network Entropy Monitor (The "Identity Visual") */}
                <div className="lg:col-span-8 h-full glass-panel rounded-xl border border-obsidian-700/50 p-6 flex flex-col relative overflow-hidden">

                    <div className="flex justify-between items-center mb-6 z-10">
                        <div>
                            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                NETWORK ENTROPY MONITOR
                            </h2>
                            <p className="text-xs text-slate-400">Thermodynamic Instability Metric (VQE Output)</p>
                        </div>
                        <div className="text-right">
                            <div className={`text-2xl font-mono font-bold animate-pulse ${metrics.stability === 'CRITICAL' ? 'text-crimson-500' : 'text-emerald-500'}`}>
                                {metrics.stability}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">System State</div>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-0 z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorEntropy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={[0, 1]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155' }}
                                    itemStyle={{ color: '#F43F5E' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <ReferenceLine y={0.5} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Instability Threshold', fill: '#F59E0B', fontSize: 10 }} />
                                <Area
                                    type="monotone"
                                    dataKey="entropy"
                                    stroke="#F43F5E"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorEntropy)"
                                    isAnimationActive={true}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Background Grid FX */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(11,17,32,0)_1px,transparent_1px),linear-gradient(90deg,rgba(11,17,32,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
                </div>

            </div>

            {/* ZONE 3: Action Guidance */}
            <div className={`glass-panel p-4 rounded-xl border-l-4 transition-all duration-500 flex items-center justify-between ${metrics.stability === 'CRITICAL' ? 'border-crimson-500 bg-gradient-to-r from-crimson-500/10 to-transparent' : 'border-emerald-500 bg-emerald-500/5'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${metrics.stability === 'CRITICAL' ? 'bg-crimson-500/20' : 'bg-emerald-500/20'}`}>
                        {metrics.stability === 'CRITICAL' ? <ShieldAlert className="w-6 h-6 text-crimson-500" /> : <ShieldCheck className="w-6 h-6 text-emerald-500" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-100">
                            {metrics.stability === 'CRITICAL' ? 'THREAT DETECTED: MULE CLUSTER ACTIVE' : 'SYSTEM SECURE: MONITORING'}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {metrics.stability === 'CRITICAL' ? 'High Connectivity Star-Topology. Recommendation: FREEZE ACCOUNT.' : 'VQE Energy Levels Nominal.'}
                        </p>
                    </div>
                </div>
                {metrics.stability === 'CRITICAL' && (
                    <button
                        onClick={() => {
                            // Using the last transaction ID to ban the account
                            const lastTx = transactions[0];
                            if (lastTx) fetch(`${API_BASE_URL}/api/block/${lastTx.id}`, { method: 'POST' });
                        }}
                        className="px-6 py-2 bg-crimson-600 hover:bg-crimson-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-crimson-600/20 transition-all flex items-center gap-2 animate-pulse"
                    >
                        <Lock className="w-3 h-3" />
                        FREEZE SOURCE ACCOUNT
                    </button>
                )}
            </div>
        </div>
    );
};

export default GlobalCommand;
