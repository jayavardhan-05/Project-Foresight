import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Transaction {
    id: string;
    amount: number;
    source: string;
    destination: string;
    is_fraud: boolean;
    status: string;
}

const TransactionExplorer = () => {
    const [data, setData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/transactions?limit=500`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            });
    }, []);

    const filteredData = data.filter(tx =>
        tx.id.toLowerCase().includes(filter.toLowerCase()) ||
        tx.source.toLowerCase().includes(filter.toLowerCase()) ||
        tx.destination.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="p-6 h-full flex flex-col space-y-6 overflow-hidden">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Transaction Explorer</h1>
                    <p className="text-slate-400 text-sm mt-1">Deep dive into the 16D Feature Space of unprocessed records.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-obsidian-800 text-slate-300 rounded-lg text-sm border border-obsidian-700 hover:bg-obsidian-700">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg text-sm border border-emerald-600/50 hover:bg-emerald-600/30">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-lg border border-obsidian-700">
                    <div className="text-slate-500 text-xs font-mono uppercase">Total Volume</div>
                    <div className="text-xl font-bold text-slate-200 mt-1">${data.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</div>
                </div>
                <div className="glass-panel p-4 rounded-lg border border-obsidian-700">
                    <div className="text-slate-500 text-xs font-mono uppercase">Avg. Risk Score</div>
                    <div className="text-xl font-bold text-amber-400 mt-1">0.042</div>
                </div>
                <div className="glass-panel p-4 rounded-lg border border-obsidian-700">
                    <div className="text-slate-500 text-xs font-mono uppercase">Flagged Fraud</div>
                    <div className="text-xl font-bold text-crimson-400 mt-1">{data.filter(x => x.is_fraud).length}</div>
                </div>
                <div className="glass-panel p-4 rounded-lg border border-obsidian-700">
                    <div className="text-slate-500 text-xs font-mono uppercase">Blocked</div>
                    <div className="text-xl font-bold text-slate-400 mt-1">{data.filter(x => x.status === 'BLOCKED').length}</div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="glass-panel border border-obsidian-700 rounded-xl flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-obsidian-700 flex gap-4 bg-obsidian-900/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by ID, Source Account, or Hash..."
                            className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 bg-obsidian-950 p-3 text-xs font-bold text-slate-500 border-b border-obsidian-800">
                    <div className="col-span-2">TRANSACTION ID</div>
                    <div className="col-span-2">TIMESTAMP</div>
                    <div className="col-span-3">SOURCE / DESTINATION</div>
                    <div className="col-span-2 text-right">AMOUNT</div>
                    <div className="col-span-2 text-center">QUANTUM RISK</div>
                    <div className="col-span-1 text-center">STATUS</div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">Scanning Quantum Ledger...</div>
                    ) : (
                        filteredData.map((tx, i) => (
                            <div key={tx.id} className="grid grid-cols-12 p-3 text-sm border-b border-obsidian-800/50 hover:bg-obsidian-800/30 transition-colors items-center group">
                                <div className="col-span-2 font-mono text-slate-300 flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${tx.is_fraud ? 'bg-crimson-500' : 'bg-emerald-500'}`}></div>
                                    {tx.id}
                                </div>
                                <div className="col-span-2 text-slate-500 text-xs">2024-02-04 14:{30 + (i % 30)}:{10 + (i % 50)}</div>
                                <div className="col-span-3 flex flex-col text-xs font-mono text-slate-400">
                                    <span className="flex items-center gap-1"><ArrowUpRight className="w-3 h-3 text-slate-600" /> {tx.source}</span>
                                    <span className="flex items-center gap-1"><ArrowDownLeft className="w-3 h-3 text-slate-600" /> {tx.destination}</span>
                                </div>
                                <div className="col-span-2 text-right font-mono text-slate-200">${tx.amount.toLocaleString()}</div>
                                <div className="col-span-2 flex justify-center">
                                    {tx.is_fraud ? (
                                        <span className="px-2 py-0.5 rounded-full bg-crimson-500/10 text-crimson-400 border border-crimson-500/20 text-[10px] font-bold">CRITICAL (0.99)</span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">SAFE (0.01)</span>
                                    )}
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    {tx.status === 'BLOCKED' ? (
                                        <Lock className="w-4 h-4 text-slate-500" />
                                    ) : tx.is_fraud ? (
                                        <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                                    ) : (
                                        <ShieldCheck className="w-4 h-4 text-emerald-600/50" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionExplorer;
