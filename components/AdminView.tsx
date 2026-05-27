import React, { useState, useEffect } from 'react';
import { ShieldAlert, UserPlus, Trash2, Search, Mail, ShieldCheck, AlertCircle, AlertTriangle, X, Database, RefreshCw, CheckCircle, Settings, Info, Terminal, Eye, History } from 'lucide-react';
// Fix: Added missing .ts extension to comply with consistent import patterns
import { apiService, apiStatus } from '../services/apiService.ts';

interface AdminViewProps {
  whitelist: string[];
  onAdd: (email: string) => void;
  onRemove: (email: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ whitelist, onAdd, onRemove }) => {
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailToRemove, setEmailToRemove] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [setupResult, setSetupResult] = useState<{status: 'success' | 'error', message: string} | null>(null);
  const [dbReport, setDbReport] = useState<any | null>(null);

  // New States for Audit Logs
  const [activeSubTab, setActiveSubTab] = useState<'whitelist' | 'audit'>('whitelist');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logSearchQuery, setLogSearchQuery] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.toLowerCase().trim();
    if (!email.endsWith('@customs.gov.my')) {
      setError('Gunakan emel rasmi @customs.gov.my sahaja.');
      return;
    }
    onAdd(email);
    setNewEmail('');
    setError(null);
    // Refresh logs after brief delay
    setTimeout(fetchLogs, 1000);
  };

  const handleDBAction = async (action: 'setup' | 'inspect') => {
    setIsProcessing(true);
    setSetupResult(null);
    setDbReport(null);
    try {
      const result = action === 'setup' ? await apiService.setupDB() : await apiService.debugDB();
      if (result && result.status === 'success') {
        if (action === 'inspect') setDbReport(result.report);
        else setSetupResult({ status: 'success', message: result.message || 'Selesai.' });
      } else {
        setSetupResult({ status: 'error', message: result?.message || 'Ralat komunikasi API.' });
      }
      setTimeout(fetchLogs, 1000);
    } catch (err: any) {
      setSetupResult({ status: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await apiService.getAuditLogs();
      if (Array.isArray(logs)) {
        setAuditLogs(logs);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter audit logs based on search query
  const filteredLogs = auditLogs.filter(log => {
    const query = logSearchQuery.toLowerCase();
    return (
      (log.email && log.email.toLowerCase().includes(query)) ||
      (log.action && log.action.toLowerCase().includes(query)) ||
      (log.details && log.details.toLowerCase().includes(query))
    );
  });

  const getActionBadgeClass = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('gagal')) return 'bg-rose-500/10 text-rose-600 border border-rose-500/25';
    if (act.includes('tambah')) return 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/25';
    if (act.includes('padam') || act.includes('remove')) return 'bg-amber-500/10 text-amber-600 border border-amber-500/25';
    if (act.includes('hantar') || act.includes('warning') || act.includes('amaran')) return 'bg-blue-500/10 text-blue-600 border border-blue-500/25';
    if (act.includes('setup') || act.includes('database')) return 'bg-purple-500/10 text-purple-600 border border-purple-500/25';
    if (act.includes('masuk') || act.includes('login')) return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25';
    return 'bg-slate-500/10 text-slate-600 border border-slate-500/25';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <ShieldAlert className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
               <ShieldCheck className="w-5 h-5 text-indigo-300" />
               <span className="text-[10px] font-black tracking-[0.3em] text-indigo-300 uppercase italic">Superadmin Command</span>
            </div>
            <h2 className="text-4xl font-black mb-4 leading-tight italic uppercase tracking-tighter">Pengurusan <span className="text-indigo-400">Infrastruktur</span></h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Kemas kini whitelist akses, urus pangkalan data Gudang Pekema, dan pantau log aktiviti keselamatan.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] w-full md:w-80">
             <div className="flex items-center gap-3 mb-4">
                <Database className={`w-5 h-5 ${apiStatus.isLive ? 'text-emerald-400' : 'text-rose-400'}`} />
                <h3 className="text-xs font-black uppercase tracking-widest italic">DB Control</h3>
             </div>
             
             <div className="grid grid-cols-1 gap-2">
               <button 
                 onClick={() => handleDBAction('setup')}
                 disabled={isProcessing}
                 className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
               >
                 {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
                 Repair Tables
               </button>
               <button 
                 onClick={() => handleDBAction('inspect')}
                 disabled={isProcessing}
                 className="w-full flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
               >
                 <Eye className="w-3.5 h-3.5" /> Inspect Database
               </button>
             </div>

             {setupResult && (
                <div className={`mt-4 p-4 rounded-xl flex flex-col gap-2 border ${setupResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                   <span className="text-[9px] font-black uppercase">{setupResult.status === 'success' ? 'Berjaya' : 'Ralat'}</span>
                   <span className="text-[10px] font-bold leading-tight">{setupResult.message}</span>
                </div>
             )}
          </div>
        </div>
      </div>

      {dbReport && (
        <div className="bg-slate-900 rounded-[2rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in duration-300">
           <div className="flex items-center gap-3 mb-6">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Database Inspector Console</h3>
              <button onClick={() => setDbReport(null)} className="ml-auto text-slate-500 hover:text-white"><X className="w-4 h-4"/></button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(dbReport).map(([tableName, columns]: [string, any]) => (
                <div key={tableName} className="bg-black/40 rounded-xl p-4 border border-white/5">
                   <p className="text-indigo-400 text-xs font-black uppercase mb-3 flex items-center gap-2">
                      <Database className="w-3 h-3" /> Table: {tableName}
                   </p>
                   <div className="space-y-1 font-mono text-[9px]">
                      {columns.map((col: any) => (
                        <div key={col.Field} className="flex justify-between border-b border-white/5 pb-1">
                           <span className="text-white/80">{col.Field}</span>
                           <span className="text-slate-500 italic">{col.Type}</span>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex gap-6 border-b border-slate-100 pb-3">
        <button 
          onClick={() => setActiveSubTab('whitelist')}
          className={`flex items-center gap-2 pb-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
            activeSubTab === 'whitelist' 
              ? 'border-indigo-600 text-indigo-600 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Akses & Whitelist
        </button>
        <button 
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 pb-2 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
            activeSubTab === 'audit' 
              ? 'border-indigo-600 text-indigo-600 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-4 h-4" /> Log Audit Keselamatan
        </button>
      </div>

      {activeSubTab === 'whitelist' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-full">
              <div className="flex items-center gap-3 mb-6">
                 <UserPlus className="w-5 h-5 text-indigo-600" />
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Tambah Akses Baharu</h3>
              </div>
              
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Emel Kakitangan</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      placeholder="nama@customs.gov.my"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                {error && <p className="text-[10px] font-bold text-rose-500 uppercase px-2">{error}</p>}
                <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                  Kemaskini Whitelist
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden h-full">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Whitelist Pegawai</h3>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-100">
                    {whitelist.map((email) => (
                      <tr key={email} className="group hover:bg-slate-50/50">
                        <td className="px-8 py-5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">
                            {email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{email}</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {email !== 'afandi.amin@customs.gov.my' && (
                            <button onClick={() => setEmailToRemove(email)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-8 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" /> Rekod Aktiviti Pegawai
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Audit trail terperinci bagi aktiviti log masuk, whitelist, dan amaran AP.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Cari emel / tindakan / butiran..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button 
                onClick={fetchLogs}
                disabled={isLoadingLogs}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-100 transition-all active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Masa</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Pegawai</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Tindakan</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Butiran Aktiviti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoadingLogs ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-wider">
                      Memuatkan Log Audit...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-wider">
                      Tiada rekod log ditemui
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">{log.time}</td>
                      <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">{log.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium max-w-xs md:max-w-md break-words">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Remove Confirmation Modal */}
      {emailToRemove && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
           <div className="bg-white p-8 rounded-[2rem] text-center max-w-sm w-full animate-in zoom-in">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-800">Sahkan Padam?</h3>
              <p className="text-xs text-slate-500 mt-2 mb-6">Akses untuk {emailToRemove} akan dibatalkan.</p>
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setEmailToRemove(null)} className="py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase">Batal</button>
                 <button onClick={() => { onRemove(emailToRemove); setEmailToRemove(null); setTimeout(fetchLogs, 1000); }} className="py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase">Sahkan</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

