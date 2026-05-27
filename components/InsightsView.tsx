import React, { useState, useEffect, useMemo } from 'react';
import { Brain, Sparkles, Loader2, RefreshCw, Clock, Calendar, Coins, CheckCircle2, Car, BarChart3, TrendingUp, Building2, Gauge, AlertTriangle, Send, Zap, Target, Activity, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService.ts';

interface InsightsViewProps {
  onNavigateToVehicles: (filters: { type: 'aging_90' | 'ap_warning' | null }) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ onNavigateToVehicles }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [sendingAp, setSendingAp] = useState<{[key: string]: 'sending' | 'success' | 'error'}>({});

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

  const handleSendWarning = async (ap: string, company: string) => {
    if (!ap) return;
    setSendingAp(prev => ({ ...prev, [ap]: 'sending' }));
    try {
      const res = await apiService.sendWarning(ap, company);
      if (res && res.status === 'success') {
        setSendingAp(prev => ({ ...prev, [ap]: 'success' }));
        setTimeout(() => {
          setSendingAp(prev => {
            const next = { ...prev };
            delete next[ap];
            return next;
          });
        }, 3000);
      } else {
        setSendingAp(prev => ({ ...prev, [ap]: 'error' }));
      }
    } catch (err) {
      setSendingAp(prev => ({ ...prev, [ap]: 'error' }));
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const fmtRM = (v: number) => `RM ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const fmtNum = (v: number) => Number(v || 0).toLocaleString();

  // Calculate max for bar chart rendering
  const getMaxCount = (arr: any[]) => Math.max(...(arr || []).map((i: any) => Number(i.count) || 0), 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Banner */}
      <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Brain className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-500/30 p-2 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-indigo-200" />
            </div>
            <span className="text-xs font-black tracking-[0.3em] text-indigo-300 uppercase italic">MyPEKEMA APP Intelligence Core</span>
          </div>
          <h2 className="text-4xl font-black mb-6 leading-tight italic uppercase tracking-tighter">Analisa Pintar Data<br/><span className="text-indigo-400">Gudang & Kewangan</span></h2>
          <p className="text-indigo-100/70 text-lg leading-relaxed mb-8 font-medium">
            Sistem menganalisis data masa nyata dari pangkalan data — statistik gudang, amaran AP, cukai, model popular, trend import, dan pecahan enjin.
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

      {/* Local AI Insights Panel - No API Required */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-500/20 p-2 rounded-xl">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="font-black uppercase tracking-wider text-sm">AI Tempatan (Offline)</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">Analisa automatik tanpa sambungan API - berfungsi di luar talian.</p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Zap className="w-4 h-4 mx-auto mb-1 text-amber-400" />
            <p className="text-lg font-black">{apiService.getAnomalyDetection().total}</p>
            <p className="text-[9px] text-slate-400 uppercase">Anomali</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <AlertCircle className="w-4 h-4 mx-auto mb-1 text-rose-400" />
            <p className="text-lg font-black">{apiService.getAnomalyDetection().critical}</p>
            <p className="text-[9px] text-slate-400 uppercase">Kritikal</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Target className="w-4 h-4 mx-auto mb-1 text-amber-400" />
            <p className="text-lg font-black">{apiService.getAnomalyDetection().warning}</p>
            <p className="text-[9px] text-slate-400 uppercase">Amaran</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <Activity className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
            <p className="text-lg font-black">{apiService.getForecast() || '-'}</p>
            <p className="text-[9px] text-slate-400 uppercase">Unjuran Bulan Depan</p>
          </div>
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
        <div className="space-y-8">
          {/* Row 1: Original 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. Penuaian Gudang */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Clock className="w-6 h-6" /></div>
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Penuaian Gudang</h3>
              </div>
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Purata Tempoh</p>
                  <p className="text-3xl font-black text-slate-800">{data.aging?.avg_days || 0} <span className="text-lg text-slate-400">Hari</span></p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-blue-50 p-3 rounded-xl">
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Minimum</p>
                    <p className="text-lg font-black text-blue-700">{data.aging?.min_days || 0} <span className="text-xs text-blue-400">hari</span></p>
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Maksimum</p>
                    <p className="text-lg font-black text-slate-700">{data.aging?.max_days || 0} <span className="text-xs text-slate-400">hari</span></p>
                  </div>
                </div>
                <div 
                  onClick={() => onNavigateToVehicles({ type: 'aging_90' })}
                  className="bg-amber-50 p-4 rounded-xl border border-amber-100 cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Risiko &gt; 90 Hari</p>
                  <p className="text-xl font-black text-amber-600">{data.aging?.over_90_days || 0} Unit</p>
                  <p className="text-[10px] text-amber-700/70 font-medium mt-1 leading-tight">Perlukan perhatian segera bagi mengelakkan penalti gudang.</p>
                </div>
              </div>
            </div>

            {/* 2. Tarikh Luput AP */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Calendar className="w-6 h-6" /></div>
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Tarikh Luput AP</h3>
              </div>
              <div className="flex-1 space-y-5">
                <div 
                  onClick={() => onNavigateToVehicles({ type: 'ap_warning' })}
                  className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all active:scale-[0.98] w-full text-left"
                >
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Amaran Kritikal (&lt; 30 Hari)</p>
                  <p className="text-3xl font-black text-rose-600">{data.ap?.critical_count || 0} <span className="text-lg text-rose-400">Kenderaan</span></p>
                </div>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                  {data.ap?.warnings && data.ap.warnings.length > 0 ? (
                    data.ap.warnings.map((w: any, idx: number) => {
                      const status = sendingAp[w.ap];
                      return (
                        <div key={idx} className="flex flex-col gap-2 p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-100/50 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="overflow-hidden pr-2">
                              <p className="text-[11px] font-black text-slate-700 uppercase truncate">{w.lot_number}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{w.company}</p>
                              <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">AP: {w.ap || 'N/A'}</p>
                            </div>
                            <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded shrink-0">{w.tarikh_luput}</span>
                          </div>
                          
                          <button 
                            disabled={status === 'sending' || status === 'success' || !w.ap}
                            onClick={() => handleSendWarning(w.ap, w.company)}
                            className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                              status === 'sending'
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : status === 'success'
                                ? 'bg-emerald-500 text-white cursor-default'
                                : status === 'error'
                                ? 'bg-rose-600 text-white hover:bg-rose-700'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                            }`}
                          >
                            {status === 'sending' && <Loader2 className="w-3 h-3 animate-spin" />}
                            {status === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {status === 'error' && <AlertTriangle className="w-3 h-3" />}
                            {!status && <Send className="w-2.5 h-2.5" />}
                            {status === 'sending' ? 'Menghantar...' : status === 'success' ? 'Amaran Dihantar' : status === 'error' ? 'Gagal Hantar' : 'Hantar Peringatan'}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Tiada AP Luput dikesan
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Kutipan Cukai */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Coins className="w-6 h-6" /></div>
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Kutipan Cukai</h3>
              </div>
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Jumlah Terkumpul</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{fmtRM(data.tax?.total)}</p>
                </div>
                {/* Tax breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-500 uppercase">Duti Import</span>
                    <span className="font-black text-slate-700">{fmtRM(data.tax?.total_import)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-500 uppercase">Duti Eksais</span>
                    <span className="font-black text-slate-700">{fmtRM(data.tax?.total_eksais)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-500 uppercase">Cukai Jualan</span>
                    <span className="font-black text-slate-700">{fmtRM(data.tax?.total_jualan)}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penyumbang Tertinggi</p>
                    <p className="text-sm font-black text-indigo-600 uppercase truncate">{data.tax?.top_company || '-'}</p>
                    <p className="text-[11px] font-bold text-slate-600">{fmtRM(data.tax?.top_company_tax)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purata Cukai Per Unit</p>
                    <p className="text-sm font-black text-slate-700">{fmtRM(data.tax?.average)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: New analysis cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 4. Top Model Kenderaan */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Car className="w-6 h-6" /></div>
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Model Popular</h3>
              </div>
              <div className="space-y-3">
                {data.top_models && data.top_models.length > 0 ? (
                  (() => {
                    const maxCount = getMaxCount(data.top_models);
                    return data.top_models.map((m: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-black text-slate-700 uppercase truncate pr-4">{m.model || 'N/A'}</span>
                          <span className="text-[11px] font-black text-violet-600 shrink-0">{fmtNum(m.count)} unit</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-700"
                            style={{ 
                              width: `${(Number(m.count) / maxCount) * 100}%`,
                              background: `linear-gradient(90deg, ${['#7c3aed','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe'][idx]} 0%, ${['#6d28d9','#7c3aed','#8b5cf6','#a78bfa','#c4b5fd'][idx]} 100%)`
                            }}
                          />
                        </div>
                      </div>
                    ));
                  })()
                ) : (
                  <p className="text-xs text-slate-400 font-bold">Tiada data model</p>
                )}
              </div>
            </div>

            {/* 5. Top Syarikat */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl"><Building2 className="w-6 h-6" /></div>
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Top 5 Syarikat</h3>
              </div>
              <div className="space-y-3">
                {data.top_companies && data.top_companies.length > 0 ? (
                  data.top_companies.map((c: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50/80 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-xs shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-700 uppercase truncate">{c.company}</p>
                        <p className="text-[10px] font-bold text-slate-400">{fmtNum(c.count)} kenderaan • {fmtRM(c.total_tax)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-bold">Tiada data syarikat</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Trend & Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 6. Trend Import Bulanan */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Trend Import (6 Bulan)</h3>
              </div>
              {data.monthly_trend && data.monthly_trend.length > 0 ? (
                <div className="flex items-end gap-3 h-40">
                  {(() => {
                    const maxCount = getMaxCount(data.monthly_trend);
                    return data.monthly_trend.map((m: any, idx: number) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-slate-600">{fmtNum(m.count)}</span>
                        <div 
                          className="w-full rounded-t-lg transition-all duration-700"
                          style={{ 
                            height: `${Math.max((Number(m.count) / maxCount) * 120, 8)}px`,
                            background: `linear-gradient(180deg, #fb923c 0%, #f97316 100%)`
                          }}
                        />
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{m.month?.slice(5)}</span>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-slate-300">
                  <BarChart3 className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* 7. Keadaan Kenderaan & CC */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl"><Gauge className="w-6 h-6" /></div>
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Profil Kenderaan</h3>
              </div>

              {/* Condition breakdown */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Keadaan</p>
                <div className="flex gap-2">
                  {data.conditions && data.conditions.length > 0 ? (
                    data.conditions.map((c: any, idx: number) => {
                      const isNew = (c.cond || '').toUpperCase() === 'NEW';
                      return (
                        <div key={idx} className={`flex-1 p-3 rounded-xl text-center ${isNew ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                          <p className={`text-xl font-black ${isNew ? 'text-emerald-600' : 'text-amber-600'}`}>{fmtNum(c.count)}</p>
                          <p className={`text-[9px] font-black uppercase tracking-widest ${isNew ? 'text-emerald-500' : 'text-amber-500'}`}>{c.cond || 'N/A'}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 font-bold">Tiada data</p>
                  )}
                </div>
              </div>

              {/* CC Distribution */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Pecahan Enjin (CC)</p>
                <div className="space-y-2">
                  {data.cc_distribution && data.cc_distribution.length > 0 ? (
                    (() => {
                      const maxCC = getMaxCount(data.cc_distribution);
                      return data.cc_distribution.map((c: any, idx: number) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-black text-slate-600 uppercase">{c.bracket}</span>
                            <span className="text-[10px] font-black text-teal-600">{fmtNum(c.count)}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-700"
                              style={{ width: `${(Number(c.count) / maxCC) * 100}%` }}
                            />
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    <p className="text-xs text-slate-400 font-bold">Tiada data enjin</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
