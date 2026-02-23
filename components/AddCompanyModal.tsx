
import React from 'react';
import { X, Plus, MapPin } from 'lucide-react';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          {/* Header Icon */}
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/30">
            <Plus className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">Tambah GB Baharu</h2>
          <p className="text-xs text-slate-400 font-medium mb-8">Isi maklumat syarikat di bawah</p>

          <form className="w-full space-y-5 text-left" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
            {/* Nama Syarikat */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                Nama Syarikat <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="cth: WAF SINAR AUTO SDN BHD"
              />
            </div>

            {/* PIC */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                PIC
              </label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Nama individu untuk dihubungi"
              />
            </div>

            {/* Alamat Syarikat */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                Alamat Syarikat
              </label>
              <textarea 
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                placeholder="Alamat penuh syarikat..."
              ></textarea>
            </div>

            {/* No. Telefon */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                No. Telefon
              </label>
              <input 
                type="tel" 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="cth: 013-1234567"
              />
            </div>

            {/* Pautan Google Maps */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                Pautan Google Maps
              </label>
              <div className="relative">
                <input 
                  type="url" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="w-full py-3.5 border border-slate-200 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
