import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  fuzzySearch, 
  calculateAgingDays, 
  detectAnomalies, 
  forecastNextMonth, 
  categorizeVehicle, 
  generateLocalInsights 
} from './localAIService';

describe('localAIService', () => {
  describe('fuzzySearch', () => {
    const items = [
      { id: 1, model: 'Toyota Camry', company: 'Syarikat A' },
      { id: 2, model: 'Honda Civic', company: 'Syarikat B' },
      { id: 3, model: 'Toyota Vios', company: 'Syarikat C' },
    ];

    it('should return all items if query is empty or whitespace', () => {
      expect(fuzzySearch('', items, ['model'])).toEqual(items);
      expect(fuzzySearch('   ', items, ['model'])).toEqual(items);
    });

    it('should perform exact substring match (case insensitive)', () => {
      const result = fuzzySearch('civic', items, ['model']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('should match multiple fields', () => {
      const result = fuzzySearch('Syarikat', items, ['company']);
      expect(result).toHaveLength(3);
    });

    it('should allow fuzzy matching with small character differences', () => {
      // "toyot" should match "Toyota" due to fuzzyMatch distance tolerance
      const result = fuzzySearch('toyot', items, ['model']);
      expect(result).toHaveLength(2);
      expect(result[0].model).toBe('Toyota Camry');
      expect(result[1].model).toBe('Toyota Vios');
    });
  });

  describe('calculateAgingDays', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Set fixed date to 2026-05-27
      vi.setSystemTime(new Date('2026-05-27T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return 0 if dateString is null or undefined', () => {
      expect(calculateAgingDays(null)).toBe(0);
    });

    it('should calculate the correct number of days for past date', () => {
      // 10 days before 2026-05-27 is 2026-05-17
      expect(calculateAgingDays('2026-05-17T12:00:00Z')).toBe(10);
    });

    it('should return 0 or negative days if date is in the future', () => {
      expect(calculateAgingDays('2026-05-28T12:00:00Z')).toBe(-1);
    });

    it('should return 0 for invalid date strings', () => {
      expect(calculateAgingDays('invalid-date')).toBe(0);
    });
  });

  describe('detectAnomalies', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-27T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should detect critical aging when vehicle exceeds 90 days in warehouse', () => {
      const vehicles = [
        { lot_number: 'LOT-1', company: 'Syarikat A', tarikh_msuk: '2026-01-01T12:00:00Z' } // ~146 days
      ];
      const result = detectAnomalies(vehicles, []);
      expect(result.critical).toBe(1);
      expect(result.items[0].type).toBe('critical_aging');
      expect(result.items[0].severity).toBe('critical');
    });

    it('should detect AP expiring within 7 days as critical, and 30 days as warning', () => {
      const vehicles = [
        { lot_number: 'LOT-1', ap: 'AP-100', tarikh_luput: '2026-05-30T12:00:00Z' }, // 3 days remaining (critical)
        { lot_number: 'LOT-2', ap: 'AP-200', tarikh_luput: '2026-06-15T12:00:00Z' }  // 19 days remaining (warning)
      ];
      const result = detectAnomalies(vehicles, []);
      expect(result.critical).toBe(1);
      expect(result.warning).toBe(1);
      
      const criticalAp = result.items.find(item => item.type === 'ap_expiring');
      const warningAp = result.items.find(item => item.type === 'ap_warning');
      expect(criticalAp?.severity).toBe('critical');
      expect(warningAp?.severity).toBe('warning');
    });

    it('should detect duplicate lot numbers', () => {
      const vehicles = [
        { lot_number: 'LOT-1', company: 'Syarikat A' },
        { lot_number: 'LOT-1', company: 'Syarikat B' }
      ];
      const result = detectAnomalies(vehicles, []);
      expect(result.warning).toBe(1);
      expect(result.items[0].type).toBe('duplicate_lot');
      expect(result.items[0].title).toBe('Nombor Lot Pendua');
    });

    it('should detect unusual tax patterns (low vehicle count but high tax)', () => {
      const vehicles = [
        { lot_number: 'LOT-1', company: 'Rich Company', jumlah_cukai: 60000 },
        { lot_number: 'LOT-2', company: 'Rich Company', jumlah_cukai: 50000 }
        // Total vehicles = 2 (< 5), Total tax = 110,000 (> 100,000)
      ];
      const result = detectAnomalies(vehicles, []);
      const anomaly = result.items.find(item => item.type === 'unusual_pattern');
      expect(anomaly).toBeDefined();
      expect(anomaly?.severity).toBe('info');
      expect(anomaly?.company).toBe('Rich Company');
    });
  });

  describe('forecastNextMonth', () => {
    it('should return 0 if monthly data has less than 2 data points', () => {
      expect(forecastNextMonth([])).toBe(0);
      expect(forecastNextMonth([{ month: '2026-01', count: 10 }])).toBe(0);
    });

    it('should accurately project linear upward trend', () => {
      const data = [
        { month: '2026-01', count: 10 },
        { month: '2026-02', count: 20 },
        { month: '2026-03', count: 30 }
      ];
      // Index: 0 -> 10, 1 -> 20, 2 -> 30. Expect index 3 -> 40
      expect(forecastNextMonth(data)).toBe(40);
    });

    it('should prevent negative forecasts by returning 0', () => {
      const data = [
        { month: '2026-01', count: 10 },
        { month: '2026-02', count: 4 }
      ];
      // Index: 0 -> 10, 1 -> 4. Expect index 2 -> -2 -> clamped to 0
      expect(forecastNextMonth(data)).toBe(0);
    });
  });

  describe('categorizeVehicle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-27T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should correctly set status and risk score based on aging', () => {
      const safeVehicle = { tarikh_msuk: '2026-05-20T12:00:00Z' }; // 7 days (safe)
      const monitorVehicle = { tarikh_msuk: '2026-04-20T12:00:00Z' }; // 37 days (monitor)
      const warningVehicle = { tarikh_msuk: '2026-03-20T12:00:00Z' }; // 68 days (warning)
      const criticalVehicle = { tarikh_msuk: '2026-02-10T12:00:00Z' }; // 106 days (critical)

      expect(categorizeVehicle(safeVehicle).agingStatus).toBe('safe');
      expect(categorizeVehicle(safeVehicle).riskScore).toBe(0);

      expect(categorizeVehicle(monitorVehicle).agingStatus).toBe('monitor');
      expect(categorizeVehicle(monitorVehicle).riskScore).toBe(10);

      expect(categorizeVehicle(warningVehicle).agingStatus).toBe('warning');
      expect(categorizeVehicle(warningVehicle).riskScore).toBe(30);

      expect(categorizeVehicle(criticalVehicle).agingStatus).toBe('critical');
      expect(categorizeVehicle(criticalVehicle).riskScore).toBe(50);
    });

    it('should tag by manufacturer/origin', () => {
      const v1 = { model: 'Toyota Vellfire' };
      const v2 = { model: 'BMW X5' };
      const v3 = { model: 'Proton Saga' };

      expect(categorizeVehicle(v1).tags).toContain('japanese');
      expect(categorizeVehicle(v2).tags).toContain('european');
      expect(categorizeVehicle(v3).tags).toContain('local');
    });

    it('should tag by condition', () => {
      const v1 = { keadaan: 'New' };
      const v2 = { keadaan: 'Used' };

      expect(categorizeVehicle(v1).tags).toContain('new_vehicle');
      expect(categorizeVehicle(v2).tags).toContain('used_vehicle');
    });
  });

  describe('generateLocalInsights', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-27T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate aging insight if there are vehicles older than 90 days', () => {
      const vehicles = [
        { tarikh_msuk: '2026-01-01T12:00:00Z' }
      ];
      const stats = { total_vehicles: 1 };
      const insights = generateLocalInsights(vehicles, stats);
      const agingInsight = insights.find(i => i.type === 'aging');
      expect(agingInsight).toBeDefined();
      expect(agingInsight?.priority).toBe('medium');
      expect(agingInsight?.icon).toBe('clock');
    });

    it('should generate tax insight if total tax is greater than 0', () => {
      const vehicles = [];
      const stats = { total_tax: 250000, total_vehicles: 10 };
      const insights = generateLocalInsights(vehicles, stats);
      const taxInsight = insights.find(i => i.type === 'tax');
      expect(taxInsight).toBeDefined();
      expect(taxInsight?.icon).toBe('coins');
    });

    it('should generate trend insight if there is monthly trend data', () => {
      const vehicles = [];
      const stats = {
        monthly_trend: [
          { month: '2026-01', count: 10 },
          { month: '2026-02', count: 12 },
          { month: '2026-03', count: 15 }
        ]
      };
      const insights = generateLocalInsights(vehicles, stats);
      const trendInsight = insights.find(i => i.type === 'trend');
      expect(trendInsight).toBeDefined();
      expect(trendInsight?.icon).toBe('trending');
    });
  });
});
