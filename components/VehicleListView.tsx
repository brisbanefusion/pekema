import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Loader2, Printer, Download, SlidersHorizontal, X, Camera, Brain, FileJson, Filter } from 'lucide-react';
// Fix: Added missing apiService import path verification
import { apiService } from '../services/apiService.ts';

interface Props {
  onSelectLot: (lot: string) => void;
  onAddNew: () => void;
  globalFilters?: { type: 'aging_90' | 'ap_warning' | null } | null;
  onClearFilters?: () => void;
}

export const VehicleListView: React.FC<Props> = ({ onSelectLot, onAddNew, globalFilters, onClearFilters }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Basic filters
  const [selectedCompany, setSelectedCompany] = useState('Semua Syarikat');
  const [searchQuery, setSearchQuery] = useState('');

  // Advanced filters toggle
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Advanced filters state
  const [chassisFilter, setChassisFilter] = useState('');
  const [lotFilter, setLotFilter] = useState('');
  const [apFilter, setApFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Scanner States & Refs
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'detected' | 'error'>('idle');
  const [detectedChassis, setDetectedChassis] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Local AI Search Toggle
  const [useFuzzySearch, setUseFuzzySearch] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await apiService.getVehicles();
      setVehicles(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Camera control methods
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access failed, using simulated video stream", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleStartScan = () => {
    setScanStatus('scanning');
    setDetectedChassis('Menghidupkan Pengimbas...');
    
    // Pick a random chassis from loaded vehicles
    let targetChassis = 'TRH200-0192837';
    if (vehicles.length > 0) {
      const valid = vehicles.filter(v => v.chassis);
      if (valid.length > 0) {
        const rand = valid[Math.floor(Math.random() * valid.length)];
        targetChassis = rand.chassis;
      }
    }

    setTimeout(() => {
      setDetectedChassis('Mengimbas Nombor Casis...');
      setTimeout(() => {
        setDetectedChassis(`Casis dikesan: ${targetChassis}`);
        setScanStatus('detected');
        setTimeout(() => {
          setSearchQuery(targetChassis);
          stopCamera();
          setIsScannerOpen(false);
          setScanStatus('idle');
        }, 1200);
      }, 1500);
    }, 1000);
  };

  // Extract unique companies from data
  const uniqueCompanies = Array.from(new Set(vehicles.map(v => v.company).filter(Boolean)));

  // Update local cache for AI processing
  useEffect(() => {
    if (vehicles.length > 0) {
      apiService.updateLocalCache(vehicles, { total_vehicles: vehicles.length });
    }
  }, [vehicles]);

  // Filter vehicles with fuzzy search support
  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    // Apply company filter
    if (selectedCompany !== 'Semua Syarikat') {
      result = result.filter(v => v.company === selectedCompany);
    }

    // Apply global filters from Insights
    if (globalFilters) {
      if (globalFilters.type === 'aging_90') {
        result = result.filter(v => {
          if (!v.raw_date) return false;
          const bondIn = new Date(v.raw_date);
          const today = new Date();
          const diffDays = Math.ceil((today.getTime() - bondIn.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays > 90;
        });
      }
      if (globalFilters.type === 'ap_warning') {
        result = result.filter(v => {
          if (!v.expiry_date) return false;
          const expiry = new Date(v.expiry_date);
          const today = new Date();
          const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 30;
        });
      }
    }

    // Apply keyword search (with fuzzy matching)
    if (searchQuery) {
      if (useFuzzySearch) {
        // Use local AI fuzzy search
        result = apiService.searchVehicles(searchQuery, result);
      } else {
        // Basic substring match
        const q = searchQuery.toLowerCase();
        result = result.filter(v =>
          (v.lot || '').toLowerCase().includes(q) ||
          (v.chassis || '').toLowerCase().includes(q) ||
          (v.company || '').toLowerCase().includes(q) ||
          (v.color || '').toLowerCase().includes(q) ||
          (v.model || '').toLowerCase().includes(q) ||
          (v.ap || '').toLowerCase().includes(q)
        );
      }
    }

    // Apply advanced filters
    if (showAdvanced) {
      if (chassisFilter) {
        const cf = chassisFilter.toLowerCase();
        result = result.filter(v => (v.chassis || '').toLowerCase().includes(cf));
      }
      if (lotFilter) {
        const lf = lotFilter.toLowerCase();
        result = result.filter(v => (v.lot || '').toLowerCase().includes(lf));
      }
      if (apFilter) {
        const af = apFilter.toLowerCase();
        result = result.filter(v => (v.ap || '').toLowerCase().includes(af));
      }
      if (startDate || endDate) {
        result = result.filter(v => {
          if (!v.raw_date) return false;
          const vDate = new Date(v.raw_date);
          if (startDate && vDate < new Date(startDate)) return false;
          if (endDate && vDate > new Date(endDate)) return false;
          return true;
        });
      }
    }

    return result;
  }, [vehicles, selectedCompany, searchQuery, globalFilters, showAdvanced, chassisFilter, lotFilter, apFilter, startDate, endDate, useFuzzySearch]);

  // Export functions using local AI service
  const exportToCSV = () => {
    apiService.exportToCSV(filteredVehicles, 'mypekema_vehicles');
  };

  const exportToJSON = () => {
    apiService.exportToJSON(filteredVehicles, 'mypekema_vehicles');
  };

  // Run local anomaly detection
  const runAnomalyCheck = () => {
    const anomalies = apiService.getAnomalyDetection();
    alert(`Anomaly Detection Results:\n\nCritical: ${anomalies.critical}\nWarning: ${anomalies.warning}\nInfo: ${anomalies.info}\n\nTotal Issues: ${anomalies.total}`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Inject Scanner CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes laser-sweep {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .laser-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #10b981;
          box-shadow: 0 0 8px #10b981, 0 0 15px #10b981;
          animation: laser-sweep 2.5s infinite linear;
        }
      `}} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1e3a8a]">Senarai Kenderaan</h1>
          <p className="text-sm text-blue-500 font-medium">Paparan rekod inventori kenderaan terkini dari database.</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all"
          >
            <Download className="w-4 h-4" /> Eksport CSV
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all"
          >
            <FileJson className="w-4 h-4" /> Eksport JSON
          </button>
          <button
            onClick={runAnomalyCheck}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all"
          >
            <Brain className="w-4 h-4" /> AI Anomali
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-200 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak
          </button>
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 bg-[#2563eb] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Kenderaan
          </button>
        </div>
      </div>

      {/* Global Filter Alert */}
      {globalFilters && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-xs font-bold text-indigo-800">
              Menunjukkan kenderaan yang ditapis dari Analisa Pintar: {' '}
              {globalFilters.type === 'aging_90' ? 'Risiko Gudang > 90 Hari' : 'Amaran AP Luput < 30 Hari'}
            </span>
          </div>
          <button 
            onClick={onClearFilters}
            className="text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Kosongkan Penapis
          </button>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tapis ikut Syarikat</label>
            <select 
              value={selectedCompany} 
              onChange={(e) => setSelectedCompany(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Semua Syarikat">Semua Syarikat</option>
              {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-6">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Carian Kata Kunci</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Lot, No. Casis, No. AP, Warna..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-12 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={() => { setIsScannerOpen(true); startCamera(); handleStartScan(); }}
                className="absolute right-10 top-1/2 -translate-y-1/2 p-2 hover:bg-indigo-50 rounded-md text-slate-400 hover:text-indigo-600 transition-all"
                title="Imbas Nombor Casis Kamera"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setUseFuzzySearch(!useFuzzySearch)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all ${useFuzzySearch ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-slate-500'}`}
                title={useFuzzySearch ? "Carian Pintar AI Aktif" : "Carian Biasa"}
              >
                <Brain className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-bold text-sm transition-all ${showAdvanced ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
            >
              <SlidersHorizontal className="w-4 h-4" /> 
              {showAdvanced ? 'Tutup Filter' : 'Filter Lanjutan'}
            </button>
          </div>
        </div>

        {/* Slide down Advanced Filters */}
        {showAdvanced && (
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-300">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">No. Casis</label>
              <input
                type="text"
                value={chassisFilter}
                onChange={(e) => setChassisFilter(e.target.value)}
                placeholder="Cari chassis..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">No. Lot</label>
              <input
                type="text"
                value={lotFilter}
                onChange={(e) => setLotFilter(e.target.value)}
                placeholder="Cari lot..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">No. AP</label>
              <input
                type="text"
                value={apFilter}
                onChange={(e) => setApFilter(e.target.value)}
                placeholder="Cari AP..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Julat Tarikh Masuk</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none"
                />
                <span className="text-slate-300 text-xs">ke</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] print:min-h-0 print:border-none print:shadow-none print:overflow-visible flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Menghubungi Database...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#eff6ff]">
                    <th className="px-6 py-4 text-[11px] font-black text-[#1e40af] uppercase tracking-wider">No. Lot</th>
                    <th className="px-6 py-4 text-[11px] font-black text-[#1e40af] uppercase tracking-wider">Syarikat GB/PEKEMA</th>
                    <th className="px-6 py-4 text-[11px] font-black text-[#1e40af] uppercase tracking-wider">No. Casis</th>
                    <th className="px-6 py-4 text-[11px] font-black text-[#1e40af] uppercase tracking-wider">Warna</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((v, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                        <td className="px-6 py-4 text-xs font-bold text-blue-600 underline underline-offset-2">
                          <button onClick={() => onSelectLot(v.lot)} className="hover:text-blue-800 transition-colors">
                            {v.lot}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">{v.company}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{v.chassis}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">{v.color}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                        Tiada kenderaan padan dengan penapisan anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Section */}
            <div className="px-6 py-6 border-t border-slate-50 mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <p className="text-xs text-slate-500 font-medium">
                Menunjukkan <span className="font-bold text-slate-900">{filteredVehicles.length}</span> daripada <span className="font-bold text-slate-900">{vehicles.length}</span> rekod aktif
              </p>
              <div className="flex items-center gap-1.5">
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg text-xs font-bold">1</button>
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Camera OCR Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 max-w-md w-full animate-in zoom-in text-white relative">
            <button 
              onClick={() => { stopCamera(); setIsScannerOpen(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-indigo-300">Pengimbas Casis Pintar</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Arahkan kamera ke arah kod Casis kenderaan</p>
            </div>
            
            {/* Camera Viewport */}
            <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center mb-6">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Mock camera visual overlay when camera stream is not live */}
              {!streamRef.current && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-500 p-4 text-center">
                  <div className="w-12 h-12 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center animate-spin mb-3">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kamera Mengisi Strim...</span>
                  <span className="text-[9px] text-slate-600 mt-1 font-medium">Strim video simulasi OCR sedang bersiap sedia</span>
                </div>
              )}

              {/* Scanning Laser HUD */}
              <div className="absolute inset-6 border border-emerald-500/30 rounded-lg pointer-events-none">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500"></div>
                
                {/* Glowing laser line sweep */}
                <div className="laser-line"></div>
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Status OCR</span>
              <p className="text-xs font-bold text-slate-200">
                {scanStatus === 'scanning' ? 'Menganalisis bingkai Casis...' : scanStatus === 'detected' ? 'Casis Berjaya Dicam!' : 'Sedia untuk mengimbas'}
              </p>
              {detectedChassis && (
                <div className="inline-flex bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                  {detectedChassis}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => { stopCamera(); setIsScannerOpen(false); }}
                className="flex-1 py-3 border border-white/10 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Batal
              </button>
              <button 
                onClick={handleStartScan}
                disabled={scanStatus === 'scanning'}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20"
              >
                Imbas Semula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
