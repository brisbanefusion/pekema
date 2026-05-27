import React, { useState } from 'react';
import { 
  Search, RotateCcw, Printer, FileText, Download, 
  TrendingUp, Calendar, Car, Building2, Shield, Sparkles,
  Mail, CheckCircle2, AlertTriangle, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
// Fix: Added missing apiService import path verification
import { apiService } from '../services/apiService.ts';

const CHART_DATA = [
  { date: '16/02', value: 20000, forecast: 20000 },
  { date: '16/02', value: 22000, forecast: 22000 },
  { date: '16/02', value: 21000, forecast: 21000 },
  { date: '16/02', value: 25000, forecast: 25000 },
  { date: '16/02', value: 23000, forecast: 23000 },
  { date: '16/02', value: 20000, forecast: 20000 },
  { date: '16/02', value: 18000, forecast: 18000 },
  { date: '16/02', value: 15000, forecast: 15000 },
  { date: '20/02', value: 33000, forecast: 33000 },
  { date: '06/06', value: 5000,  forecast: 5000 },
  { date: '11/06', value: 25000, forecast: 25000 },
  { date: '25/06', value: 35000, forecast: 35000 },
  { date: '08/07', value: 43000, forecast: 43000 },
  { date: '22/07', value: 41000, forecast: 41000 }, // Last actual point
  // AI Forecast points
  { date: '08/08 (AI)', value: null, forecast: 44000 },
  { date: '22/08 (AI)', value: null, forecast: 48000 },
  { date: '08/09 (AI)', value: null, forecast: 51000 },
  { date: '22/09 (AI)', value: null, forecast: 54000 },
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
  const [companyFilter, setCompanyFilter] = useState('Semua Syarikat (Mohon Terus)');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSendEmail = async () => {
    const target = companyFilter.includes('Semua') ? 'Semua Syarikat' : companyFilter;
    setEmailStatus('sending');
    try {
      const res = await apiService.emailReport(target);
      if (res && res.status === 'success') {
        setEmailStatus('success');
        setTimeout(() => setEmailStatus('idle'), 3000);
      } else {
        setEmailStatus('error');
        setTimeout(() => setEmailStatus('idle'), 3000);
      }
    } catch (err) {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    }
  };

  return (
    <div id="printable-report-area" className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Inject Print CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media screen {
          .print-header-only { display: none !important; }
          .print-footer-only { display: none !important; }
        }
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          /* Hide screen-only stuff */
          nav, aside, header, .sidebar, .top-nav, button, select, input, .print-hide, .recharts-legend-wrapper, .inline-flex, .print-btn-section {
            display: none !important;
          }
          /* Re-layout container for full-width print page */
          #printable-report-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Card modifications for clean prints */
          .print-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            border-radius: 8px !important;
            padding: 16px !important;
            margin-bottom: 24px !important;
            page-break-inside: avoid;
            background: white !important;
          }
          .print-header-only {
            display: flex !important;
          }
          .print-footer-only {
            display: block !important;
          }
          tr {
            page-break-inside: avoid;
          }
        }
      `}} />

      {/* Print-Only Header */}
      <div className="print-header-only flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-8 hidden">
        <div>
          <h2 className="text-sm font-black tracking-wider text-slate-800">JABATAN KASTAM DIRAJA MALAYSIA</h2>
          <p className="text-[9px] font-bold text-slate-500">DENGAN KERJASAMA PEKEMA MALAYSIA</p>
          <p className="text-[8px] font-mono text-slate-400 mt-1">SISTEM INTEGRASI GUDANG PEKEMA (v2.9)</p>
        </div>
        <div className="text-right">
          <span className="border-2 border-rose-600 text-rose-600 text-[10px] font-black px-3 py-1 uppercase tracking-widest rounded-md">
            SULIT / KAS
          </span>
          <p className="text-[8px] font-bold text-slate-500 mt-2">Tarikh Cetakan: {new Date().toLocaleDateString('ms-MY')}</p>
        </div>
      </div>

      {/* Header Center */}
      <div className="text-center space-y-4 pt-4 print:text-left print:pt-0">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100/50 shadow-sm print:hidden">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Financial Intelligence</span>
        </div>
        <h1 className="text-5xl font-black text-[#1e3a8a] tracking-tight print:text-3xl print:text-slate-800">
          Pusat <span className="text-emerald-500 print:text-slate-800">Laporan</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-lg mx-auto print:mx-0 print:text-xs">
          Penjanaan laporan inventori, unjuran kewangan cukai, serta ramalan hasil berasaskan AI.
        </p>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto print:max-w-none print:grid-cols-2 print:gap-4 print-card">
        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/20 relative group hover:border-blue-200 transition-all print:border-none print:p-2 print:shadow-none">
          <div className="absolute top-0 right-0 p-6 opacity-5 print:hidden">
             <Car className="w-20 h-20" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 print:text-slate-500">Jumlah Unit</p>
          <h3 className="text-5xl font-black text-slate-800 tracking-tighter print:text-3xl">3,343</h3>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-blue-500 rounded-b-[2rem] print:hidden"></div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/20 relative group hover:border-emerald-200 transition-all print:border-none print:p-2 print:shadow-none">
          <div className="absolute top-0 right-0 p-6 opacity-5 print:hidden">
             <TrendingUp className="w-20 h-20" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 print:text-slate-500">Anggaran Cukai</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-blue-600 print:text-slate-800">RM</span>
            <h3 className="text-5xl font-black text-blue-900 tracking-tighter print:text-3xl print:text-slate-800">114,581,923</h3>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-emerald-500 rounded-b-[2rem] print:hidden"></div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-4 lg:gap-8 max-w-5xl mx-auto print:hidden">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 className="w-3 h-3" /> Syarikat / Entiti
            </label>
            <select 
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
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
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 print:border-none print:shadow-none print:p-0 print-card">
        <div className="flex items-center justify-between mb-10 print:mb-4">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 print:hidden">
                <TrendingUp className="w-5 h-5" />
             </div>
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider print:text-xs">Carta Aliran & Ramalan Hasil Cukai</h3>
           </div>
           
           <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider print:hidden">
             <div className="flex items-center gap-1.5">
               <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
               <span>Hasil Sebenar</span>
             </div>
             <div className="flex items-center gap-1.5">
               <span className="w-3 h-3 border-2 border-dashed border-indigo-500 rounded-full"></span>
               <span className="text-indigo-600">Ramalan AI</span>
             </div>
           </div>
        </div>

        <div className="h-[300px] w-full print:h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                tickFormatter={(val) => val.toLocaleString()}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              />
              
              {/* Actual revenue area */}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 1 }}
              />

              {/* AI Forecast area */}
              <Area 
                type="monotone" 
                dataKey="forecast" 
                stroke="#6366f1" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorForecast)" 
                dot={{ r: 2.5, fill: '#6366f1', strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 1 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 print:p-0 print:pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 print:text-base">Pecahan Transaksi Terkini</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 print:text-slate-500">MENUNJUKKAN 10 REKOD TERBARU DARI 3,343 REKOD</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 print-btn-section">
             {/* Email Report Button */}
             <button 
               disabled={emailStatus === 'sending' || emailStatus === 'success'}
               onClick={handleSendEmail}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                 emailStatus === 'sending'
                   ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                   : emailStatus === 'success'
                   ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 border border-emerald-600'
                   : emailStatus === 'error'
                   ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 border border-rose-700'
                   : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 border border-indigo-700'
               }`}
             >
                {emailStatus === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
                {emailStatus === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {emailStatus === 'error' && <AlertTriangle className="w-4 h-4" />}
                {emailStatus === 'idle' && <Mail className="w-4 h-4" />}
                {emailStatus === 'sending' ? 'Menghantar...' : emailStatus === 'success' ? 'E-mel Dihantar' : emailStatus === 'error' ? 'Gagal Hantar' : 'Hantar E-mel Laporan'}
             </button>
             
             <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#1e40af] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                <Printer className="w-4 h-4" /> Jana PDF Laporan
             </button>
             <button className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all">
                <FileText className="w-4 h-4" /> CSV
             </button>
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 print:bg-white print:border-b print:border-slate-300">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest print:px-2 print:py-2">Syarikat / Entiti</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest print:px-2 print:py-2">Tarikh</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest print:px-2 print:py-2">Model Kenderaan</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right print:px-2 print:py-2">Casis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 print:divide-y print:divide-slate-200">
              {TRANSACTIONS.map((tx, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group print:hover:bg-white">
                  <td className="px-10 py-6 print:px-2 print:py-3">
                    <span className="text-xs font-black text-slate-600 uppercase group-hover:text-blue-600 transition-colors print:text-[10px]">
                      {tx.company}
                    </span>
                  </td>
                  <td className="px-10 py-6 print:px-2 print:py-3">
                    <span className="text-[11px] font-bold text-slate-400 print:text-[10px] print:text-slate-600">
                      {tx.date}
                    </span>
                  </td>
                  <td className="px-10 py-6 print:px-2 print:py-3">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all print:hidden">
                          <Car className="w-3.5 h-3.5" />
                       </div>
                       <span className="text-[11px] font-black text-slate-700 uppercase leading-tight max-w-[280px] print:text-[10px] print:max-w-none">
                         {tx.model}
                       </span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right print:px-2 print:py-3">
                    <span className="text-[11px] font-black text-slate-400 group-hover:text-slate-900 transition-colors tabular-nums print:text-[10px] print:text-slate-800 font-mono">
                      {tx.chassis}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30 text-center print:hidden">
           <button className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:text-blue-800 transition-colors">Lihat Semua Rekod Transaksi →</button>
        </div>
      </div>

      {/* Print-Only Footer Sign-Off */}
      <div className="print-footer-only hidden mt-16 pt-8 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-12 text-xs">
          <div className="space-y-16">
            <p className="font-bold text-slate-600">Disediakan Oleh:</p>
            <div>
              <div className="w-48 border-b border-slate-400"></div>
              <p className="font-black text-slate-800 mt-2">Superadmin Kastam / Pegawai Bertugas</p>
              <p className="text-[10px] text-slate-400">Jabatan Kastam Diraja Malaysia</p>
            </div>
          </div>
          <div className="space-y-16 text-right flex flex-col items-end">
            <p className="font-bold text-slate-600 text-right">Disahkan Oleh:</p>
            <div className="flex flex-col items-end">
              <div className="w-48 border-b border-slate-400"></div>
              <p className="font-black text-slate-800 mt-2 text-right">Pengarah Cawangan AP & Gudang</p>
              <p className="text-[10px] text-slate-400 text-right">Persatuan Pengimport & Peniaga Kenderaan Melayu Malaysia (PEKEMA)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
