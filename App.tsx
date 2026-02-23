
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, Menu, Database, RefreshCw, ShieldCheck, Mail, Lock, CheckCircle2, ExternalLink
} from 'lucide-react';
import { SummaryView } from './components/SummaryView.tsx';
import { VehicleListView } from './components/VehicleListView.tsx';
import { IntelligenceModal } from './components/IntelligenceModal.tsx';
import { SidebarMenu } from './components/SidebarMenu.tsx';
import { DashboardTab } from './types.ts';
import { apiService, apiStatus } from './services/apiService.ts';
// Fix: Import missing view components including AdminView to resolve the "Cannot find name 'AdminView'" error
import { AdminView } from './components/AdminView.tsx';
import { InsightsView } from './components/InsightsView.tsx';
import { CompanyListView } from './components/CompanyListView.tsx';
import { TaxAnalysisView } from './components/TaxAnalysisView.tsx';
import { AgingAnalysisView } from './components/AgingAnalysisView.tsx';
import { ReportGenerationView } from './components/ReportGenerationView.tsx';
import { AddVehicleView } from './components/AddVehicleView.tsx';
import { VehicleDetailView } from './components/VehicleDetailView.tsx';

const SUPERADMIN_EMAIL = 'afandi.amin@customs.gov.my';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.RINGKASAN);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(apiStatus.isLive);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(apiStatus.useSimulatedData);
  const [whitelist, setWhitelist] = useState<string[]>([SUPERADMIN_EMAIL]);

  const checkConnection = useCallback(async () => {
    if (isSimulated) return;
    await apiService.ping();
    setIsLive(apiStatus.isLive);
    setErrorMessage(apiStatus.lastError);
  }, [isSimulated]);

  // Fix: Load whitelist data from apiService for AdminView
  useEffect(() => {
    const loadWhitelist = async () => {
      const data = await apiService.getWhitelist();
      if (Array.isArray(data)) {
        setWhitelist(data.includes(SUPERADMIN_EMAIL) ? data : [SUPERADMIN_EMAIL, ...data]);
      }
    };
    if (isAuthenticated && userEmail === SUPERADMIN_EMAIL) {
      loadWhitelist();
    }
  }, [isAuthenticated, userEmail]);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const handleRetryConnection = () => {
    setErrorMessage(null);
    checkConnection();
  };

  const openDiagnostic = () => {
    window.open(`${apiService.getApiUrl()}?action=test`, '_blank');
  };

  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.currentTarget as any).email.value.toLowerCase().trim();
    setIsAuthenticating(true);
    setTimeout(() => {
      setUserEmail(email);
      setIsAuthenticated(true);
      setIsAuthenticating(false);
    }, 1000);
  };

  // Fix: Added handlers for AdminView whitelist management
  const handleAddToWhitelist = async (email: string) => {
    await apiService.addToWhitelist(email);
    const data = await apiService.getWhitelist();
    if (Array.isArray(data)) setWhitelist(data.includes(SUPERADMIN_EMAIL) ? data : [SUPERADMIN_EMAIL, ...data]);
  };

  const handleRemoveFromWhitelist = async (email: string) => {
    await apiService.removeFromWhitelist(email);
    const data = await apiService.getWhitelist();
    if (Array.isArray(data)) setWhitelist(data.includes(SUPERADMIN_EMAIL) ? data : [SUPERADMIN_EMAIL, ...data]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b1221] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
           <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                 <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase italic">GBPekema <span className="text-blue-500">v2.5</span></h1>
           </div>
           <form onSubmit={handleGoogleLogin} className="space-y-6">
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input name="email" type="email" required defaultValue="afandi.amin@customs.gov.my" className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="emel@customs.gov.my" />
              </div>
              <button type="submit" disabled={isAuthenticating} className="w-full bg-white text-slate-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                {isAuthenticating ? 'Mengesahkan...' : 'Log Masuk'}
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafc]">
      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onSelectTab={(label) => {
          // Fix: Map all sidebar menu labels to their corresponding DashboardTab values
          const map: any = { 
            "Dashboard Utama": DashboardTab.RINGKASAN, 
            "Senarai Kenderaan": DashboardTab.KENDERAAN,
            "Pendaftaran Manual": DashboardTab.TAMBAH_KENDERAAN,
            "Analisa Pintar": DashboardTab.INSIGHTS,
            "Analisa Tempoh Gudang": DashboardTab.AGING,
            "Senarai Syarikat": DashboardTab.SYARIKAT,
            "Jana Laporan": DashboardTab.ANALISA,
            "Superadmin Panel": DashboardTab.ADMIN
          };
          if (map[label]) setActiveTab(map[label]);
          setIsSidebarOpen(false);
      }} activeTab={activeTab} onLogout={() => setIsAuthenticated(false)} userEmail={userEmail} isSuperAdmin={userEmail === SUPERADMIN_EMAIL} />

      <header className="fixed top-0 w-full z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto bg-slate-900/90 backdrop-blur-md text-white rounded-full flex items-center justify-between px-6 py-2 shadow-xl border border-white/10">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            <h1 className="font-bold text-sm">GBPekema</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 p-1 rounded-full flex text-[10px] font-black uppercase">
               <button onClick={() => { setIsSimulated(false); apiService.setMode(false); checkConnection(); }} className={`px-3 py-1 rounded-full transition-all ${!isSimulated ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-white/10'}`}>Live</button>
               <button onClick={() => { setIsSimulated(true); apiService.setMode(true); }} className={`px-3 py-1 rounded-full transition-all ${isSimulated ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-white/10'}`}>Demo</button>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><Menu className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-28">
        {errorMessage && !isSimulated && (
          <div className="mb-8 p-8 bg-rose-50 border-2 border-rose-200 rounded-[2.5rem] shadow-xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <Lock className="w-8 h-8 text-rose-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-black text-rose-800 uppercase tracking-tight">Sekatan Sambungan (SSL/Antibot)</h3>
                <p className="text-xs text-rose-700 font-bold mt-2 leading-relaxed opacity-80">
                  Pelayan InfinityFree memerlukan anda mengesahkan identiti pelayar secara manual. Sila ikuti langkah di bawah:
                </p>
                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3 text-[11px] font-bold text-rose-600 bg-white/40 p-3 rounded-xl border border-rose-200/50">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> 
                    <span>Klik butang <b>"BUKA API & TRUST"</b>. Jika keluar amaran SSL, klik <b>Advanced</b> & <b>Proceed to kastam.kesug.com</b>.</span>
                  </div>
                  <div className="flex items-start gap-3 text-[11px] font-bold text-rose-600 bg-white/40 p-3 rounded-xl border border-rose-200/50">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> 
                    <span>Setelah melihat mesej <b>"API is Active"</b>, tutup tab tersebut dan kembali ke sini untuk menekan <b>REFRESH</b>.</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <button onClick={openDiagnostic} className="flex items-center justify-center gap-2 bg-white border-2 border-rose-200 text-rose-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all shadow-sm active:scale-95">
                  <ExternalLink className="w-4 h-4" /> Buka API & Trust
                </button>
                <button onClick={handleRetryConnection} className="bg-rose-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/30 active:scale-95">
                  Refresh Sambungan
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-end mb-10">
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
            {activeTab} <br/> <span className="text-indigo-600">Intelligence</span>
          </h1>
          <button onClick={() => setIsIntelligenceOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 transition-all active:scale-95">
            <Sparkles className="w-4 h-4" /> AI Insights
          </button>
        </div>

        {/* Fix: Implement conditional rendering for all dashboard views */}
        {activeTab === DashboardTab.RINGKASAN && <SummaryView />}
        {activeTab === DashboardTab.KENDERAAN && <VehicleListView onSelectLot={(lot) => { setSelectedLot(lot); setActiveTab(DashboardTab.REKOD_DETAIL); }} onAddNew={() => setActiveTab(DashboardTab.TAMBAH_KENDERAAN)} />}
        {activeTab === DashboardTab.REKOD_DETAIL && selectedLot && <VehicleDetailView lot={selectedLot} onBack={() => setActiveTab(DashboardTab.KENDERAAN)} />}
        {activeTab === DashboardTab.TAMBAH_KENDERAAN && <AddVehicleView onBack={() => setActiveTab(DashboardTab.KENDERAAN)} />}
        {activeTab === DashboardTab.INSIGHTS && <InsightsView />}
        {activeTab === DashboardTab.AGING && <AgingAnalysisView />}
        {activeTab === DashboardTab.SYARIKAT && <CompanyListView />}
        {activeTab === DashboardTab.ANALISA && <ReportGenerationView />}
        {activeTab === DashboardTab.ADMIN && <AdminView whitelist={whitelist} onAdd={handleAddToWhitelist} onRemove={handleRemoveFromWhitelist} />}
      </main>

      <IntelligenceModal isOpen={isIntelligenceOpen} onClose={() => setIsIntelligenceOpen(false)} />
    </div>
  );
};

export default App;
