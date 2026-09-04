import { useState, useEffect, useRef } from 'react';
import { WS_BASE_URL } from '../config';

export const useRiskStream = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        entropy: 0.2,
        stability: "STABLE",
        activeClusters: 0
    });
    const [history, setHistory] = useState<any[]>([]);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        let reconnectTimer: ReturnType<typeof setTimeout>;

        const connect = () => {
            ws.current = new WebSocket(`${WS_BASE_URL}/ws/risk-stream`);

            ws.current.onopen = () => {
                console.log('✅ QUANTUM LINK ESTABLISHED');
            };

            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // Merge Benchmark data into the Transaction object for the UI
                const fullTx = { ...data.transaction, benchmark: data.benchmark };

                // Prevent duplicates: only add if this ID doesn't exist
                setTransactions(prev => {
                    const exists = prev.some(tx => tx.id === fullTx.id);
                    if (exists) return prev; // Don't add duplicates
                    return [fullTx, ...prev].slice(0, 50);
                });

                setMetrics({
                    entropy: data.system_entropy,
                    stability: data.analysis.status,
                    activeClusters: data.analysis.status === 'CRITICAL' ? 1 : 0
                });

                setHistory(prev => {
                    const newPoint = {
                        time: new Date().toLocaleTimeString(),
                        entropy: data.system_entropy
                    };
                    return [...prev, newPoint].slice(-60);
                });
            };

            ws.current.onclose = () => {
                console.log('❌ QUANTUM LINK LOST. Reconnecting...');
                reconnectTimer = setTimeout(connect, 3000); // Retry every 3s
            };
        };

        connect();

        return () => {
            if (ws.current) ws.current.close();
            clearTimeout(reconnectTimer);
        };
    }, []);

    return { transactions, metrics, history };
};
