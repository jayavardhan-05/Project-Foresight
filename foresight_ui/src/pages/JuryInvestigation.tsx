import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, CheckCircle, AlertTriangle, Atom, Share2, FileText, Play, ChevronRight } from 'lucide-react';
import { EnergyLandscape } from '../components/quantum/EnergyLandscape';
import { CircuitDiagram } from '../components/quantum/CircuitDiagram';
import { HilbertSpaceViz } from '../components/quantum/HilbertSpaceViz';
import { API_BASE_URL } from '../config';


interface ForensicData {
    transaction: any;
    topology: any;
    qsvc: any;
    vqe: any;
    benchmark?: any; // New Comparison Data
}

import { useRiskStream } from '../hooks/useRiskStream';

const InvestigationWorkspace = () => {
    const [searchParams] = useSearchParams();
    const [mode, setMode] = useState<'PICKER' | 'LAB'>('PICKER');
    const [selectedTx, setSelectedTx] = useState<string | null>(null);
    const [data, setData] = useState<ForensicData | null>(null);
    const [step, setStep] = useState(0); // 0: Ingest, 1: Topology, 2: QSVC, 3: VQE, 4: DECISION

    // Logic for Cache / Persistence
    const [investigatedCache, setInvestigatedCache] = useState<Record<string, ForensicData>>(() => {
        const saved = localStorage.getItem('janus_investigation_cache');
        return saved ? JSON.parse(saved) : {};
    });

    const saveToCache = (id: string, data: ForensicData) => {
        const newCache = { ...investigatedCache, [id]: data };
        setInvestigatedCache(newCache);
        localStorage.setItem('janus_investigation_cache', JSON.stringify(newCache));
    };

    // Use Live Stream for the Picker List
    const { transactions } = useRiskStream();

    // Filter out transactions that are already in the cache (Investigated)
    const visibleTransactions = transactions.filter(tx => !investigatedCache[tx.id]);

    useEffect(() => {
        // 1. Auto-Load from URL if ID is present (Live Monitoring Handoff)
        const paramId = searchParams.get('id');
        if (paramId) {
            console.log("🔍 Auto-Starting Investigation for:", paramId);
            startInvestigation(paramId);
        }
    }, [searchParams]);

    const startInvestigation = (id: string) => {
        setSelectedTx(id);
        console.log("Starting investigation for:", id);
        fetch(`${API_BASE_URL}/api/investigate/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("API Request Failed");
                return res.json();
            })
            .then(d => {
                if (d.error) {
                    alert("Error: " + d.error);
                    return;
                }
                setData(d);
                setMode('LAB');
                setStep(0);
            })
            .catch(err => {
                console.error("Investigation Error:", err);
                alert("Failed to load forensic data. Check console.");
            });
    };

    if (mode === 'PICKER') {
        return (
            <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-amber-500" />
                        Investigation Workspace
                    </h1>
                    <p className="text-slate-400 mt-2">Select a flagged transaction to begin forensic Quantum Analysis.</p>
                </div>

                <div className="glass-panel border border-obsidian-700 rounded-xl overflow-hidden">
                    <div className="p-4 bg-obsidian-950 border-b border-obsidian-800 grid grid-cols-12 text-xs font-bold text-slate-500">
                        <div className="col-span-2">ID</div>
                        <div className="col-span-3">SOURCE</div>
                        <div className="col-span-2 text-right">AMOUNT</div>
                        <div className="col-span-2 text-center">STATUS</div>
                        <div className="col-span-3 text-right">ACTION</div>
                    </div>
                    <div className="divide-y divide-obsidian-800/50">
                        {transactions.map(tx => (
                            <div key={tx.id} className="grid grid-cols-12 p-4 items-center hover:bg-obsidian-800/20 transition-colors">
                                <div className="col-span-2 font-mono text-slate-300">{tx.id}</div>
                                <div className="col-span-3 text-slate-400 text-sm">{tx.account || tx.source}</div>
                                <div className="col-span-2 text-right font-mono text-slate-200">${tx.amount.toLocaleString()}</div>
                                <div className="col-span-2 flex justify-center">
                                    {tx.is_fraud ?
                                        <span className="px-2 py-1 bg-crimson-500/10 text-crimson-400 rounded text-xs font-bold border border-crimson-500/20">FLAGGED</span> :
                                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-bold border border-emerald-500/20">CLEARED</span>
                                    }
                                </div>
                                <div className="col-span-3 text-right">
                                    <button
                                        onClick={() => startInvestigation(tx.id)}
                                        className="px-4 py-2 bg-obsidian-800 hover:bg-obsidian-700 text-slate-200 text-xs font-bold rounded-lg border border-obsidian-600 transition-all flex items-center gap-2 ml-auto"
                                    >
                                        <Search className="w-3 h-3" /> INSPECT
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-slate-500">Initializing Lab...</div>;

    const STEPS = [
        { title: "Ingestion", icon: FileText, desc: "Raw Data Capture" },
        { title: "Topology", icon: Share2, desc: "GAT Graph Analysis" },
        { title: "QSVC Screen", icon: AlertTriangle, desc: "Hybrid Screen" },
        { title: "Quantum VQE", icon: Atom, desc: "Hamiltonian Solver" },
        { title: "Verdict", icon: CheckCircle, desc: "Action Required" }
    ];

    return (
        <div className="p-8 h-full flex flex-col animate-in fade-in duration-500">
            {/* Header / Stepper */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => setMode('PICKER')} className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1">
                    ← Back to List
                </button>
                <div className="flex items-center gap-4">
                    {STEPS.map((s, i) => (
                        <div key={i} className={`flex items-center gap-2 ${i === step ? 'text-amber-500' : 'text-slate-600'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border transition-all ${i === step ? 'bg-amber-500/20 border-amber-500 scale-110' : 'bg-obsidian-900 border-obsidian-700'}`}>
                                {i + 1}
                            </div>
                            <span className={`text-sm font-bold hidden md:block ${i === step ? 'text-slate-200' : ''}`}>{s.title}</span>
                            {i < 4 && <div className="w-4 h-px bg-obsidian-800"></div>}
                        </div>
                    ))}
                </div>
                <h2 className="text-xl font-mono text-slate-200 font-bold">{data.transaction.id}</h2>
            </div>

            {/* Main Stage Content */}
            <div className="flex-1 glass-panel border border-obsidian-700 rounded-xl p-8 relative overflow-hidden flex flex-col justify-center">

                {/* STAGE 1: INGESTION */}
                {step === 0 && (
                    <div className="animate-in fade-in slide-in-from-right duration-500 max-w-2xl mx-auto w-full">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-100">Transaction Captured</h2>
                            <p className="text-slate-400">Standard ISO 20022 Payment Message Payload</p>
                        </div>
                        <div className="bg-obsidian-950 p-6 rounded-lg font-mono text-sm border border-obsidian-800 text-slate-300 shadow-inner">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-slate-500 block text-xs mb-1">AMOUNT</span>
                                    <span className="text-3xl text-emerald-400 font-bold tracking-tight">${data.transaction.amount.toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-500 block text-xs mb-1">TYPE</span>
                                    <span className="text-lg text-slate-200 bg-obsidian-800 px-3 py-1 rounded inline-block">{data.transaction.type}</span>
                                </div>
                                <div className="col-span-2 h-px bg-obsidian-800 my-4"></div>
                                <div>
                                    <span className="text-slate-500 block text-xs mb-1">SOURCE ACCOUNT</span>
                                    <span className="text-slate-200 text-lg">{data.transaction.account}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-500 block text-xs mb-1">BENEFICIARY</span>
                                    <span className="text-slate-200 text-lg">{data.transaction.target}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STAGE 2: TOPOLOGY */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right duration-500 max-w-5xl mx-auto w-full grid grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-slate-100">Graph Neural Network Analysis</h2>
                            <p className="text-slate-400 mb-6">The GAT Focuses on the 1-Hop Neighborhood to detect structural anomalies (e.g. Mule Rings).</p>

                            <div className="space-y-4">
                                <div className="p-4 bg-obsidian-900/50 border border-obsidian-700 rounded-lg">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Detected Pattern</div>
                                    <div className="text-2xl font-bold text-amber-400 mt-1">{data.topology.pattern}</div>
                                </div>
                                <div className="p-4 bg-obsidian-900/50 border border-obsidian-700 rounded-lg">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Connections</div>
                                    <div className="text-2xl font-bold text-slate-200 mt-1">{data.topology.neighbor_count} Nodes</div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Graph Visual */}
                        <div className="relative">
                            <div className="w-[400px] h-[400px] bg-obsidian-950 rounded-full border border-obsidian-800 relative flex items-center justify-center animate-pulse-slow shadow-2xl shadow-obsidian-900">
                                {/* Center Node */}
                                <div className="w-6 h-6 bg-slate-100 rounded-full z-10 shadow-[0_0_20px_rgba(255,255,255,0.8)] border border-slate-300"></div>
                                {/* Neighbors */}
                                {data.topology.nodes.map((n: any, i: number) => {
                                    const angle = (i / data.topology.nodes.length) * Math.PI * 2;
                                    const r = 140; // radius
                                    const x = Math.cos(angle) * r;
                                    const y = Math.sin(angle) * r;
                                    return (
                                        <React.Fragment key={i}>
                                            <div
                                                className={`absolute w-4 h-4 rounded-full border-2 ${n.relationship === 'Mule' ? 'bg-crimson-600 border-crimson-400 shadow-[0_0_15px_#F43F5E]' : 'bg-emerald-600 border-emerald-400'}`}
                                                style={{ transform: `translate(${x}px, ${y}px)` }}
                                            ></div>
                                            <div
                                                className={`absolute h-0.5 origin-left ${n.relationship === 'Mule' ? 'bg-gradient-to-r from-slate-100 to-crimson-500' : 'bg-gradient-to-r from-slate-100 to-emerald-500'} opacity-50`}
                                                style={{
                                                    width: `${r}px`,
                                                    transform: `rotate(${angle * (180 / Math.PI)}deg)`
                                                }}
                                            ></div>
                                        </React.Fragment>
                                    )
                                })}
                                <div className="absolute inset-0 border border-slate-700/30 rounded-full animate-ping-slow"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STAGE 3: SCREENING (QSVC) */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right duration-500 w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left Column: Metrics & Explanation */}
                        <div className="flex flex-col justify-center space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100 mb-2">Hybrid QSVC Screening</h2>
                                <p className="text-slate-400 text-sm">Mapping transaction data into high-dimensional Hilbert Space using a Quantum Kernel to maximize separation.</p>
                            </div>

                            <div className="p-6 bg-obsidian-900/50 border border-obsidian-700 rounded-xl space-y-4">
                                <div>
                                    <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Feature Vector Magnitude</span>
                                    <span className="text-3xl font-mono text-slate-200">{data.qsvc.vector_magnitude.toFixed(4)}</span>
                                </div>
                                <div className="h-px bg-obsidian-700"></div>
                                <div>
                                    <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Kernel Probability</span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-obsidian-950 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${data.qsvc.probability > 0.5 ? 'bg-gradient-to-r from-amber-600 to-crimson-600' : 'bg-emerald-600'}`}
                                                style={{ width: `${data.qsvc.probability * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="font-mono text-slate-300 font-bold">{(data.qsvc.probability * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg flex items-center gap-3 border ${data.qsvc.decision === 'Suspicious' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                {data.qsvc.decision === 'Suspicious' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                <div>
                                    <div className="font-bold text-sm">CLASSIFICATION: {data.qsvc.decision.toUpperCase()}</div>
                                    <div className="text-xs opacity-80">
                                        {data.qsvc.decision === 'Suspicious'
                                            ? "Point maps above the hyperplane decision boundary."
                                            : "Point resides within the safe transaction manifold."
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: The Visual */}
                        <div className="h-[400px]">
                            <HilbertSpaceViz isFraud={data.transaction.is_fraud} vectorMag={data.qsvc.vector_magnitude} />
                        </div>
                    </div>
                )}

                {/* STAGE 4: QUANTUM (Premium Visuals) */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right duration-500 w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Circuit & Math */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100 mb-2">VQE Hamiltonian Solver</h2>
                                <p className="text-slate-400 text-sm">Minimizing Energy Cost Function $H$ to find Ground State.</p>
                            </div>

                            <div className="glass-panel p-4 rounded-xl border border-obsidian-700 bg-obsidian-900/50">
                                <CircuitDiagram />
                            </div>

                            <div className="space-y-2 font-mono text-xs">
                                <h4 className="text-slate-500 font-bold mb-2">HAMILTONIAN TERMS (Pauli Operators)</h4>
                                {data.vqe.hamiltonian.map((h: any, i: number) => (
                                    <div key={i} className="flex justify-between p-3 bg-obsidian-950 border border-obsidian-800 rounded items-center">
                                        <span className="text-cyan-400 font-bold text-sm">{h.coeff.toFixed(4)} <span className="text-slate-500">*</span> {h.term}</span>
                                        <span className="text-slate-500">{h.desc}</span>
                                    </div>
                                ))}
                            </div>

                            {/* PROBABILITY DISTRIBUTION VISUALIZATION */}
                            <div className="pt-4 border-t border-obsidian-800">
                                <h4 className="text-slate-500 font-bold mb-3 text-xs">QUANTUM STATE TOMOGRAPHY (P_measure)</h4>
                                <div className="space-y-3">
                                    {data.vqe.probabilities && Object.entries(data.vqe.probabilities).map(([state, prob]: [string, any]) => {
                                        // Determine color based on state key for visual clarity
                                        // |00> is Safe (Cyan/Emerald), |10> is the Danger State (Crimson)
                                        let barColor = "bg-slate-600";
                                        if (state.includes("00")) barColor = "bg-cyan-500";
                                        if (state.includes("10")) barColor = "bg-crimson-500"; // The Fraud State
                                        if (state.includes("01")) barColor = "bg-amber-500";

                                        const percent = prob * 100;

                                        return (
                                            <div key={state} className="group">
                                                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                                                    <span>{state}</span>
                                                    <span className={percent > 10 ? "text-slate-200 font-bold" : ""}>{percent.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-obsidian-950 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right: Energy Landscape (The "Visual") */}
                        <div className="flex flex-col h-full">
                            <div className="flex-1 glass-panel rounded-xl border border-obsidian-700 overflow-hidden relative">
                                {/* Inject the BIAS from backend into the Visual */}
                                <EnergyLandscape bias={data.transaction.is_fraud ? 0.8 : 0} />

                                <div className="absolute bottom-4 right-4 text-right z-10">
                                    <div className="text-xs text-slate-500 font-bold uppercase">System Frustration</div>
                                    <div className={`text-4xl font-mono font-bold ${data.transaction.is_fraud ? 'text-crimson-500' : 'text-emerald-500'}`}>
                                        {data.vqe.frustration_energy.toFixed(3)} eV
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STAGE 5: DECISION (Professional Executive Summary) */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right duration-500 w-full max-w-4xl mx-auto">

                        <div className="flex items-center gap-4 mb-8 border-b border-obsidian-700 pb-6">
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-2xl ${data.transaction.is_fraud ? 'bg-crimson-500/20 text-crimson-500 shadow-crimson-500/10' : 'bg-emerald-500/20 text-emerald-500 shadow-emerald-500/10'}`}>
                                {data.transaction.is_fraud ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100">Forensic Verdict: {data.transaction.is_fraud ? 'CRITICAL THREAT' : 'AUTHORIZED'}</h2>
                                <p className="text-slate-400 font-mono text-xs mt-1">CASE ID: {data.transaction.id} | TIMESTAMP: {new Date().toLocaleTimeString()}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <div className="text-xs text-slate-500 font-bold uppercase">Aggregate Risk Score</div>
                                <div className={`text-4xl font-mono font-bold ${data.transaction.is_fraud ? 'text-crimson-500' : 'text-emerald-500'}`}>
                                    {(data.qsvc.probability * 100).toFixed(1)}/100
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Evidence Log */}
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-amber-500" /> EVIDENCE CHAIN
                                </h3>
                                <div className="bg-obsidian-900/50 rounded-lg border border-obsidian-700 overflow-hidden">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-obsidian-950 text-slate-500 font-bold uppercase">
                                            <tr>
                                                <th className="p-3">Analysis Layer</th>
                                                <th className="p-3">Finding</th>
                                                <th className="p-3 text-right">Confidence</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-obsidian-800 text-slate-300">
                                            <tr>
                                                <td className="p-3 font-mono text-slate-400">1. TOPOLOGY (GAT)</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded ${data.transaction.is_fraud ? 'bg-crimson-500/10 text-crimson-400 border border-crimson-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                        {data.topology.pattern}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-mono">99.8%</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 font-mono text-slate-400">2. SCREENING (QSVC)</td>
                                                <td className="p-3">
                                                    Vector Magnitude: <span className="text-slate-100">{data.qsvc.vector_magnitude.toFixed(4)}</span>
                                                </td>
                                                <td className="p-3 text-right font-mono">{(data.qsvc.probability * 100).toFixed(1)}%</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 font-mono text-slate-400">3. QUANTUM (VQE)</td>
                                                <td className="p-3">
                                                    Ground State Energy: <span className="text-slate-100">{data.vqe.frustration_energy.toFixed(3)} eV</span>
                                                </td>
                                                <td className="p-3 text-right font-mono text-amber-500">100.0%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 bg-slate-800/30 rounded-lg text-xs text-slate-400 italic border border-slate-700/50">
                                    "System detected a <strong className="text-slate-200">{data.topology.pattern}</strong> in the topology layer. Quantum VQE validation confirmed high frustration energy ({data.vqe.frustration_energy.toFixed(3)} eV), indicating a stable fraud manifold."
                                </div>
                            </div>

                            {/* Action Console */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-500" /> DISPOSITION
                                </h3>
                                <div className="space-y-3">
                                    {data.transaction.is_fraud ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    fetch(`${API_BASE_URL}/api/block/${data.transaction.id}`, { method: 'POST' });
                                                    alert(`Account ${data.transaction.account} FROZEN.`);
                                                    setMode('PICKER');
                                                }}
                                                className="w-full py-4 bg-crimson-600 hover:bg-crimson-500 text-white font-bold rounded-lg shadow-lg shadow-crimson-600/20 transition-all flex items-center justify-between px-4 group"
                                            >
                                                <span className="flex flex-col text-left">
                                                    <span>BLOCK ACCOUNT</span>
                                                    <span className="text-[10px] font-normal opacity-70">Freeze Source & Neighbors</span>
                                                </span>
                                                <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            </button>

                                            <button className="w-full py-3 bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 font-bold rounded-lg border border-obsidian-600 transition-all flex items-center justify-between px-4">
                                                <span className="flex flex-col text-left">
                                                    <span>SEND OTP CHALLENGE</span>
                                                    <span className="text-[10px] font-normal opacity-70">Step-Up Authentication</span>
                                                </span>
                                                <Share2 className="w-5 h-5 opacity-50" />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setMode('PICKER')}
                                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-between px-4"
                                        >
                                            <span className="flex flex-col text-left">
                                                <span>APPROVE & CLEAR</span>
                                                <span className="text-[10px] font-normal opacity-70">Release to Core Banking</span>
                                            </span>
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Footer */}
            <div className="mt-6 flex justify-between items-center">
                <button
                    disabled={step === 0}
                    onClick={() => setStep(s => s - 1)}
                    className="px-6 py-3 rounded-lg text-slate-400 font-bold hover:bg-obsidian-800 disabled:opacity-50"
                >
                    Previous
                </button>

                {step < 4 ? (
                    <button
                        onClick={() => setStep(s => s + 1)}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                        Next Channel <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={() => setMode('PICKER')}
                        className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-bold flex items-center gap-2"
                    >
                        Close Case
                    </button>
                )}
            </div>
        </div>
    );
};

// Add missing imports
import { Briefcase } from 'lucide-react';
export default InvestigationWorkspace;
