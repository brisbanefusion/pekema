
import React from 'react';
import { 
  X, LayoutDashboard, List, Plus, Scan, Zap, Hourglass, Building2, FileText, Power, Shield, Database, Radio, Eye, Mail, ShieldAlert
} from 'lucide-react';
import { DashboardTab } from '../types';
import { apiStatus, apiService } from '../services/apiService';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: any) => void;
  activeTab: string;
  onLogout: () => void;
  userEmail: string;
  isSuperAdmin: boolean;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onClose, onSelectTab, activeTab, onLogout, userEmail, isSuperAdmin }) => {
  if (!isOpen) return null;

  const MenuItem = ({ icon: Icon, label, section, isActive = false }: { icon?: any, label: string, section?: boolean, isActive?: boolean }) => (
    <button 
      onClick={() => !section && onSelectTab(label)}
      className={`w-full flex items-center gap-4 px-6 py-3 transition-all ${
        section ? 'mt-6 mb-2 cursor-default' : 'hover:bg-white/5 active:scale-95'
      } ${isActive ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500' : 'text-slate-300'}`}
    >
      {section ? (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</span>
      ) : (
        <>
          <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
          <span className={`text-sm font-bold ${isActive ? 'text-white' : ''}`}>{label}</span>
        </>
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Menu Container */}
      <div className="relative w-full max-w-[320px] bg-[#0b1221] h-full shadow-2xl flex flex-col border-r border-white/5 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0f172a]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-5 h-5 text-white" />
             </div>
             <div>
                <h2 className="text-sm font-black text-white leading-none">GBPekema</h2>
                <p className="text-[8px] text-blue-400 font-bold uppercase tracking-widest mt-1">COMMAND CENTER</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Quick Info */}
        <div className="px-6 py-5 flex items-center gap-4 bg-white/5">
           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-lg ${isSuperAdmin ? 'bg-gradient-to-br from-indigo-600 to-purple-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
              {userEmail.charAt(0).toUpperCase()}
           </div>
           <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{isSuperAdmin ? 'Super Admin' : 'Kakitangan JKDM'}</p>
                {isSuperAdmin && <ShieldAlert className="w-2.5 h-2.5 text-indigo-400" />}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3 text-blue-400" />
                <p className="text-[9px] text-slate-400 font-bold truncate">{userEmail}</p>
              </div>
           </div>
        </div>

        {/* MODE TOGGLE IN SIDEBAR */}
        <div className="px-6 py-4 border-b border-white/5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Punca Data</p>
          <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-xl">
             <button 
               onClick={() => { apiService.setMode(false); onClose(); }}
               className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${!apiStatus.useSimulatedData ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}
             >
                <Radio className="w-3.5 h-3.5" />
                <span className="text-[8px] font-black uppercase">Live</span>
             </button>
             <button 
               onClick={() => { apiService.setMode(true); onClose(); }}
               className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${apiStatus.useSimulatedData ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}
             >
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[8px] font-black uppercase">Demo</span>
             </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <MenuItem 
            icon={LayoutDashboard} 
            label="Dashboard Utama" 
            isActive={activeTab === DashboardTab.RINGKASAN} 
          />
          
          <MenuItem label="PENGURUSAN" section />
          <MenuItem 
            icon={List} 
            label="Senarai Kenderaan" 
            isActive={activeTab === DashboardTab.KENDERAAN || activeTab === DashboardTab.REKOD_DETAIL}
          />
          <MenuItem 
            icon={Plus} 
            label="Pendaftaran Manual" 
            isActive={activeTab === DashboardTab.TAMBAH_KENDERAAN}
          />

          <MenuItem label="ANALISA & LAPORAN" section />
          <MenuItem 
            icon={Zap} 
            label="Analisa Pintar" 
            isActive={activeTab === DashboardTab.INSIGHTS} 
          />
          <MenuItem 
            icon={Hourglass} 
            label="Analisa Tempoh Gudang" 
            isActive={activeTab === DashboardTab.AGING}
          />
          <MenuItem 
            icon={Building2} 
            label="Senarai Syarikat" 
            isActive={activeTab === DashboardTab.SYARIKAT}
          />
          <MenuItem 
            icon={FileText} 
            label="Jana Laporan" 
            isActive={activeTab === DashboardTab.ANALISA} 
          />

          {isSuperAdmin && (
            <>
              <MenuItem label="PENTADBIR SISTEM" section />
              <MenuItem 
                icon={ShieldAlert} 
                label="Superadmin Panel" 
                isActive={activeTab === DashboardTab.ADMIN} 
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#0f172a] mt-auto">
           <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{isSuperAdmin ? 'Superadmin Mode' : 'Kakitangan JKDM'}</p>
                 <div className="flex items-center gap-1.5 mt-0.5">
                   <div className={`w-1 h-1 rounded-full ${apiStatus.isLive ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                   <p className="text-[8px] text-slate-500 uppercase tracking-widest">{apiStatus.isLive ? 'Online' : 'Offline'}</p>
                 </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-10 h-10 bg-rose-600/20 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-lg"
              >
                 <Power className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
