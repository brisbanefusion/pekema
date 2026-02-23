
import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Printer, Loader2
} from 'lucide-react';
// Fix: Added missing .ts extension to comply with import patterns used in App.tsx
import { apiService } from '../services/apiService.ts';

export const TaxAnalysisView: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await apiService.getTaxAnalysis();
      setData(Array.isArray(result) ? result : []);
      setLoading(false);
    };
    loadData();
  }, []);

  const safeData = Array.isArray(data) ? data : [];
  const maxTax = safeData.length > 0 ? Math.max(...safeData.map(d => Number(d.amount) || 0)) : 1;

  const formatCurrency = (val: number) => {
    return (Number(val) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
      <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Analisis Cukai Mengikut Syarikat</h2>
          <p className="text-sm text-slate-400 font-medium">Ringkasan jumlah cukai yang ditarik dari sistem database.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#10b981] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
            <FileSpreadsheet className="w-4 h-4" /> Eksport
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-[1.5rem] p-20 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4">
           <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Memuatkan Data Kewangan...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Jadual Ringkasan Cukai</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Syarikat (GB/PEKEMA)</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Jumlah Cukai (RM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {safeData.length > 0 ? safeData.map((company, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                      <td className="px-8 py-4 text-xs font-black text-slate-700 uppercase tracking-tight">{company.name}</td>
                      <td className="px-8 py-4 text-xs font-black text-slate-900 text-right tabular-nums">{formatCurrency(company.amount)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={2} className="px-8 py-10 text-center text-xs font-bold text-slate-400 italic">Tiada data cukai ditemui</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-8">
            <div className="mb-10">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-1">Carta Bar Cukai</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Visualisasi perbandingan kutipan cukai semasa</p>
            </div>

            <div className="space-y-6">
              {safeData.map((company, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[70%]">{company.name}</span>
                    <span className="text-[11px] font-black text-slate-800 tabular-nums">RM {formatCurrency(company.amount)}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#10b981] transition-all duration-1000 ease-out"
                      style={{ width: `${((Number(company.amount) || 0) / maxTax) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
