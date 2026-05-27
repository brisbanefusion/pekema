import { 
  fuzzySearch, 
  detectAnomalies, 
  forecastNextMonth, 
  categorizeVehicle, 
  generateLocalInsights,
  type AnomalyResult,
  type VehicleCategory,
  type LocalInsight 
} from './localAIService';

const BASE_URL = 'https://kliacustoms.net/pekema-my/api.php';

// Local cache for vehicles (used for local AI processing)
let cachedVehicles: any[] = [];
let cachedStats: any = null;

export const apiStatus = {
  isLive: false,
  lastError: null as string | null,
  isChecking: false,
  useSimulatedData: false,
  activeYear: '2026'
};

const fetchWithFallback = async (action: string, fallback: any) => {
  if (apiStatus.useSimulatedData) return fallback;

  let url = `${BASE_URL}?action=${action}&_t=${Date.now()}`;
  if (apiStatus.activeYear !== 'Semua' && apiStatus.activeYear) {
    url += `&year=${apiStatus.activeYear}`;
  }

  apiStatus.isChecking = true;

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000); // 8 saat timeout

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      signal: controller.signal
    });

    clearTimeout(id);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    apiStatus.isLive = true;
    apiStatus.lastError = null;
    return data;
  } catch (error: any) {
    let msg = error.message;
    // Detect SSL/CORS/Antibot issues
    if (msg.includes('fetch') || msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('aborted')) {
      msg = "Sambungan Disekat (SSL/CORS/Antibot). Sila sahkan (Trust) API anda.";
    }

    apiStatus.isLive = false;
    apiStatus.lastError = msg;
    console.error("API Error [action=" + action + "]:", msg);
    return fallback;
  } finally {
    apiStatus.isChecking = false;
  }
};

export const apiService = {
  setMode: (simulated: boolean) => { apiStatus.useSimulatedData = simulated; },
  setYear: (year: string) => { apiStatus.activeYear = year; },
  getApiUrl: () => BASE_URL,
  ping: async () => fetchWithFallback('ping', { status: 'offline' }),
  getSummaryStats: async () => fetchWithFallback('get_summary_stats', { totalVehicles: "...", taxAmount: "..." }),
  getVehicles: async () => fetchWithFallback('get_vehicles', [
    { lot: 'LOT-A1', company: 'WAF SINAR AUTO SDN BHD', chassis: 'TRH200-0192837', color: 'WHITE', date: '10/01/2026', model: 'TOYOTA HIACE', ap: 'AP-KASTAM-1001', raw_date: '2026-01-10', expiry_date: '2026-06-10' },
    { lot: 'LOT-A2', company: 'WAX RAZIMOTO SDN BHD', chassis: 'AGH30-0293847', color: 'BLACK', date: '12/01/2026', model: 'TOYOTA ALPHARD', ap: 'AP-KASTAM-1002', raw_date: '2026-01-12', expiry_date: '2026-06-12' },
    { lot: 'LOT-A3', company: 'WAP ECW MOTORSPORTS SDN BHD', chassis: 'ZSG10-0092837', color: 'PEARL', date: '15/01/2026', model: 'TOYOTA VOXY', ap: 'AP-KASTAM-1003', raw_date: '2026-01-15', expiry_date: '2026-06-15' },
    { lot: 'LOT-A4', company: 'WAQ BUMI MUHIBAH MOTORS SDN BHD', chassis: 'MCU30-0019283', color: 'SILVER', date: '18/01/2026', model: 'TOYOTA HARRIER', ap: 'AP-KASTAM-1004', raw_date: '2025-10-18', expiry_date: '2026-04-18' },
    { lot: 'LOT-A5', company: 'WAR TUNETECH VOITURE SDN BHD', chassis: 'FK8-1203928', color: 'RED', date: '20/01/2026', model: 'HONDA CIVIC TYPE R', ap: 'AP-KASTAM-1005', raw_date: '2026-01-20', expiry_date: '2026-07-20' },
    { lot: 'LOT-A6', company: 'WAS SUPREME RADIUS SDN BHD', chassis: 'VJA300-0192837', color: 'GREY', date: '22/01/2026', model: 'TOYOTA LAND CRUISER', ap: 'AP-KASTAM-1006', raw_date: '2026-01-22', expiry_date: '2026-07-22' },
    { lot: 'LOT-A7', company: 'WBP NIEZAK CONSUPSER SDN BHD', chassis: 'RP3-1029384', color: 'BLUE', date: '25/01/2026', model: 'HONDA STEPWGN', ap: 'AP-KASTAM-1007', raw_date: '2025-09-25', expiry_date: '2026-03-25' }
  ]),
  getDominanceData: async () => fetchWithFallback('get_dominance_data', []),
  getActivityLog: async () => fetchWithFallback('get_activity_log', []),
  getAgingData: async () => fetchWithFallback('get_aging_data', { summary: [], records: [] }),
  getTaxAnalysis: async () => fetchWithFallback('get_tax_analysis', []),
  getNetworkAnalysis: async () => fetchWithFallback('get_network_analysis', { nodes: [], links: [] }),
  getSmartAnalysis: async () => fetchWithFallback('get_smart_analysis', {
    aging: { avg_days: 45, over_90_days: 12 },
    ap: { critical_count: 3, warnings: [] },
    tax: { total: 0, average: 0, max: 0, top_company: '-', top_company_tax: 0 }
  }),
  getWhitelist: async () => fetchWithFallback('get_whitelist', []),
  addToWhitelist: async (email: string) => fetchWithFallback(`add_to_whitelist&email=${encodeURIComponent(email)}`, { status: 'success' }),
  removeFromWhitelist: async (email: string) => fetchWithFallback(`remove_from_whitelist&email=${encodeURIComponent(email)}`, { status: 'success' }),
  getCompanies: async () => fetchWithFallback('get_companies', [
    { name: 'WAF SINAR AUTO SDN BHD', address: 'o 6 Jalan P16, Seksyen 10, Taman Perindustrian Selam', pic: 'HAMDAN BIN ARIS', phone: '0133102015', vehicle_count: 42 },
    { name: 'WAX RAZIMOTO SDN BHD', address: 'E-G-5 & 63 LOT PARKIR (372-386,409-438,745-756 &', pic: 'HAMDAN BIN ARIS', phone: '0133102015', vehicle_count: 95 },
    { name: 'WAP ECW MOTORSPORTS SDN BHD', address: 'NO.31, JALAN P/21, SEKSYEN 10, TAMAN PERINDUSTR', pic: 'NORSUHANIS BINTI MUHAMAD SALLEH', phone: '0192614229', vehicle_count: 58 },
    { name: 'WAQ BUMI MUHIBAH MOTORS SDN BHD', address: 'NO 20 JALAN P10/16 SEKSYEN 10 TAMAN PERINDUST', pic: 'MUHAMAD FARID BIN MOHAMAD ZIN', phone: '01127174389', vehicle_count: 24 },
    { name: 'WAR TUNETECH VOITURE SDN BHD', address: 'Lot 58996 - A, Jalan Haji Abdul Wahid, Kampung Sun', pic: 'MUHAMMAD HAFIS BIN MUHAMMAD', phone: '0104558346', vehicle_count: 15 },
    { name: 'WAS SUPREME RADIUS SDN BHD', address: 'LOT 58996-B, JALAN HAJI ABDUL WAHID, KG SUNGA', pic: 'FATEN SYAHERA BINTI BAHARUDIN', phone: '0102468510', vehicle_count: 12 },
    { name: 'WAV MOSCORP SDN BHD', address: 'Jalan P16, Seksyen 10, Taman Perindustrian Selam', pic: 'HAMDAN BIN ARIS', phone: '0133102015', vehicle_count: 120 },
    { name: 'WAY ADK GLOBAL SDN BHD', address: 'LOT R-G-11,R-1-11,R-G-12,R-1-12,NO.66 BELL AVENUE', pic: 'HAMIZAH BINTI YA\'AKOB', phone: '0177461402', vehicle_count: 18 },
    { name: 'WAZ IMMONAAZ SDN BHD', address: 'Autoville, Jalan, No. 12A, Jalan Autoville 2, Persiaran M', pic: 'MUHAMMAD HAFIS BIN MUHAMMAD', phone: '0104558346', vehicle_count: 38 },
    { name: 'WBP NIEZAK CONSUPSER SDN BHD', address: 'LOT 30/2, PEKAN CHERAS BATU 11, 43200 CHERAS, S', pic: 'FATEN SYAHERA BINTI BAHARUDIN', phone: '0102468510', vehicle_count: 325 }
  ]),
  verifyLogin: async (email: string) => fetchWithFallback(`verify_login&email=${encodeURIComponent(email)}`, { status: 'error', allowed: false, message: 'Ralat sambungan API' }),
  debugDB: async () => fetchWithFallback('debug_database', { status: 'error', message: 'Tidak dapat menghubungi API' }),
  setupDB: async () => fetchWithFallback('setup_database', { status: 'error', message: 'Tidak dapat menghubungi API' }),
  getAuditLogs: async () => fetchWithFallback('get_audit_logs', [
    { id: 1, email: 'afandi.amin@customs.gov.my', action: 'Log Masuk', details: 'Pengguna Superadmin berjaya melepasi whitelist dan log masuk.', time: '27/05/2026 09:00:00' },
    { id: 2, email: 'afandi.amin@customs.gov.my', action: 'Tambah Whitelist', details: 'Menambah emel test@pekema.com ke dalam senarai whitelist.', time: '27/05/2026 09:05:00' }
  ]),
  sendWarning: async (ap: string, company: string) => fetchWithFallback(`send_warning&ap=${encodeURIComponent(ap)}&company=${encodeURIComponent(company)}`, { status: 'success', message: 'Amaran simulasi dihantar' }),
  emailReport: async (company: string) => fetchWithFallback(`email_report&company=${encodeURIComponent(company)}`, { status: 'success', message: 'E-mel laporan dihantar' }),

  // Local AI Methods (No External API Required)
  // ========================================
  
  // Search vehicles with fuzzy matching
  searchVehicles: (query: string, vehicles?: any[]) => {
    const searchIn = vehicles || cachedVehicles;
    return fuzzySearch(query, searchIn, ['lot_number', 'company', 'chassis', 'model', 'ap']);
  },
  
  // Update local cache for AI processing
  updateLocalCache: (vehicles: any[], stats: any) => {
    cachedVehicles = vehicles;
    cachedStats = stats;
  },
  
  // Get anomaly detection results
  getAnomalyDetection: (): AnomalyResult => {
    return detectAnomalies(cachedVehicles, []);
  },
  
  // Get forecast for next month
  getForecast: () => {
    if (!cachedStats?.monthly_trend) return 0;
    return forecastNextMonth(cachedStats.monthly_trend);
  },
  
  // Categorize a single vehicle
  categorizeVehicle: (vehicle: any): VehicleCategory => {
    return categorizeVehicle(vehicle);
  },
  
  // Get local AI insights
  getLocalInsights: (): LocalInsight[] => {
    return generateLocalInsights(cachedVehicles, cachedStats);
  },
  
  // Export data to CSV
  exportToCSV: (vehicles: any[], filename: string = 'mypekema_export') => {
    if (!vehicles || vehicles.length === 0) return null;
    
    const headers = Object.keys(vehicles[0]);
    const csvRows = [
      headers.join(','),
      ...vehicles.map(v => headers.map(h => {
        const val = String(v[h] || '');
        // Escape quotes and wrap in quotes if contains comma
        return val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(','))
    ];
    
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    return url;
  },
  
  // Export data to JSON
  exportToJSON: (data: any, filename: string = 'mypekema_export') => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    return url;
  }
};