const BASE_URL = 'https://kliacustoms.net/api.php';

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
  getVehicles: async () => fetchWithFallback('get_vehicles', []),
  getDominanceData: async () => fetchWithFallback('get_dominance_data', []),
  getActivityLog: async () => fetchWithFallback('get_activity_log', []),
  getAgingData: async () => fetchWithFallback('get_aging_data', { summary: [], records: [] }),
  getTaxAnalysis: async () => fetchWithFallback('get_tax_analysis', []),
  getWhitelist: async () => fetchWithFallback('get_whitelist', []),
  addToWhitelist: async (email: string) => fetchWithFallback(`add_to_whitelist&email=${encodeURIComponent(email)}`, { status: 'success' }),
  removeFromWhitelist: async (email: string) => fetchWithFallback(`remove_from_whitelist&email=${encodeURIComponent(email)}`, { status: 'success' }),
  debugDB: async () => fetchWithFallback('debug_database', { status: 'error', message: 'Tidak dapat menghubungi API' }),
  setupDB: async () => fetchWithFallback('setup_database', { status: 'error', message: 'Tidak dapat menghubungi API' }),
};