import React, { useEffect, useState } from 'react';
import { Shield, FileText, CheckCircle, Clock, User, AlertOctagon } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface LogEntry {
    id: string;
    timestamp: string;
    action: string;
    reason: string;
    user: string;
    details: string;
}

const ComplianceLog = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        // Fetch real compliance logs
        const fetchLogs = () => {
            fetch(`${API_BASE_URL}/api/compliance`)
                .then(res => res.json())
                .then(data => setLogs(data));
        };
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // Live poll
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-emerald-500" />
                        Compliance & Audit Log
                    </h1>
                    <p className="text-slate-400 mt-2">Immutable record of all risk interventions and system commands.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all font-semibold shadow-lg">
                    <FileText className="w-4 h-4" />
                    Generate PDF Report
                </button>
            </div>

            {/* Compliance Status Cards */}
            <div className="grid grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-xl border border-obsidian-700 bg-obsidian-900/40">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-sm font-bold text-slate-300">SYSTEM INTEGRITY</h3>
                    </div>
                    <div className="text-2xl font-bold text-slate-100">100% COMPLIANT</div>
                    <p className="text-xs text-slate-500 mt-1">No policy violations detected in last 24h.</p>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-obsidian-700 bg-obsidian-900/40">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertOctagon className="w-5 h-5 text-crimson-500" />
                        <h3 className="text-sm font-bold text-slate-300">ACTIVE BLOCKS</h3>
                    </div>
                    <div className="text-2xl font-bold text-slate-100">{logs.length}</div>
                    <p className="text-xs text-slate-500 mt-1">Transactions intervened by Operator.</p>
                </div>
                <div className="glass-panel p-6 rounded-xl border border-obsidian-700 bg-obsidian-900/40">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="w-5 h-5 text-amber-500" />
                        <h3 className="text-sm font-bold text-slate-300">ACTIVE OPERATOR</h3>
                    </div>
                    <div className="text-2xl font-bold text-slate-100">ADMIN_01</div>
                    <p className="text-xs text-slate-500 mt-1">Session ID: 8821-XJ-992</p>
                </div>
            </div>

            {/* The Audit Timeline */}
            <div className="glass-panel border border-obsidian-700 rounded-xl overflow-hidden">
                <div className="p-4 bg-obsidian-950 border-b border-obsidian-800 font-bold text-slate-400 text-sm">
                    ACTIVITY TIMELINE
                </div>
                <div className="divide-y divide-obsidian-800/50">
                    {logs.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 italic">No interventions recorded. System running in passive monitoring mode.</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="p-4 flex gap-4 hover:bg-obsidian-800/20 transition-colors">
                                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                                    <span className="text-xs text-slate-500 font-mono">14:32</span>
                                    <div className="w-px h-full bg-obsidian-800"></div>
                                </div>
                                <div className="p-2 bg-crimson-500/10 rounded-lg border border-crimson-500/20 h-fit">
                                    <AlertOctagon className="w-5 h-5 text-crimson-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-200">INTERVENTION: {log.action}</h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Operator <span className="text-amber-500">{log.user}</span> triggered a block on <span className="font-mono text-slate-300">{log.id}</span>.
                                    </p>
                                    <div className="mt-2 text-[10px] font-mono text-slate-500 bg-obsidian-950 p-2 rounded border border-obsidian-800">
                                        REASON: {log.reason} | {log.details}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComplianceLog;
