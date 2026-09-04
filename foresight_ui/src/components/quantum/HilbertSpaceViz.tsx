import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

interface HilbertProps {
    isFraud: boolean;
    vectorMag: number;
}

export const HilbertSpaceViz = ({ isFraud, vectorMag }: HilbertProps) => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        // 1. Generate "Normal" Manifold (Safe Transactions)
        // A cluster of points on a curved surface or plane
        const normalX = [];
        const normalY = [];
        const normalZ = [];

        for (let i = 0; i < 50; i++) {
            const r = Math.random() * 2; // Radius
            const theta = Math.random() * 2 * Math.PI;

            // Feature Map: Z = x^2 + y^2 (Parabolic Kernel)
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            const z = (x * x + y * y) * 0.1 + (Math.random() * 0.1); // Small noise

            normalX.push(x);
            normalY.push(y);
            normalZ.push(z);
        }

        const normalTrace = {
            x: normalX,
            y: normalY,
            z: normalZ,
            mode: 'markers',
            type: 'scatter3d',
            name: 'Safe Manifold',
            marker: {
                size: 4,
                color: '#10B981', // Emerald
                opacity: 0.6
            }
        };

        // 2. Generate the "Target" Transaction (The Query Point)
        // If Fraud -> Maps high in Z (Hyperplane separation)
        // If Safe -> Maps low in Z (Inside cluster)
        const targetZ = isFraud ? 2.5 : 0.2;
        const targetColor = isFraud ? '#F43F5E' : '#34D399'; // Crimson vs Bright Emerald

        const targetTrace = {
            x: [0],
            y: [0],
            z: [targetZ],
            mode: 'markers+text',
            type: 'scatter3d',
            name: 'THIS TX',
            text: ['TX-TARGET'],
            textposition: 'top center',
            marker: {
                size: 10,
                color: targetColor,
                line: { width: 2, color: '#ffffff' }
            }
        };

        // 3. The Separating Hyperplane (Visual Guide)
        // A translucent plane showing the decision boundary
        const planeX = [-3, 3, 3, -3];
        const planeY = [-3, -3, 3, 3];
        const planeZ = [1.0, 1.0, 1.0, 1.0]; // Decision boundary at Z=1.0

        const planeTrace = {
            x: planeX,
            y: planeY,
            z: planeZ,
            type: 'mesh3d',
            color: '#6366f1', // Indigo
            opacity: 0.2,
            name: 'Decision Boundary'
        };

        setData([normalTrace, targetTrace, planeTrace]);

    }, [isFraud]);

    return (
        <div className="w-full h-full min-h-[300px] bg-obsidian-950 rounded-xl overflow-hidden relative border border-obsidian-800">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h4 className="text-xs font-bold text-slate-300">HILBERT SPACE VISUALIZATION</h4>
                <span className="text-[10px] text-cyan-400 font-mono">Kernel Map: Φ(x) → Z</span>
            </div>
            <Plot
                data={data}
                layout={{
                    autosize: true,
                    margin: { l: 0, r: 0, b: 0, t: 0 },
                    showlegend: true,
                    legend: { x: 0, y: 0, orientation: 'h', font: { color: '#94a3b8' } },
                    scene: {
                        xaxis: { title: { text: 'Time' }, showgrid: true, gridcolor: '#1e293b', zeroline: false, showticklabels: false },
                        yaxis: { title: { text: 'Amount' }, showgrid: true, gridcolor: '#1e293b', zeroline: false, showticklabels: false },
                        zaxis: { title: { text: 'Feature Φ' }, showgrid: true, gridcolor: '#1e293b', zeroline: false, showticklabels: false },
                        camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
                        bgcolor: '#0B1120'
                    },
                    paper_bgcolor: '#0B1120',
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};
