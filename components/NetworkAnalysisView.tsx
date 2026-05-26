import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { apiService } from '../services/apiService';
import { Network, Search, Loader2, RotateCcw } from 'lucide-react';

interface NodeData extends d3.SimulationNodeDatum {
    id: string;
    group: 'company' | 'model';
    size: number;
    tax: number;
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
    value: number;
    tax: number;
}

interface NetworkData {
    nodes: NodeData[];
    links: LinkData[];
}

export const NetworkAnalysisView: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<NetworkData>({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);

    const fetchNetworkData = async () => {
        setLoading(true);
        try {
            const response = await apiService.getNetworkAnalysis();
            setData(response);
        } catch (e) {
            console.error("Failed to fetch network graph data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNetworkData();
    }, []);

    const summary = useMemo(() => {
        let max = 0;
        let totalTax = 0;
        data.links.forEach(l => {
            max = Math.max(max, l.value);
            totalTax += Number(l.tax) || 0;
        });
        return {
            totalLinks: data.links.length,
            maxVal: max,
            totalTax
        };
    }, [data]);

    useEffect(() => {
        if (!containerRef.current || data.nodes.length === 0 || loading) return;

        // Clear previous SVG
        d3.select(containerRef.current).selectAll('*').remove();

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", [0, 0, width, height]);

        const g = svg.append("g");

        // Zoom behavior
        svg.call(d3.zoom<SVGSVGElement, unknown>()
            .extent([[0, 0], [width, height]])
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => g.attr("transform", event.transform))
        );

        // Defs for gradients
        const defs = svg.append("defs");

        const companyGrad = defs.append("radialGradient").attr("id", "company-grad");
        companyGrad.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
        companyGrad.append("stop").attr("offset", "100%").attr("stop-color", "#1d4ed8");

        const modelGrad = defs.append("radialGradient").attr("id", "model-grad");
        modelGrad.append("stop").attr("offset", "0%").attr("stop-color", "#818cf8");
        modelGrad.append("stop").attr("offset", "100%").attr("stop-color", "#4f46e5");

        const simulation = d3.forceSimulation<NodeData>(data.nodes)
            .force("link", d3.forceLink<NodeData, LinkData>(data.links)
                .id(d => d.id)
                .distance(150))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide<NodeData>().radius(d => (d.group === 'company' ? 40 : 25)));

        const link = g.append("g")
            .selectAll("line")
            .data(data.links)
            .join("line")
            .attr("class", "link")
            .attr("stroke", "#94a3b8")
            .attr("stroke-opacity", 0.3)
            .attr("stroke-width", (d: any) => Math.log((d.value || 0) + 1) * 3);

        const node = g.append("g")
            .selectAll(".node")
            .data(data.nodes)
            .join("g")
            .attr("class", "node")
            .call(d3.drag<any, NodeData>()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
            );

        const tooltip = d3.select(tooltipRef.current);

        // Company Nodes
        node.filter((d: any) => d.group === 'company')
            .append("circle")
            .attr("r", (d: any) => 15 + Math.sqrt(d.size || 0) * 3)
            .attr("fill", "url(#company-grad)")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.1))")
            .on("mouseover", (event, d: any) => {
                tooltip.style("display", "block")
                    .html(`
                 <div class="flex items-center gap-3 mb-3">
                     <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                     </div>
                     <div class="flex-1 min-w-0">
                         <p class="font-black text-slate-800 text-sm truncate leading-tight">${d.id}</p>
                         <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">Syarikat PEKEMA</p>
                     </div>
                 </div>
                 <div class="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                     <div>
                         <p class="text-[9px] text-slate-400 uppercase font-black tracking-widest">Jumlah Unit</p>
                         <p class="text-lg font-black text-slate-700">${d.size}</p>
                     </div>
                     <div>
                         <p class="text-[9px] text-slate-400 uppercase font-black tracking-widest">Anggaran Cukai</p>
                         <p class="text-lg font-black text-emerald-500">RM ${Number(d.tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                     </div>
                 </div>
               `);
                link.attr("stroke", (l: any) => (l.source === d || l.target === d) ? "#2563eb" : "#94a3b8")
                    .attr("stroke-opacity", (l: any) => (l.source === d || l.target === d) ? 0.8 : 0.1)
                    .attr("stroke-width", (l: any) => ((l.source === d || l.target === d) ? Math.log((l.value || 0) + 1) * 3 + 2 : Math.log((l.value || 0) + 1) * 3));
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 20) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("display", "none");
                link.attr("stroke", "#94a3b8")
                    .attr("stroke-opacity", 0.3)
                    .attr("stroke-width", (l: any) => Math.log((l.value || 0) + 1) * 3);
            });

        // Model Nodes
        const modelNodes = node.filter((d: any) => d.group === 'model');
        modelNodes.append("circle")
            .attr("r", 20)
            .attr("fill", "url(#model-grad)")
            .attr("opacity", 0.8)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .on("mouseover", (event, d: any) => {
                tooltip.style("display", "block")
                    .html(`
                 <div class="flex items-center gap-3 text-left">
                     <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                     </div>
                     <div class="flex-1 min-w-0">
                         <p class="font-black text-slate-800 text-sm max-w-[200px] leading-tight">${d.id}</p>
                         <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">Model Kenderaan</p>
                     </div>
                 </div>
               `);
                link.attr("stroke", (l: any) => (l.source === d || l.target === d) ? "#2563eb" : "#94a3b8")
                    .attr("stroke-opacity", (l: any) => (l.source === d || l.target === d) ? 0.8 : 0.1)
                    .attr("stroke-width", (l: any) => ((l.source === d || l.target === d) ? Math.log((l.value || 0) + 1) * 3 + 2 : Math.log((l.value || 0) + 1) * 3));
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 20) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("display", "none");
                link.attr("stroke", "#94a3b8")
                    .attr("stroke-opacity", 0.3)
                    .attr("stroke-width", (l: any) => Math.log((l.value || 0) + 1) * 3);
            });

        // Text labels
        node.append("text")
            .attr("dx", (d: any) => (d.group === 'company' ? (20 + Math.sqrt(d.size || 0) * 3) : 25))
            .attr("dy", ".35em")
            .attr("fill", "#475569")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .style("pointer-events", "none")
            .text((d: any) => (d.group === 'company' ? (d.id.length > 20 ? d.id.substring(0, 20) + '...' : d.id) : (d.id.length > 15 ? d.id.substring(0, 15) + '...' : d.id)));

        simulation.on("tick", () => {
            link.attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        return () => {
            simulation.stop();
        };

    }, [data, loading]);

    return (
        <div className="relative w-full h-[calc(100vh-140px)] bg-slate-50/50 rounded-3xl border border-slate-200 shadow-inner overflow-hidden flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">

            {/* UI Overlay */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h1 className="text-3xl font-black tracking-tighter text-slate-800">Analisa <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Rangkaian AI</span></h1>
                <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-[0.2em]">Interkoneksi Syarikat & Model Kenderaan</p>

                {!loading && data.nodes.length > 0 && (
                    <div className="mt-6 flex gap-3 pointer-events-auto">
                        <div className="bg-white/80 backdrop-blur border border-slate-200 px-5 py-4 rounded-2xl shadow-sm hover:scale-105 transition-transform">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Hubungan</p>
                            <p className="text-2xl font-black text-slate-800 mt-0.5">{summary.totalLinks.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur border border-slate-200 px-5 py-4 rounded-2xl shadow-sm hover:scale-105 transition-transform">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sumbangan Cukai</p>
                            <p className="text-2xl font-black text-indigo-600 mt-0.5">RM {(summary.totalTax / 1000000).toFixed(1)}J</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute top-6 right-6 z-10 space-y-3 w-64">
                <div className="bg-white/90 backdrop-blur border border-slate-200 p-5 rounded-2xl shadow-lg">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        Legend Visual
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-sm flex-shrink-0"></div>
                            <div>
                                <p className="text-xs font-black text-slate-700 leading-tight">Syarikat PEKEMA</p>
                                <p className="text-[9px] text-slate-500 font-bold leading-tight">Saiz = Jumlah unit</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white shadow-sm flex-shrink-0"></div>
                            <div>
                                <p className="text-xs font-black text-slate-700 leading-tight">Model Kenderaan</p>
                                <p className="text-[9px] text-slate-500 font-bold leading-tight">Penghubung import</p>
                            </div>
                        </div>
                        <div className="pt-4 mt-2 border-t border-slate-100">
                            <p className="text-[9px] text-slate-400 font-black mb-2 uppercase tracking-widest">Panduan Interaksi</p>
                            <ul className="text-[10px] text-slate-500 space-y-1.5 font-bold">
                                <li>• Klik & seret nod mengalih</li>
                                <li>• Scroll zoom masuk/keluar</li>
                                <li>• Hover untuk perincian penuh</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <button onClick={fetchNetworkData} disabled={loading} className="w-full bg-white border border-slate-200 py-3 rounded-xl text-[10px] font-black text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                    <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> RESET VISUALISASI
                </button>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 opacity-50" />
                    <span className="text-xs font-black uppercase tracking-widest">Memuatkan Rangkaian Nod...</span>
                </div>
            )}

            {!loading && data.nodes.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Network className="w-12 h-12 opacity-30" />
                    <span className="text-xs font-black uppercase tracking-widest">Tiada data hubungan ditemui</span>
                </div>
            )}

            {/* SVG Container */}
            <div className="w-full h-full cursor-move" ref={containerRef}></div>

            {/* D3 Tooltip */}
            <div ref={tooltipRef} className="absolute pointer-events-none hidden bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-2xl shadow-xl shadow-slate-200/50 min-w-[220px] z-50"></div>

        </div>
    );
};
