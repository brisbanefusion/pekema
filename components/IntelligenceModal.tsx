import React, { useState, useEffect } from 'react';
import { getDashboardInsights } from '../services/geminiService.ts';
import { apiService, apiStatus } from '../services/apiService.ts';
import { Sparkles, X, Loader2, Database, WifiOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const IntelligenceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');
  const [dataMode, setDataMode] = useState<'live' | 'cached'>('live');

  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const [stats, dominance] = await Promise.all([
        apiService.getSummaryStats(),
        apiService.getDominanceData()
      ]);
      
      setDataMode(apiStatus.isLive ? 'live' : 'cached');
      
      const dataContext = {
        stats: stats,
        dominance: dominance,
        mode: apiStatus.isLive ? 'LIVE DATABASE' : 'CACHED REFRESH'
      };
      
      const result = await getDashboardInsights(dataContext);
      setInsight(result || '');
    } catch (err) {
      console.error("AI Generation Error:", err);
      setInsight("Gagal menjana analisa. Sila pastikan pangkalan data disambungkan atau cuba sebentar lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-3xl shadow-lg">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <div>
              <h2 className="text-xl font-bold italic tracking-tight uppercase">Intelligence AI</h2>
              <div className="flex items-center gap-1.5 mt-0.5 opacity-80">
                {dataMode === 'live' ? <Database className="w-3 h-3 text-emerald-300" /> : <WifiOff className="w-3 h-3 text-amber-300" />}
                <p className="text-[10px] font-black uppercase tracking-widest">Analisa {dataMode === 'live' ? 'Data Langsung' : 'Data Simpanan'}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-slate-500 font-bold animate-pulse tracking-wide text-center">
                Menganalisa data pangkalan data...<br/>
                <span className="text-[10px] uppercase tracking-widest text-slate-400">GBPekema AI Core v2.5</span>
              </p>
            </div>
          ) : (
            <div className="prose prose-indigo max-w-none text-slate-700 leading-relaxed font-medium">
              <div className="whitespace-pre-wrap bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[200px]">
                {insight.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-indigo-900 mb-4">{line.replace('# ', '')}</h1>;
                  if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-indigo-800 mt-6 mb-3">{line.replace('## ', '')}</h2>;
                  if (line.startsWith('* ') || line.startsWith('- ')) return <div key={i} className="flex gap-2 mb-2"><span className="text-indigo-500">•</span> <span>{line.substring(2)}</span></div>;
                  return <p key={i} className="mb-4">{line}</p>;
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-white rounded-b-3xl">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/20 transition-all disabled:bg-slate-300 disabled:shadow-none active:scale-[0.98]"
          >
            {loading ? 'Menjana...' : 'Kemaskini Analisa Pintar'}
          </button>
        </div>
      </div>
    </div>
  );
};