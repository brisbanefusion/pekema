import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/apiService';
import {
  Building2, Printer, Download, MapPin, Loader2, Sparkles, AlertCircle
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

export const TaxAnalysisView: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [negeriFilter, setNegeriFilter] = useState('Semua');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await apiService.getTaxAnalysis();
      // Ensure numerical data types
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
    // Sort by tax descending
    return filtered.sort((a, b) => b.tax - a.tax);
  }, [data, negeriFilter]);

  const totalTax = useMemo(() => filteredData.reduce((acc, curr) => acc + curr.tax, 0), [filteredData]);

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
