/**
 * Local AI Service - No External API Required
 * Provides fuzzy search, anomaly detection, forecasting, and smart categorization
 */

// Fuzzy search implementation
export const fuzzySearch = (query: string, items: any[], fields: string[]): any[] => {
  if (!query.trim()) return items;
  
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return items.filter(item => {
    return fields.some(field => {
      const value = String(item[field] || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      // Check for substring match
      if (value.includes(q)) return true;
      // Check for fuzzy match (allow 1-2 character errors)
      return fuzzyMatch(value, q);
    });
  });
};

// Simple fuzzy matching algorithm
const fuzzyMatch = (text: string, query: string): boolean => {
  if (query.length === 0) return true;
  if (text.length === 0) return false;
  
  let textIdx = 0;
  let queryIdx = 0;
  let errors = 0;
  const maxErrors = Math.max(1, Math.floor(query.length * 0.3));
  
  while (textIdx < text.length && queryIdx < query.length) {
    if (text[textIdx] === query[queryIdx]) {
      queryIdx++;
    } else {
      errors++;
      if (errors > maxErrors) return false;
    }
    textIdx++;
  }
  
  return queryIdx === query.length;
};

// Calculate days in warehouse
export const calculateAgingDays = (dateString: string | null): number => {
  if (!dateString) return 0;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 0;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

// Anomaly detection engine
export const detectAnomalies = (vehicles: any[], companies: any[]): AnomalyResult => {
  const anomalies: AnomalyItem[] = [];
  const now = new Date();
  
  // 1. Critical aging (>90 days)
  const aging90 = vehicles.filter(v => {
    const days = calculateAgingDays(v.tarikh_msuk);
    return days > 90;
  });
  
  aging90.forEach(v => {
    anomalies.push({
      type: 'critical_aging',
      severity: 'critical',
      title: 'Penuaian Kritikal',
      message: `${v.lot_number} telah disimpan ${calculateAgingDays(v.tarikh_msuk)} hari`,
      lot: v.lot_number,
      company: v.company,
      data: v
    });
  });
  
  // 2. AP expiring within 7 days
  const criticalAP = vehicles.filter(v => {
    if (!v.tarikh_luput) return false;
    try {
      const luput = new Date(v.tarikh_luput);
      const diff = luput.getTime() - now.getTime();
      const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
      return daysLeft >= 0 && daysLeft <= 7;
    } catch {
      return false;
    }
  });
  
  criticalAP.forEach(v => {
    anomalies.push({
      type: 'ap_expiring',
      severity: 'critical',
      title: 'AP Akan Luput',
      message: `AP ${v.ap} akan luput dalam 7 hari`,
      lot: v.lot_number,
      company: v.company,
      data: v
    });
  });
  
  // 3. AP expiring within 30 days (warning)
  const warningAP = vehicles.filter(v => {
    if (!v.tarikh_luput || criticalAP.includes(v)) return false;
    try {
      const luput = new Date(v.tarikh_luput);
      const diff = luput.getTime() - now.getTime();
      const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
      return daysLeft > 7 && daysLeft <= 30;
    } catch {
      return false;
    }
  });
  
  warningAP.forEach(v => {
    anomalies.push({
      type: 'ap_warning',
      severity: 'warning',
      title: 'Amaran AP',
      message: `AP ${v.ap} akan luput dalam 30 hari`,
      lot: v.lot_number,
      company: v.company,
      data: v
    });
  });
  
  // 4. Duplicate lot numbers
  const lotCounts: Record<string, number> = {};
  vehicles.forEach(v => {
    if (v.lot_number) {
      lotCounts[v.lot_number] = (lotCounts[v.lot_number] || 0) + 1;
    }
  });
  
  Object.entries(lotCounts).forEach(([lot, count]) => {
    if (count > 1) {
      anomalies.push({
        type: 'duplicate_lot',
        severity: 'warning',
        title: 'Nombor Lot Pendua',
        message: `Nombor lot ${lot} muncul ${count} kali`,
        lot: lot,
        data: { count }
      });
    }
  });
  
  // 5. Companies with high tax but few vehicles (unusual pattern)
  const companyStats: Record<string, { vehicles: number; tax: number }> = {};
  vehicles.forEach(v => {
    const comp = v.company || 'Unknown';
    if (!companyStats[comp]) {
      companyStats[comp] = { vehicles: 0, tax: 0 };
    }
    companyStats[comp].vehicles++;
    companyStats[comp].tax += Number(v.jumlah_cukai) || 0;
  });
  
  Object.entries(companyStats).forEach(([company, stats]) => {
    if (stats.vehicles < 5 && stats.tax > 100000) {
      anomalies.push({
        type: 'unusual_pattern',
        severity: 'info',
        title: 'Corak Tidak Biasa',
        message: `${company}: cukai tinggi (RM${stats.tax.toLocaleString()}) tetapi hanya ${stats.vehicles} kenderaan`,
        company,
        data: stats
      });
    }
  });
  
  return {
    total: anomalies.length,
    critical: anomalies.filter(a => a.severity === 'critical').length,
    warning: anomalies.filter(a => a.severity === 'warning').length,
    info: anomalies.filter(a => a.severity === 'info').length,
    items: anomalies
  };
};

// Simple linear regression for forecasting
export const forecastNextMonth = (monthlyData: { month: string; count: number }[]): number => {
  if (monthlyData.length < 2) return 0;
  
  const n = monthlyData.length;
  const xs = monthlyData.map((_, i) => i);
  const ys = monthlyData.map(d => d.count);
  
  // Calculate means
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  
  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (xs[i] - xMean) * (ys[i] - yMean);
    denominator += (xs[i] - xMean) ** 2;
  }
  
  if (denominator === 0) return yMean;
  
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  
  // Forecast next month (x = n)
  const forecast = slope * n + intercept;
  return Math.max(0, Math.round(forecast));
};

// Auto-categorize vehicles
export const categorizeVehicle = (vehicle: any): VehicleCategory => {
  const category: VehicleCategory = {
    agingStatus: 'unknown',
    riskScore: 0,
    tags: []
  };
  
  // Age categorization
  const days = calculateAgingDays(vehicle.tarikh_msuk);
  if (days > 90) {
    category.agingStatus = 'critical';
    category.riskScore += 50;
    category.tags.push('critical_aging');
  } else if (days > 60) {
    category.agingStatus = 'warning';
    category.riskScore += 30;
    category.tags.push('aging_warning');
  } else if (days > 30) {
    category.agingStatus = 'monitor';
    category.riskScore += 10;
    category.tags.push('aging_monitor');
  } else {
    category.agingStatus = 'safe';
    category.tags.push('aging_safe');
  }
  
  // AP expiration check
  if (vehicle.tarikh_luput) {
    try {
      const luput = new Date(vehicle.tarikh_luput);
      const now = new Date();
      const daysLeft = Math.floor((luput.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 0) {
        category.agingStatus = 'critical';
        category.riskScore += 50;
        category.tags.push('ap_expired');
      } else if (daysLeft <= 7) {
        category.riskScore += 40;
        category.tags.push('ap_critical');
      } else if (daysLeft <= 30) {
        category.riskScore += 20;
        category.tags.push('ap_warning');
      }
    } catch {
      // Ignore invalid dates
    }
  }
  
  // Brand/model tagging
  if (vehicle.model) {
    const model = String(vehicle.model).toLowerCase();
    if (model.includes('toyota') || model.includes('honda') || model.includes('nissan')) {
      category.tags.push('japanese');
    } else if (model.includes('bmw') || model.includes('mercedes') || model.includes('audi')) {
      category.tags.push('european');
    } else if (model.includes('proton') || model.includes('perodua')) {
      category.tags.push('local');
    }
  }
  
  // Condition tagging
  if (vehicle.keadaan) {
    const keadaan = String(vehicle.keadaan).toLowerCase();
    if (keadaan.includes('new')) {
      category.tags.push('new_vehicle');
    } else if (keadaan.includes('used')) {
      category.tags.push('used_vehicle');
    }
  }
  
  return category;
};

// Generate local AI insights (rule-based)
export const generateLocalInsights = (vehicles: any[], stats: any): LocalInsight[] => {
  const insights: LocalInsight[] = [];
  
  // Calculate averages
  const agingDays = vehicles.map(v => calculateAgingDays(v.tarikh_msuk)).filter(d => d > 0);
  const avgAging = agingDays.length > 0 
    ? agingDays.reduce((a, b) => a + b, 0) / agingDays.length 
    : 0;
  
  // Insight 1: Aging analysis
  const aging90Count = agingDays.filter(d => d > 90).length;
  if (aging90Count > 0) {
    insights.push({
      type: 'aging',
      priority: aging90Count > 10 ? 'high' : 'medium',
      title: 'Penuaian Gudang',
      message: `${aging90Count} kenderaan disimpan lebih dari 90 hari. Purata: ${Math.round(avgAging)} hari.`,
      action: 'Semak senarai dan hubungi syarikat berkenaan.',
      icon: 'clock'
    });
  }
  
  // Insight 2: Tax collection
  if (stats?.total_tax > 0) {
    const avgTax = stats.total_tax / (stats.total_vehicles || 1);
    insights.push({
      type: 'tax',
      priority: 'medium',
      title: 'Kutipan Cukai',
      message: `Jumlah terkumpul: RM${stats.total_tax.toLocaleString()}. Purata: RM${Math.round(avgTax).toLocaleString()} per unit.`,
      action: 'Sasaran kutipan bulan hadapan.',
      icon: 'coins'
    });
  }
  
  // Insight 3: Top companies
  if (stats?.top_companies?.length > 0) {
    const top = stats.top_companies[0];
    insights.push({
      type: 'company',
      priority: 'low',
      title: 'Penyumbang Utama',
      message: `${top.company} dengan ${top.count} kenderaan (RM${top.total_tax?.toLocaleString()}).`,
      action: 'Hubungi untuk kerjasama strategik.',
      icon: 'building'
    });
  }
  
  // Insight 4: Monthly trend
  if (stats?.monthly_trend?.length >= 3) {
    const recent = stats.monthly_trend.slice(-3);
    const trend = recent[2].count - recent[0].count;
    const direction = trend > 0 ? 'meningkat' : 'menurun';
    insights.push({
      type: 'trend',
      priority: 'low',
      title: 'Trend Import',
      message: `Import bulan ini ${direction} ${Math.abs(trend)} unit berbanding 3 bulan lalu.`,
      action: 'Analisa faktor perubahan.',
      icon: 'trending'
    });
  }
  
  return insights;
};

// Types
export interface AnomalyResult {
  total: number;
  critical: number;
  warning: number;
  info: number;
  items: AnomalyItem[];
}

export interface AnomalyItem {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  lot?: string;
  company?: string;
  data?: any;
}

export interface VehicleCategory {
  agingStatus: string;
  riskScore: number;
  tags: string[];
}

export interface LocalInsight {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action: string;
  icon: string;
}