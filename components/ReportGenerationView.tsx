
import React from 'react';
import { 
  Search, RotateCcw, Printer, FileText, Download, 
  TrendingUp, Calendar, Car, Building2, Shield, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const CHART_DATA = [
  { date: '16/02', value: 20000 },
  { date: '16/02', value: 22000 },
  { date: '16/02', value: 21000 },
  { date: '16/02', value: 25000 },
  { date: '16/02', value: 23000 },
  { date: '16/02', value: 20000 },
  { date: '16/02', value: 18000 },
  { date: '16/02', value: 15000 },
  { date: '20/02', value: 33000 },
  { date: '06/06', value: 5000 },
  { date: '11/06', value: 25000 },
  { date: '25/06', value: 35000 },
  { date: '08/07', value: 43000 },
  { date: '22/07', value: 41000 },
];

const TRANSACTIONS = [
  { company: 'WAS SUPREME RADIUS SDN ...', date: '22 Jul 2026', model: 'TOYOTA ALPHARD 2.5 SC PACKAGE 3BA-AGH30W (A)', chassis: 'AGH30-9033' },
  { company: 'WAL SERANGKAI AUTOMOB...', date: '08 Jul 2026', model: 'NISSAN ELGRAND 250 HIGHWAY STAR PREMIUM 5BA-TE52', chassis: 'TE52-14650' },
  { company: 'WAS SUPREME RADIUS SDN ...', date: '25 Jun 2026', model: 'TOYOTA ALPHARD 2.5 S 3BA-AGH30W (A)', chassis: 'AGH30-0309' },
  { company: 'WAS SUPREME RADIUS SDN ...', date: '11 Jun 2026', model: 'TOYOTA VOXY ZS KIRAMEKI II DBA-ZRR80W (A)', chassis: 'ZRR80-0614' },
  { company: 'WN4 ESMITHA AUTO SDN B...', date: '06 Jun 2026', model: '1 UNIT USED MINI ONE', chassis: 'WMWXS20X0' },
  { company: 'WT4 SS AUTO VENTURE SD...', date: '20 Feb 2026', model: 'TOYOTA GR YARIS 4BA-GXPA16', chassis: 'GXPA16-000' },
  { company: 'WAX RAZIMOTO SDN BHD', date: '16 Feb 2026', model: 'USED TOYOTA VOXY S-Z C/W ACCESSORIES', chassis: 'MZRA90-004' },
  { company: 'WAX RAZIMOTO SDN BHD', date: '16 Feb 2026', model: 'USED TOYOTA ALPHARD SC C/W ACCESSORIES', chassis: 'AGH30-0395' },
  { company: 'WAX RAZIMOTO SDN BHD', date: '16 Feb 2026', model: 'USED TOYOTA ALPHARD SC C/W ACCESSORIES', chassis: 'AGH30-0459' },
  { company: 'WAX RAZIMOTO SDN BHD', date: '16 Feb 2026', model: 'USED TOYOTA ALPHARD SC C/W ACCESSORIES', chassis: 'AGH30-0380' },
];

export const ReportGenerationView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Center */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100/50 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Financial Intelligence</span>
        </div>
        <h1 className="text-5xl font-black text-[#1e3a8a] tracking-tight">
          Pusat <span className="text-emerald-500">Laporan</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-lg mx-auto">
          Penjanaan laporan inventori dan data cukai yang komprehensif.
        </p>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/20 relative group hover:border-blue-200 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <Car className="w-20 h-20" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jumlah Unit</p>
          <h3 className="text-5xl font-black text-slate-800 tracking-tighter">3,343</h3>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-blue-500 rounded-b-[2rem]"></div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/20 relative group hover:border-emerald-200 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <TrendingUp className="w-20 h-20" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Anggaran Cukai</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-blue-600">RM</span>
            <h3 className="text-5xl font-black text-blue-900 tracking-tighter">114,581,923</h3>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-emerald-500 rounded-b-[2rem]"></div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-4 lg:gap-8 max-w-5xl mx-auto">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 className="w-3 h-3" /> Syarikat / Entiti
            </label>
            <select className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
              <option>Semua Syarikat (Mohon Terus)</option>
              <option>WAX RAZIMOTO SDN BHD</option>
              <option>WAF SINAR AUTO SDN BHD</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Tarikh Mula
            </label>
            <input type="date" className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Tarikh Akhir
            </label>
            <input type="date" className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none" />
          </div>
        </div>
        <div className="flex items-center gap-2 lg:pr-4">
           <button className="flex items-center gap-2 bg-[#1e40af] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/20">
              <Search className="w-4 h-4" /> Jana
           </button>
           <button className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-all">
              <RotateCcw className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-10">
           <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-5 h-5" />
           </div>
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Analisis Transaksi Terkini</h3>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                tickFormatter={(val) => val.toLocaleString()}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Senarai Transaksi</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">FOUND 3343 RECORDS</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 bg-slate-50 text-slate-600 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">
                <Printer className="w-4 h-4" /> Print
             </button>
             <button className="flex items-center gap-2 bg-[#10b981] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                <FileText className="w-4 h-4" /> CSV
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Syarikat / Entiti</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarikh</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Casis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {TRANSACTIONS.map((tx, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <span className="text-xs font-black text-slate-600 uppercase group-hover:text-blue-600 transition-colors">
                      {tx.company}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[11px] font-bold text-slate-400">
                      {tx.date}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Car className="w-3.5 h-3.5" />
                       </div>
                       <span className="text-[11px] font-black text-slate-700 uppercase leading-tight max-w-[280px]">
                         {tx.model}
                       </span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="text-[11px] font-black text-slate-400 group-hover:text-slate-900 transition-colors tabular-nums">
                      {tx.chassis}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30 text-center">
           <button className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:text-blue-800 transition-colors">Lihat Semua Rekod Transaksi →</button>
        </div>
      </div>
    </div>
  );
};
