import React, { useRef, useMemo, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';


// Generate Mock Graph Data
const generateGraphData = () => {
    const N_NODES = 500;
    const nodes = [];
    const links = [];

    // 1. Normal Organic "Dust"
    for (let i = 0; i < N_NODES; i++) {
        nodes.push({
            id: i,
            group: 'normal',
            val: Math.random() * 2 // Size
        });
    }

    // Random Connections (Normal behavior)
    for (let i = 0; i < N_NODES * 1.5; i++) {
        links.push({
            source: Math.floor(Math.random() * N_NODES),
            target: Math.floor(Math.random() * N_NODES),
            color: '#334155' // Slate 700
        });
    }

    // 2. The "Mule Ring" (Star Topology)
    const MULE_CENTER = 999;
    nodes.push({ id: MULE_CENTER, group: 'mule', val: 20 }); // The Hub

    const RING_SIZE = 40;
    for (let i = 0; i < RING_SIZE; i++) {
        const muleId = 1000 + i;
        nodes.push({ id: muleId, group: 'mule_member', val: 5 });

        // Connect to Hub
        links.push({
            source: muleId,
            target: MULE_CENTER,
            color: '#F43F5E', // Crimson
            particles: 4, // Particle effect
            speed: 0.01
        });
    }

    return { nodes, links };
};

export const NetworkGraph3D = () => {
    const fgRef = useRef<any>(null);
    const data = useMemo(() => generateGraphData(), []);

    useEffect(() => {
        // Auto-orbit camera
        const fg = fgRef.current;
        if (fg && typeof fg.cameraPosition === 'function') {
            // fg.cameraPosition({ x: 500, y: 500, z: 600 });
            let angle = 0;
            const interval = setInterval(() => {
                angle += Math.PI / 300;
                fg.cameraPosition({
                    x: 600 * Math.cos(angle),
                    z: 600 * Math.sin(angle)
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, []);

    return (
        <div className="h-[600px] w-full bg-obsidian-950 rounded-xl overflow-hidden border border-obsidian-800 relative">
            <div className="absolute top-4 left-4 z-10 bg-obsidian-900/80 backdrop-blur p-2 rounded border border-obsidian-700">
                <h3 className="text-xs font-bold text-amber-500">GAT ATTENTION LAYER</h3>
                <div className="text-[10px] text-slate-400">Rendering 550 Nodes</div>
            </div>

            <ForceGraph3D
                ref={fgRef}
                graphData={data}
                nodeLabel="id"
                nodeColor={(node: any) => node.group === 'normal' ? '#94a3b8' : node.group === 'mule' ? '#F43F5E' : '#fb7185'}
                nodeVal="val"
                linkColor={(link: any) => link.color}
                linkWidth={(link: any) => link.color === '#F43F5E' ? 1.5 : 0.5}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={1.5}
                linkDirectionalParticleColor={() => '#F59E0B'} // Gold particles
                backgroundColor="#0B1120"
                showNavInfo={false}
            />
        </div>
    );
};
