
import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, Car, AlertCircle, Search, 
  ChevronLeft, ChevronRight, List, Download, Loader2 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
// Fix: Added missing .ts extension to comply with App.tsx import conventions
import { apiService } from '../services/apiService.ts';

export const AgingAnalysisView: React.FC = () => {
  const [data, setData] = useState<{ summary: any[], records: any[] }>({ summary: [], records: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await apiService.getAgingData();
      
      // Safety check for incoming data structure
      const validatedData = {
        summary: Array.isArray(result?.summary) ? result.summary : [],
        records: Array.isArray(result?.records) ? result.records : []
      };
      
      setData(validatedData);
      setLoading(false);
    };
    loadData();
  }, []);

  const safeSummary = Array.isArray(data.summary) ? data.summary : [];
  const safeRecords = Array.isArray(data.records) ? data.records : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Analisa Tempoh Bonded</h2>
          <p className="text-sm text-slate-400 font-medium">Analitik jangka masa kenderaan berada di dalam gudang (Aging Report) dari database.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          <List className="w-4 h-4 text-slate-400" /> Senarai Utama
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-[2rem] p-20 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Menghubungi Server...</p>
        </div>
      ) : (
        <>
          {/* Stats Mini Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                 <Car className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Kenderaan</p>
                <h3 className="text-2xl font-black text-slate-800">{safeRecords.length > 0 ? safeRecords.length : '0'}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                 <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purata Masa (Hari)</p>
                <h3 className="text-2xl font-black text-slate-800">104</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                 <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempoh Terlama (Hari)</p>
                <h3 className="text-2xl font-black text-slate-800">401</h3>
              </div>
            </div>
          </div>

          {/* Donut Chart Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-8">Pengelasan Tempoh (Aging)</h3>
            <div className="h-[350px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={safeSummary.length > 0 ? safeSummary : [{ name: 'Tiada Data', value: 1, color: '#f1f5f9' }]}
                    innerRadius={100}
                    outerRadius={140}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {safeSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
               {safeSummary.map((item) => (
                 <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase">{item.name}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-8">Taburan Kumpulan Tempoh</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeSummary}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                    {safeSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Senarai Kenderaan Mengikut Tempoh</h3>
               <button className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-800 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Export CSV
               </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">No. Lot</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Model</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">No. Casis</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Gudang</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tarikh Masuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {safeRecords.length > 0 ? (
                    safeRecords.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-black text-slate-800 uppercase">{item.lot}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-black text-slate-600 uppercase leading-tight max-w-[200px] block">
                            {item.model || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tabular-nums">
                            {item.chassis}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[9px] font-black text-slate-500 uppercase leading-tight max-w-[150px] block">
                            {item.warehouse || item.company || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-black text-slate-400">
                            {item.date}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">
                        Tiada rekod ditemui dalam database
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Menunjukkan {safeRecords.length} rekod</span>
               <div className="flex items-center gap-1">
                  <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg text-xs font-bold">1</button>
                  <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
