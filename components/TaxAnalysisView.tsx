import React, { useState, useEffect, useMemo } from 'react';
// Fix: Added missing apiService import path verification
import { apiService } from '../services/apiService.ts';
import {
  Building2, Printer, Download, MapPin, Loader2, Sparkles, AlertCircle, Map, Undo2, Navigation
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

const NEGERI_OPTIONS = [
  'Semua', 'KLIA', 'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
  'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 'Sarawak', 'Selangor',
  'Terengganu', 'W.P. Kuala Lumpur', 'W.P. Labuan', 'W.P. Putrajaya'
];

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#14B8A6'];

const STATE_MAP_DATA = [
  // West Malaysia
  { id: 'Perlis', name: 'Perlis', path: 'M 38 18 L 46 18 L 44 24 L 36 23 Z', area: 'semenanjung' },
  { id: 'Kedah', name: 'Kedah', path: 'M 36 23 L 44 24 L 46 18 L 52 20 L 56 36 L 42 44 L 38 32 Z', area: 'semenanjung' },
  { id: 'Pulau Pinang', name: 'Pulau Pinang', path: 'M 34 36 L 40 36 L 39 42 L 33 41 Z', area: 'semenanjung' },
  { id: 'Perak', name: 'Perak', path: 'M 42 44 L 56 36 L 64 40 L 68 62 L 52 76 L 44 62 Z', area: 'semenanjung' },
  { id: 'Kelantan', name: 'Kelantan', path: 'M 64 40 L 82 46 L 76 72 L 66 72 L 64 56 Z', area: 'semenanjung' },
  { id: 'Terengganu', name: 'Terengganu', path: 'M 82 46 L 98 54 L 90 86 L 76 72 Z', area: 'semenanjung' },
  { id: 'Pahang', name: 'Pahang', path: 'M 66 72 L 76 72 L 90 86 L 86 110 L 62 106 L 58 88 Z', area: 'semenanjung' },
  { id: 'Selangor', name: 'Selangor', path: 'M 52 76 L 66 72 L 58 88 L 62 106 L 50 102 Z', area: 'semenanjung' },
  { id: 'W.P. Kuala Lumpur', name: 'W.P. Kuala Lumpur', path: 'M 55 92 L 59 92 L 59 96 L 55 96 Z', area: 'semenanjung' },
  { id: 'Negeri Sembilan', name: 'Negeri Sembilan', path: 'M 62 106 L 74 104 L 70 116 L 58 114 Z', area: 'semenanjung' },
  { id: 'Melaka', name: 'Melaka', path: 'M 60 115 L 68 113 L 66 121 L 58 120 Z', area: 'semenanjung' },
  { id: 'Johor', name: 'Johor', path: 'M 74 104 L 86 110 L 94 130 L 76 136 L 66 121 L 70 116 Z', area: 'semenanjung' },
  
  // East Malaysia
  { id: 'Sarawak', name: 'Sarawak', path: 'M 150 110 L 185 105 L 220 88 L 245 74 L 256 56 L 246 60 L 230 74 L 190 92 L 150 98 Z', area: 'borneo' },
  { id: 'Sabah', name: 'Sabah', path: 'M 256 56 L 270 40 L 295 40 L 305 56 L 288 78 L 265 78 L 252 66 Z', area: 'borneo' },
  { id: 'W.P. Labuan', name: 'W.P. Labuan', path: 'M 251 48 L 255 48 L 255 52 L 251 52 Z', area: 'borneo' }
];

export const TaxAnalysisView: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [negeriFilter, setNegeriFilter] = useState('Semua');
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await apiService.getTaxAnalysis();
      const formatted = result.map((item: any) => ({
        ...item,
        tax: Number(item.tax) || 0,
        units: Number(item.units) || 0
      }));
      setData(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let filtered = data;
    if (negeriFilter !== 'Semua') {
      filtered = data.filter(item => item.negeri === negeriFilter);
    }
    return filtered.sort((a, b) => b.tax - a.tax);
  }, [data, negeriFilter]);

  const totalTax = useMemo(() => filteredData.reduce((acc, curr) => acc + curr.tax, 0), [filteredData]);

  // Aggregate stats per state
  const stateStats = useMemo(() => {
    const stats: { [key: string]: { tax: number; units: number } } = {};
    NEGERI_OPTIONS.forEach(st => {
      if (st !== 'Semua') {
        stats[st] = { tax: 0, units: 0 };
      }
    });

    data.forEach(item => {
      const st = item.negeri;
      if (st && stats[st]) {
        stats[st].tax += item.tax;
        stats[st].units += item.units;
      }
    });
    return stats;
  }, [data]);

  const exportTableToCSV = () => {
    const headers = ['Nama Syarikat (GB/PEKEMA)', 'Negeri', 'Jumlah Cukai (RM)', 'Unit'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(d => `"${d.name}","${d.negeri || '-'}","${d.tax}","${d.units}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'analisis_cukai.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleStateClick = (stateId: string) => {
    if (negeriFilter === stateId) {
      setNegeriFilter('Semua');
    } else {
      setNegeriFilter(stateId);
    }
  };

  const getMapStateStyle = (stateId: string) => {
    const isSelected = negeriFilter === stateId;
    const isHovered = hoveredState === stateId;
    const hasData = stateStats[stateId] && stateStats[stateId].units > 0;

    if (isSelected) {
      return {
        fill: '#4f46e5', // Solid Indigo-600
        stroke: '#ffffff',
        strokeWidth: 2,
        cursor: 'pointer',
        transition: 'all 200ms ease'
      };
    }
    if (isHovered) {
      return {
        fill: hasData ? '#818cf8' : '#475569', // Indigo-400 or slate hover
        stroke: '#ffffff',
        strokeWidth: 1.5,
        cursor: 'pointer',
        transition: 'all 200ms ease'
      };
    }
    return {
      fill: hasData ? '#1e1b4b' : '#1e293b', // Deep indigo-950 or Slate-800
      stroke: hasData ? '#4f46e5' : '#334155', // Indigo stroke or Slate-700
      strokeWidth: 1,
      cursor: 'pointer',
      transition: 'all 200ms ease'
    };
  };

  // Tooltip & details calculations
  const displayStats = useMemo(() => {
    const active = hoveredState || (negeriFilter !== 'Semua' ? negeriFilter : null);
    if (active && stateStats[active]) {
      return {
        name: active,
        tax: stateStats[active].tax,
        units: stateStats[active].units,
        isHovered: !!hoveredState
      };
    }
    
    // Default national stats
    const nationalTax = Object.values(stateStats).reduce((sum, current) => sum + current.tax, 0);
    const nationalUnits = Object.values(stateStats).reduce((sum, current) => sum + current.units, 0);
    return {
      name: 'Seluruh Malaysia',
      tax: nationalTax,
      units: nationalUnits,
      isHovered: false
    };
  }, [hoveredState, negeriFilter, stateStats]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full border border-indigo-100/50 shadow-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Kewangan & Cukai</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Analisis <span className="text-blue-600">Cukai</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-xl">
            Ringkasan jumlah unjuran cukai Kastam bagi setiap syarikat mengikut taburan negeri.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              value={negeriFilter}
              onChange={e => setNegeriFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 border-none outline-none pr-4"
            >
              {NEGERI_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
            <Printer className="w-4 h-4" /> Cetak
          </button>
          <button onClick={exportTableToCSV} className="flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20">
            <Download className="w-4 h-4" /> Eksport Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-40">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Interactive Map Visual Section */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/10 text-white relative overflow-hidden shadow-2xl print:hidden animate-in zoom-in duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Map className="w-64 h-64" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
              {/* Map SVG */}
              <div className="lg:col-span-8 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-sm font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <Navigation className="w-4 h-4 rotate-45" /> Peta Interaktif Malaysia
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">
                    Layangkan tetikus untuk statistik, klik negeri untuk menapis jadual data.
                  </p>
                </div>
                
                <div className="flex items-center justify-center bg-black/25 rounded-[2rem] border border-white/5 p-6 min-h-[300px]">
                  <svg viewBox="0 0 340 160" className="w-full h-auto max-h-[320px]">
                    <defs>
                      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                      </radialGradient>
                      <filter id="shadow-glow" x="-15%" y="-15%" width="130%" height="130%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#818cf8" floodOpacity="0.5"/>
                      </filter>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#glow)" rx="20" className="pointer-events-none" />
                    
                    {/* Grid partition lines */}
                    <line x1="120" y1="10" x2="120" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <text x="110" y="16" fill="rgba(255,255,255,0.15)" fontSize="7" fontWeight="bold" textAnchor="end">Semenanjung</text>
                    <text x="130" y="16" fill="rgba(255,255,255,0.15)" fontSize="7" fontWeight="bold">Sabah & Sarawak</text>

                    {/* Rendering SVG State Paths */}
                    {STATE_MAP_DATA.map((state) => (
                      <path
                        key={state.id}
                        d={state.path}
                        style={getMapStateStyle(state.id)}
                        onMouseEnter={() => setHoveredState(state.id)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => handleStateClick(state.id)}
                      />
                    ))}

                    {/* KLIA Hub Glowing circular node */}
                    <g 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredState('KLIA')}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => handleStateClick('KLIA')}
                    >
                      <circle 
                        cx="50" 
                        cy="96" 
                        r="3.5" 
                        className={`stroke-white stroke-[0.7] transition-all ${
                          negeriFilter === 'KLIA' || hoveredState === 'KLIA' ? 'fill-blue-400' : 'fill-blue-500'
                        }`} 
                        filter={negeriFilter === 'KLIA' ? 'url(#shadow-glow)' : ''}
                      />
                      <circle cx="50" cy="96" r="8" className="fill-none stroke-blue-500/50 stroke-[0.5] animate-ping" />
                      <text x="46" y="93" fill="#60a5fa" fontSize="5" fontWeight="bold" textAnchor="end">PORT KLIA</text>
                    </g>

                    {/* Putrajaya dot */}
                    <g 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredState('W.P. Putrajaya')}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => handleStateClick('W.P. Putrajaya')}
                    >
                      <circle 
                        cx="57" 
                        cy="96" 
                        r="2" 
                        className={`stroke-white stroke-[0.5] transition-all ${
                          negeriFilter === 'W.P. Putrajaya' || hoveredState === 'W.P. Putrajaya' ? 'fill-amber-400' : 'fill-amber-500'
                        }`} 
                      />
                      <text x="61" y="99" fill="#fbbf24" fontSize="5" fontWeight="bold">Putrajaya</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Side Info Panel */}
              <div className="lg:col-span-4 flex flex-col justify-between bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-400">
                      {displayStats.isHovered ? 'Sedang Dilayur' : 'Status Tapisan'}
                    </span>
                    <h4 className="text-xl font-black uppercase tracking-tight text-white mt-1">
                      {displayStats.name}
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jumlah Unjuran Cukai</p>
                      <p className="text-2xl font-black text-indigo-300 tracking-tight">
                        RM {displayStats.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jumlah Kenderaan Terlibat</p>
                      <p className="text-2xl font-black text-white tracking-tight">
                        {displayStats.units.toLocaleString()} <span className="text-sm font-bold text-slate-400">Unit</span>
                      </p>
                    </div>

                    {displayStats.units > 0 && (
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Purata Cukai Seunit</p>
                        <p className="text-lg font-black text-slate-300 tracking-tight">
                          RM {(displayStats.tax / displayStats.units).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {negeriFilter !== 'Semua' && (
                  <button
                    onClick={() => setNegeriFilter('Semua')}
                    className="w-full mt-6 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95"
                  >
                    <Undo2 className="w-4 h-4" /> Reset Tapisan Negeri
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
            {/* Bar Chart */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Carta Bar Cukai</h3>
              <div className="h-[300px]">
                {filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredData.slice(0, 10)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                        tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
                        angle={-45} textAnchor="end" height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                        tickFormatter={(val) => 'RM ' + (val / 1000000).toFixed(1) + 'M'}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => ['RM ' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 'Cukai']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="tax" radius={[4, 4, 0, 0]}>
                        {filteredData.slice(0, 10).map((entry, index) => (
                          <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-widest">Tiada Data Tersedia</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Taburan Syarikat Tertinggi</h3>
              <div className="h-[300px]">
                {filteredData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredData.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="tax"
                        nameKey="name"
                        stroke="none"
                      >
                        {filteredData.slice(0, 8).map((entry, index) => (
                          <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => ['RM ' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 'Cukai']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend
                        layout="vertical" verticalAlign="middle" align="right"
                        wrapperStyle={{ fontSize: '10px', fontWeight: 700, fill: '#64748b' }}
                        formatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-widest">Tiada Data Tersedia</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Senarai Syarikat & Cukai</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">RM {totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KESELURUHAN</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-left">
                <thead className="bg-[#f8fafc] print:bg-white">
                  <tr>
                    <th className="px-6 md:px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Nama Syarikat (GB/PEKEMA)</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Negeri</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Unit</th>
                    <th className="px-6 md:px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 text-right">Jumlah Cukai (RM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 md:px-8 py-4 text-xs font-bold text-slate-800 uppercase">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-md">{item.negeri || '-'}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 text-center">{item.units}</td>
                        <td className="px-6 md:px-8 py-4 text-sm font-black text-blue-600 text-right tabular-nums">
                          {(item.tax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <span className="text-xs font-bold uppercase tracking-widest">Tiada maklumat direkodkan</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

