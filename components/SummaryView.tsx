import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  Car, Building2, Coins, Plus, Loader2, Warehouse, Activity, RefreshCw, Database, Cpu
} from 'lucide-react';
import { StatsCard } from './StatsCard.tsx';
import { COLORS } from '../constants.tsx';
// Fix: Added missing apiService import path verification
import { apiService, apiStatus } from '../services/apiService.ts';

interface SummaryViewProps {
  onNavigateToVehicles?: () => void;
  onNavigateToVehicleDetail?: (lot: string) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ onNavigateToVehicles, onNavigateToVehicleDetail }) => {
  const [stats, setStats] = useState<any>(null);
  const [dominanceData, setDominanceData] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const loadAllData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [statsRes, dominanceRes, activityRes, vehiclesRes] = await Promise.all([
        apiService.getSummaryStats(),
        apiService.getDominanceData(),
        apiService.getActivityLog(),
        apiService.getVehicles()
      ]);

      setStats(statsRes);
      setDominanceData(Array.isArray(dominanceRes) ? dominanceRes : []);
      setActivityLog(Array.isArray(activityRes) ? activityRes : []);
      setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);
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

  // Function to calculate lot occupancy & aging status
  const getLotStatus = (lotNo: string) => {
    const v = vehicles.find(item => item.lot === lotNo);
    if (!v) {
      return { 
        status: 'empty', 
        colorClass: 'bg-slate-900/40 text-slate-500 border-white/5 hover:border-slate-800', 
        label: 'Kosong', 
        data: null, 
        days: 0 
      };
    }
    
    if (!v.raw_date) {
      return { 
        status: 'new', 
        colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', 
        label: 'Baru', 
        data: v, 
        days: 5 
      };
    }
    
    const bondIn = new Date(v.raw_date);
    const today = new Date();
    const diffTime = today.getTime() - bondIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 90) {
      return { 
        status: 'critical', 
        colorClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse', 
        label: `Kritikal (${diffDays} Hari)`, 
        data: v, 
        days: diffDays 
      };
    }
    if (diffDays >= 30) {
      return { 
        status: 'medium', 
        colorClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30', 
        label: `Sederhana (${diffDays} Hari)`, 
        data: v, 
        days: diffDays 
      };
    }
    return { 
      status: 'new', 
      colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 
      label: `Baru (${diffDays} Hari)`, 
      data: v, 
      days: diffDays 
    };
  };

  const get3DStyles = (lotInfo: any) => {
    if (lotInfo.status === 'empty') {
      return {
        transform: 'translateZ(0px)',
        transformStyle: 'preserve-3d' as const,
        boxShadow: '0 0 0 rgba(0,0,0,0)'
      };
    }
    const zHeight = lotInfo.status === 'critical' ? 24 : lotInfo.status === 'medium' ? 14 : 6;
    return {
      transform: `translateZ(${zHeight}px)`,
      transformStyle: 'preserve-3d' as const,
      boxShadow: `0 ${zHeight}px 20px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.15)`
    };
  };

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
          title="Penyata Stok Bulanan"
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

      {/* Visualisasi Lot Gudang (Interactive Stock Grid 3D) */}
      <div className="bg-slate-950 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-white mb-10 overflow-hidden relative print:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.12),transparent)] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
          <div>
            <h3 className="text-sm font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
              <Warehouse className="w-4 h-4" /> Visualisasi Lot Gudang 3D
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              Bongkah isometric 3D melambangkan ketinggian Z mengikut tempoh aging stok (volumetric heatmap).
            </p>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded"></span>
              <span className="text-emerald-400">Baru (&lt; 30 Hari)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500/20 border border-amber-500/30 rounded"></span>
              <span className="text-amber-400">Sederhana (30 - 90 Hari)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-rose-500/20 border border-rose-500/30 rounded"></span>
              <span className="text-rose-400">Kritikal (&gt; 90 Hari)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-800 border border-slate-700 rounded"></span>
              <span className="text-slate-400">Lot Kosong</span>
            </div>
          </div>
        </div>

        {/* 3D Isometric Viewport Container */}
        <div 
          className="flex items-center justify-center py-6 min-h-[340px]"
          style={{ perspective: '1200px' }}
        >
          <div 
            className="grid grid-cols-4 gap-6 p-8 bg-slate-900/40 rounded-3xl border border-white/5 shadow-2xl relative"
            style={{ 
              transform: 'rotateX(55deg) rotateY(0deg) rotateZ(-40deg)', 
              transformStyle: 'preserve-3d',
              width: '100%',
              maxWidth: '560px'
            }}
          >
            {/* Ambient floor lines */}
            <div className="absolute inset-0 border border-indigo-500/5 rounded-3xl pointer-events-none" style={{ transform: 'translateZ(-1px)' }}></div>
            
            {['LOT-A1', 'LOT-A2', 'LOT-A3', 'LOT-A4', 'LOT-A5', 'LOT-A6', 'LOT-A7', 'LOT-A8', 'LOT-B1', 'LOT-B2', 'LOT-B3', 'LOT-B4'].map((lotId) => {
              const lotInfo = getLotStatus(lotId);
              const volumetricStyle = get3DStyles(lotInfo);
              return (
                <div 
                  key={lotId}
                  onClick={() => {
                    if (lotInfo.data && onNavigateToVehicleDetail) {
                      onNavigateToVehicleDetail(lotInfo.data.lot);
                    }
                  }}
                  style={volumetricStyle}
                  className={`relative border rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-300 group ${lotInfo.colorClass} ${
                    lotInfo.status !== 'empty' 
                      ? 'cursor-pointer hover:scale-105 hover:bg-white/10 active:scale-95' 
                      : 'cursor-default'
                  }`}
                >
                  <span className="text-xs font-black tracking-tight">{lotId.replace('LOT-', '')}</span>
                  <span className="text-[8px] font-bold uppercase mt-1 opacity-60">
                    {lotInfo.status === 'empty' ? 'Kosong' : `${lotInfo.days}H`}
                  </span>

                  {/* Hover Tooltip Popup (Reverses 3D transforms for camera focus) */}
                  {lotInfo.data && (
                    <div 
                      style={{ 
                        transform: 'rotateZ(40deg) rotateX(-55deg) translateZ(60px)', 
                        transformStyle: 'preserve-3d'
                      }}
                      className="absolute z-50 bottom-full mb-4 hidden group-hover:block w-56 p-4 bg-slate-950/95 border border-white/15 rounded-2xl shadow-2xl text-left pointer-events-none"
                    >
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Maklumat Kenderaan</p>
                      <h5 className="text-[11px] font-black text-white uppercase mt-1 truncate">{lotInfo.data.model}</h5>
                      <p className="text-[9px] text-slate-400 font-bold truncate mt-0.5">{lotInfo.data.company}</p>
                      <div className="mt-2.5 pt-2.5 border-t border-white/10 flex justify-between items-center text-[9px] font-bold text-slate-500">
                        <span>Tempoh</span>
                        <span className={`px-2 py-0.5 rounded uppercase font-black ${
                          lotInfo.status === 'critical' ? 'bg-rose-500/10 text-rose-400' : lotInfo.status === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {lotInfo.days} Hari
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">Dominasi Syarikat</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Pecahan unit kenderaan masa nyata</p>
          </div>

          <div className="flex flex-col xl:flex-row items-center gap-8">
            <div className="w-full xl:w-1/2 h-[320px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={safeDominance.map(d => ({ ...d, value: Number(d.value) || 0 }))}
                    innerRadius={85}
                    outerRadius={115}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {safeDominance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.15)',
                      padding: '12px 16px'
                    }}
                    itemStyle={{ fontWeight: '900', fontSize: '11px', textTransform: 'uppercase' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{totalUnits}</span>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Unit Total</span>
              </div>
            </div>

            <div className="w-full xl:w-1/2 grid grid-cols-1 gap-3">
              {safeDominance.slice(0, 6).map((item, index) => {
                const percentage = totalUnits > 0 ? ((Number(item.value) / totalUnits) * 100).toFixed(1) : 0;
                return (
                  <div key={index} className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50/50 border border-slate-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-[10px] font-black text-slate-700 truncate uppercase tracking-tight">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-indigo-600 ml-2">{percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-slate-100">
                      <div
                        className="h-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-16 pt-12 border-t border-slate-50">
            <div className="mb-8">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                Ranking Stok Mengikut Syarikat
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Perbandingan volum unit merentas portfolio</p>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={safeDominance.slice(0, 8)}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#barGradient)"
                    radius={[0, 12, 12, 0]}
                    barSize={24}
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 mt-12 gap-x-12 gap-y-6">
            {safeDominance.slice(0, 10).map((item, index) => {
              const percentage = totalUnits > 0 ? ((item.value / totalUnits) * 100).toFixed(1) : 0;
              return (
                <div key={index} className="flex flex-col gap-2 group p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-[11px] font-black text-slate-700 truncate max-w-[200px] uppercase tracking-tight">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{percentage}%</span>
                      <span className="text-[11px] font-bold text-slate-400">{item.value} unit</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)]"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                        opacity: 0.8
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex-1">
            <div className="flex items-center justify-between mb-8">
              <h3 
                className="text-xl font-bold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => console.log('Log Aktiviti clicked')}
              >
                Log Aktiviti
              </h3>
              <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live Feed</div>
            </div>

            <div className="space-y-6">
              {safeActivity.length > 0 ? safeActivity.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div 
                    className="flex-shrink-0 w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all cursor-pointer"
                    onClick={onNavigateToVehicles}
                  >
                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="text-[13px] font-bold text-slate-800 leading-tight mb-0.5 truncate uppercase cursor-pointer hover:text-indigo-600 transition-colors"
                      onClick={() => onNavigateToVehicleDetail && onNavigateToVehicleDetail(item.vehicle)}
                    >
                      {item.vehicle}
                    </h4>
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
