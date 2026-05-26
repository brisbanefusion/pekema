import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Loader2, RefreshCw, Clock, Calendar, Coins, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/apiService.ts';

export const InsightsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const result = await apiService.getSmartAnalysis();
      setData(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Brain className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-500/30 p-2 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-indigo-200" />
            </div>
            <span className="text-xs font-black tracking-[0.3em] text-indigo-300 uppercase italic">GBPekema Intelligence Core</span>
          </div>
          <h2 className="text-4xl font-black mb-6 leading-tight italic uppercase tracking-tighter">Analisa Pintar Data<br/><span className="text-indigo-400">Gudang & Kewangan</span></h2>
          <p className="text-indigo-100/70 text-lg leading-relaxed mb-8 font-medium">
            Sistem menganalisis data masa nyata dari pangkalan data untuk memberikan statistik tempoh gudang, amaran AP, dan prestasi kutipan cukai.
          </p>
          <button 
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-2 bg-white text-indigo-900 px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            KEMASKINI ANALISA
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[2rem] border border-slate-100">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Menganalisa Pangkalan Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Tempoh Kenderaan */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-wider">Penuaian Gudang</h3>
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Purata Tempoh</p>
                <p className="text-3xl font-black text-slate-800">{data.aging?.avg_days || 0} <span className="text-lg text-slate-400">Hari</span></p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Risiko &gt; 90 Hari</p>
                <p className="text-xl font-black text-amber-600">{data.aging?.over_90_days || 0} Unit</p>
                <p className="text-[10px] text-amber-700/70 font-medium mt-1 leading-tight">Perlukan perhatian untuk dilepaskan segera bagi mengelakkan penalti gudang.</p>
              </div>
            </div>
          </div>

          {/* 2. Tarikh Luput AP */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-wider">Tarikh Luput AP</h3>
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Amaran Kritikal (&lt; 30 Hari)</p>
                <p className="text-3xl font-black text-rose-600">{data.ap?.critical_count || 0} <span className="text-lg text-rose-400">Kenderaan</span></p>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {data.ap?.warnings && data.ap.warnings.length > 0 ? (
                  data.ap.warnings.map((w: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100">
                      <div className="overflow-hidden pr-2">
                        <p className="text-[11px] font-black text-slate-700 uppercase truncate">{w.lot_number}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{w.company}</p>
                      </div>
                      <p className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md shrink-0">{w.tarikh_luput}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Tiada AP Luput dikesan
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Analisa Cukai */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-wider">Kutipan Cukai</h3>
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Jumlah Terkumpul</p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">RM {Number(data.tax?.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penyumbang Tertinggi</p>
                  <p className="text-sm font-black text-indigo-600 uppercase truncate">{data.tax?.top_company || '-'}</p>
                  <p className="text-[11px] font-bold text-slate-600">RM {Number(data.tax?.top_company_tax || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purata Cukai Per Unit</p>
                  <p className="text-sm font-black text-slate-700">RM {Number(data.tax?.average || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
