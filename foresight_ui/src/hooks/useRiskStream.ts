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
        let isMounted = true;

        const connect = () => {
            if (!isMounted) return;

            if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
                ws.current.onclose = null;
                ws.current.close();
            }

            try {
                const socket = new WebSocket(`${WS_BASE_URL}/ws/risk-stream`);
                ws.current = socket;

                socket.onopen = () => {
                    if (isMounted) console.log('✅ QUANTUM LINK ESTABLISHED');
                };

                socket.onmessage = (event) => {
                    if (!isMounted) return;
                    try {
                        const data = JSON.parse(event.data);
                        const fullTx = { ...data.transaction, benchmark: data.benchmark };

                        setTransactions(prev => {
                            const exists = prev.some(tx => tx.id === fullTx.id);
                            if (exists) return prev;
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
                    } catch (e) {
                        console.error("Error parsing WebSocket message:", e);
                    }
                };

                socket.onclose = () => {
                    if (!isMounted) return;
                    console.log('❌ QUANTUM LINK LOST. Reconnecting in 3s...');
                    reconnectTimer = setTimeout(connect, 3000);
                };

                socket.onerror = (err) => {
                    console.error('WebSocket Error:', err);
                };
            } catch (err) {
                console.error("Failed to establish WebSocket connection:", err);
                if (isMounted) {
                    reconnectTimer = setTimeout(connect, 5000);
                }
            }
        };

        connect();

        return () => {
            isMounted = false;
            clearTimeout(reconnectTimer);
            if (ws.current) {
                ws.current.onclose = null;
                ws.current.close();
            }
        };
    }, []);

    return { transactions, metrics, history };
};

