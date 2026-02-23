
import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, MoreHorizontal, Loader2, Printer } from 'lucide-react';
import { apiService } from '../services/apiService';

interface Props {
  onSelectLot: (lot: string) => void;
  onAddNew: () => void;
}

export const VehicleListView: React.FC<Props> = ({ onSelectLot, onAddNew }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await apiService.getVehicles();
      setVehicles(data);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#1e3a8a]">Senarai Kenderaan</h1>
          <p className="text-sm text-blue-500 font-medium">Paparan rekod inventori kenderaan terkini dari database.</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
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

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print:hidden">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tapis ikut Syarikat</label>
          <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
            <option>Semua Syarikat</option>
            <option>WAF SINAR AUTO SDN BHD</option>
            <option>WAX RAZIMOTO SDN BHD</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Carian Kata Kunci</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari No. Lot, No. K8, No. Casis..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
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
                  {vehicles.map((v, i) => (
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Section */}
            <div className="px-6 py-6 border-t border-slate-50 mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <p className="text-xs text-slate-500 font-medium">
                Menunjukkan <span className="font-bold text-slate-900">{vehicles.length}</span> rekod aktif
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
    </div>
  );
};
