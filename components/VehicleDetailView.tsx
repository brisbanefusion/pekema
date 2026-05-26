
import React from 'react';
import { FileText, Settings, Home, Printer, ChevronLeft } from 'lucide-react';

interface VehicleDetailProps {
  lot: string;
  onBack: () => void;
}

export const VehicleDetailView: React.FC<VehicleDetailProps> = ({ lot, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Navigation Header */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Kembali ke Senarai
      </button>

      {/* Main Document Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header with Logo */}
        <div className="p-8 border-b border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 flex-shrink-0">
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/26/Coat_of_arms_of_Malaysia.svg" alt="JKDM Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Penyata Stok Bulanan</h1>
            <p className="text-sm text-slate-400 font-medium">Cawangan Industri, JKDM LTA KL</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Maklumat Utama */}
          <section className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Maklumat Utama</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
              <DetailField label="No. Lot:" value={lot} boldValue />
              <DetailField label="K8 No.:" value="WAF-C01-000001/25" subtitle="(Odo: 34,750 km)" />
              <DetailField label="K1 No.:" value="WAF109000010/25" subtitle="(Odo: 34,750 km)" />
              <DetailField label="Kod Gudang:" value="-" />
              <DetailField label="Nama Gudang:" value="WAF SINAR AUTO SDN BHD" />
              <div className="flex items-center justify-between py-1 border-b border-slate-100/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Keadaan:</span>
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded uppercase tracking-tighter">Used</span>
              </div>
            </div>
          </section>

          {/* Spesifikasi Teknikal */}
          <section className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Settings className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Spesifikasi Teknikal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
              <DetailField label="Model/Jenis:" value="LEXUS NX350 F SPORT" />
              <DetailField label="Chassis No.:" value="TAZA25-1001622" />
              <DetailField label="Enjin No.:" value="T24AN477939" />
              <DetailField label="Kapasiti:" value="2393 cc / N/A kw" />
              <DetailField label="Warna:" value="PUTIH" />
            </div>
          </section>

          {/* Butiran Kastam & Cukai */}
          <section className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <Home className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Butiran Kastam & Cukai</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                <DetailField label="TPA No.:" value="2022-05-26" />
                <DetailField label="Tarikh Bond-In:" value="N/A" />
                <DetailField label="AP:" value="MIT-141-I1003368/24" />
                <DetailField label="No. Resit:" value="003504IM" />
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Jumlah Duti:</span>
                  <span className="text-lg font-black text-slate-900 tracking-tighter">RM 68,937.90</span>
                </div>
                
                <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                  <TaxRow label="Duti Import:" value="RM 12,045.07" />
                  <TaxRow label="Duti Eksais:" value="RM 46,975.73" />
                  <TaxRow label="Cukai Jualan:" value="RM 9,917.10" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <DetailField label="Catatan:" value="-" />
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
            <Printer className="w-4 h-4" /> Cetak
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailField: React.FC<{ label: string; value: string; subtitle?: string; boldValue?: boolean }> = ({ label, value, subtitle, boldValue }) => (
  <div className="flex items-center justify-between py-1 border-b border-slate-100/50">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <div className="text-right">
      <span className={`text-[11px] font-black text-slate-700 uppercase ${boldValue ? 'text-indigo-600' : ''}`}>{value}</span>
      {subtitle && <span className="block text-[9px] text-slate-400 font-bold uppercase">{subtitle}</span>}
    </div>
  </div>
);

const TaxRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-[11px]">
    <span className="font-bold text-slate-500 uppercase">{label}</span>
    <span className="font-black text-slate-800">{value}</span>
  </div>
);
