
import React from 'react';
import { 
  FileText, Settings, Shield, Info, Save, ChevronLeft, Calendar as CalendarIcon
} from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const AddVehicleView: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Senarai
        </button>
        <h1 className="text-3xl font-black text-[#1e3a8a] tracking-tight">Tambah Kenderaan Baharu</h1>
        <p className="text-sm text-blue-500 font-medium">Sila isi semua maklumat yang diperlukan di bawah.</p>
      </div>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onBack(); }}>
        {/* Section 1: Maklumat Asas & Gudang */}
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-blue-500 overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Maklumat Asas & Gudang</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormGroup label="No. Lot" required placeholder="cth: WAF/2025/01/01" />
            <FormSelect label="Kod Gudang" options={['Pilih Kod Gudang', 'G1', 'G2', 'G3']} />
            <FormGroup label="Tarikh Bond In" type="date" />
            <FormSelect label="Keadaan" options={['USED', 'NEW']} defaultValue="USED" />
            <div className="md:col-span-3">
              <FormSelect 
                label="Syarikat GB/PEKEMA (Nama Gudang)" 
                options={['Pilih Syarikat', 'WAF SINAR AUTO SDN BHD', 'WAX RAZIMOTO SDN BHD']} 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Spesifikasi Teknikal */}
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-emerald-500 overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Spesifikasi Teknikal</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormGroup label="No. Casis" required placeholder="No. Casis Kenderaan" />
            <FormGroup label="No. Enjin" placeholder="No. Enjin Kenderaan" />
            <FormGroup label="Model/Jenis" required placeholder="cth: TOYOTA ALPHARD" />
            <FormGroup label="Tahun Dibuat" placeholder="e.g., 2022" />
            <FormGroup label="Warna" placeholder="Warna Kenderaan" />
            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Kapasiti (CC)" placeholder="CC" />
              <FormGroup label="KW" placeholder="KW" />
            </div>
          </div>
        </div>

        {/* Section 3: Maklumat Kastam */}
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-purple-500 overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Maklumat Kastam</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <FormGroup label="No. K8" />
            <FormGroup label="Odometer K8 (km)" type="number" />
            <FormGroup label="No. K1" />
            <FormGroup label="Odometer K1 (km)" type="number" />
            <FormGroup label="No. AP" />
            <FormGroup label="Tarikh Luput AP" type="date" />
            <FormGroup label="Odometer (km)" type="number" />
            <FormGroup label="Tarikh TPA" type="date" />
          </div>
        </div>

        {/* Section 4: Catatan */}
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-amber-500 overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-50 flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Catatan</h3>
          </div>
          <div className="p-8">
            <textarea 
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="Masukkan sebarang maklumat tambahan di sini..."
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-10">
          <button 
            type="button" 
            onClick={onBack}
            className="px-8 py-3.5 border border-slate-200 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Batal
          </button>
          <button 
            type="submit"
            className="flex items-center gap-2 px-10 py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> Simpan Rekod
          </button>
        </div>
      </form>
    </div>
  );
};

const FormGroup: React.FC<{ label: string; required?: boolean; placeholder?: string; type?: string }> = ({ label, required, placeholder, type = "text" }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input 
      type={type}
      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      placeholder={placeholder}
    />
  </div>
);

const FormSelect: React.FC<{ label: string; options: string[]; defaultValue?: string }> = ({ label, options, defaultValue }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
      {label}
    </label>
    <select 
      defaultValue={defaultValue}
      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);
