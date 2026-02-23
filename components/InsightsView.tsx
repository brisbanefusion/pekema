
import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
// Fix: Added missing .ts and .tsx extensions to match App.tsx import style
import { getDashboardInsights } from '../services/geminiService.ts';
import { DOMINANCE_DATA } from '../constants.tsx';

export const InsightsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    const dataContext = {
      stats: { totalVehicles: 754, companies: 31, tax: 'RM 12.8M' },
      dominance: DOMINANCE_DATA
    };
    const result = await getDashboardInsights(dataContext);
    setInsight(result || '');
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
          <h2 className="text-4xl font-black mb-6 leading-tight italic uppercase tracking-tighter">Analisa Deep-Learning <br/><span className="text-indigo-400">Operasi Gudang Pekema</span></h2>
          <p className="text-indigo-100/70 text-lg leading-relaxed mb-8 font-medium">
            AI kami telah menganalisa 100% data transaksi anda. Berikut adalah penemuan kritikal dan ramalan untuk suku tahun akan datang.
          </p>
          <button 
            onClick={fetchInsights}
            disabled={loading}
            className="flex items-center gap-2 bg-white text-indigo-900 px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            JANA ANALISA BARU
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[2rem] border border-slate-100">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Sistem Pintar Sedang Berfikir...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm prose prose-indigo max-w-none">
             <div className="whitespace-pre-wrap font-medium text-slate-700 leading-loose">
               {insight}
             </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 border-dashed">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <h4 className="font-black text-amber-800 text-sm uppercase">Risiko Dikesan</h4>
              </div>
              <p className="text-xs text-amber-700/80 font-bold leading-relaxed">
                Terdapat 14% kelewatan dalam proses pengisytiharan cukai untuk model SUV mewah bulan ini. 
                Sila pantau syarikat WDH Moscorp.
              </p>
            </div>
            
            <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 border-dashed">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-indigo-600" />
                <h4 className="font-black text-indigo-800 text-sm uppercase">Peluang Optimasi</h4>
              </div>
              <p className="text-xs text-indigo-700/80 font-bold leading-relaxed">
                Ramalan menunjukkan permintaan MPV akan meningkat 22% pada bulan April. 
                Pertimbangkan untuk menambah slot gudang untuk Toyota Vellfire/Alphard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
