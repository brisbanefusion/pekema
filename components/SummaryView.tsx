import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  Car, Building2, Coins, Plus, Loader2, Warehouse, Activity, RefreshCw, Database, Cpu
} from 'lucide-react';
import { StatsCard } from './StatsCard.tsx';
import { COLORS } from '../constants.tsx';
import { apiService, apiStatus } from '../services/apiService.ts';

export const SummaryView: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [dominanceData, setDominanceData] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const loadAllData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [statsRes, dominanceRes, activityRes] = await Promise.all([
        apiService.getSummaryStats(),
        apiService.getDominanceData(),
        apiService.getActivityLog()
      ]);
      
      setStats(statsRes);
      setDominanceData(Array.isArray(dominanceRes) ? dominanceRes : []);
      setActivityLog(Array.isArray(activityRes) ? activityRes : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => loadAllData(false), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Menyediakan Dashboard...</p>
      </div>
    );
  }

  const displayStats = stats || {
    totalVehicles: "N/A",
    activeUnits: "N/A",
    companies: "N/A",
    taxAmount: "RM 0.00",
    taxExact: "RM 0.00"
  };

  const safeDominance = Array.isArray(dominanceData) ? dominanceData : [];
  const safeActivity = Array.isArray(activityLog) ? activityLog : [];
  const totalUnits = safeDominance.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${apiStatus.isLive && !apiStatus.useSimulatedData ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
            {apiStatus.isLive && !apiStatus.useSimulatedData ? <Database className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
            {apiStatus.isLive && !apiStatus.useSimulatedData ? 'Source: Live SQL' : 'Source: Simulated Engine'}
            <span className="relative flex h-2 w-2 ml-1">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiStatus.isLive && !apiStatus.useSimulatedData ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${apiStatus.isLive && !apiStatus.useSimulatedData ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> Updated: {lastUpdated}
          </p>
        </div>
        <button 
          onClick={() => loadAllData(true)}
          className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
        >
          Refresh Feed
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <StatsCard 
          title="Rekod Kenderaan"
          value={displayStats.totalVehicles}
          trend="+4.2%"
          trendType="up"
          icon={<Car className="w-6 h-6 text-white" />}
          colorClass="bg-blue-600 shadow-lg shadow-blue-500/20"
        />
        <StatsCard 
          title="Unit Dalam Gudang"
          value={displayStats.activeUnits}
          subtitle="STOK AKTIF SEMASA"
          icon={<Warehouse className="w-6 h-6 text-white" />}
          colorClass="bg-emerald-600 shadow-lg shadow-emerald-500/20"
        />
        <StatsCard 
          title="Syarikat GB"
          value={displayStats.companies}
          subtitle="RANGKAIAN AKTIF ✓"
          icon={<Building2 className="w-6 h-6 text-white" />}
          colorClass="bg-indigo-600 shadow-lg shadow-indigo-500/20"
        />
        <StatsCard 
          title="Cukai Terkumpul"
          value={displayStats.taxAmount}
          subtitle={`Tepat: ${displayStats.taxExact}`}
          icon={<Coins className="w-6 h-6 text-white" />}
          colorClass="bg-violet-600 shadow-lg shadow-violet-500/20"
        />
        <StatsCard 
          title="Aktiviti Terkini"
          value={safeActivity.length.toString()}
          subtitle="TRANSAKSI HARI INI"
          icon={<Activity className="w-6 h-6 text-white" />}
          colorClass="bg-amber-500 shadow-lg shadow-amber-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800">Dominasi Syarikat</h3>
            <p className="text-xs text-slate-400 font-medium">Pecahan unit kenderaan masa nyata dari pangkalan data</p>
          </div>
          
          <div className="h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeDominance}
                  innerRadius={110}
                  outerRadius={150}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {safeDominance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900 tracking-tighter">{totalUnits}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unit Total</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 mt-8 gap-x-12 gap-y-3">
            {safeDominance.map((item, index) => (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-slate-600 truncate max-w-[180px]">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-400">{item.value} unit</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex-1">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800">Log Aktiviti</h3>
              <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live Feed</div>
            </div>

            <div className="space-y-6">
              {safeActivity.length > 0 ? safeActivity.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-slate-800 leading-tight mb-0.5 truncate uppercase">{item.vehicle}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{item.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-900 leading-none">{item.time}</p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase">{item.date}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center py-10 text-xs font-bold text-slate-300 italic">Tiada aktiviti dikesan</p>
              )}
            </div>
            <button className="w-full mt-10 py-3 border-2 border-slate-100 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-indigo-600 transition-all">
              Lihat Semua Aktiviti →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};