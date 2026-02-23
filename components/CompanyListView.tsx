
import React, { useState } from 'react';
import { 
  Building2, User, Phone, MapPin, Search, Plus, Trophy, Car, Clock, ExternalLink
} from 'lucide-react';
import { AddCompanyModal } from './AddCompanyModal';

const MOCK_COMPANIES = [
  { name: 'WAF SINAR AUTO SDN BHD', address: 'o 6 Jalan P16, Seksyen 10, Taman Perindustrian Selam', pic: 'HAMDAN BIN ARIS', phone: '0133102015' },
  { name: 'WAL SERANGKAI AUTOMOBILES SDN BHD', address: 'NO.38, JALAN PERINDUSTRIAN SUNTRACK, HUB PER', pic: 'NUR RASZIRAZIE BINTI ABDUL RAHIM', phone: '0192491796' },
  { name: 'WAP ECW MOTORSPORTS SDN BHD', address: 'NO.31, JALAN P/21, SEKSYEN 10, TAMAN PERINDUSTR', pic: 'NORSUHANIS BINTI MUHAMAD SALLEH', phone: '0192614229' },
  { name: 'WAQ BUMI MUHIBAH MOTORS SDN BHD', address: 'NO 20 JALAN P10/16 SEKSYEN 10 TAMAN PERINDUST', pic: 'MUHAMAD FARID BIN MOHAMAD ZIN', phone: '01127174389' },
  { name: 'WAR TUNETECH VOITURE SDN BHD', address: 'Lot 58996 - A, Jalan Haji Abdul Wahid, Kampung Sun', pic: 'MUHAMMAD HAFIS BIN MUHAMMAD', phone: '0104558346' },
  { name: 'WAS SUPREME RADIUS SDN BHD', address: 'LOT 58996-B, JALAN HAJI ABDUL WAHID, KG SUNGA', pic: 'FATEN SYAHERA BINTI BAHARUDIN', phone: '0102468510' },
  { name: 'WAV MOSCORP SDN BHD', address: 'Jalan P16, Seksyen 10, Taman Perindustrian Selam', pic: 'HAMDAN BIN ARIS', phone: '0133102015' },
  { name: 'WAX RAZIMOTO SDN BHD', address: 'E-G-5 & 63 LOT PARKIR (372-386,409-438,745-756 &', pic: 'HAMDAN BIN ARIS', phone: '0133102015' },
  { name: 'WAY ADK GLOBAL SDN BHD', address: 'LOT R-G-11,R-1-11,R-G-12,R-1-12,NO.66 BELL AVENUE', pic: 'HAMIZAH BINTI YA\'AKOB', phone: '0177461402' },
  { name: 'WAZ IMMONAAZ SDN BHD', address: 'Autoville, Jalan, No. 12A, Jalan Autoville 2, Persiaran M', pic: 'MUHAMMAD HAFIS BIN MUHAMMAD', phone: '0104558346' },
  { name: 'WBP NIEZAK CONSUPSER SDN BHD', address: 'LOT 30/2, PEKAN CHERAS BATU 11, 43200 CHERAS, S', pic: 'FATEN SYAHERA BINTI BAHARUDIN', phone: '0102468510' },
];

export const CompanyListView: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getGoogleMapsUrl = (name: string, address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AddCompanyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Top Banner Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl shadow-indigo-500/20">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">
              Pengurusan Syarikat <br/> GB/PEKEMA
            </h1>
            <p className="text-indigo-100/70 text-sm font-medium mt-1">
              Urus dan selia maklumat syarikat dengan mudah dan efisien.
            </p>
          </div>
        </div>
        <div className="mt-6 md:mt-0 flex items-center gap-2 text-right">
           <Clock className="w-4 h-4 text-indigo-200" />
           <div className="text-[10px] font-black uppercase tracking-widest text-indigo-100">
              16 Feb 2026,<br/>06:29 PM
           </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#10b981] p-8 rounded-[2rem] text-white flex items-center justify-between shadow-lg shadow-emerald-500/20">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Jumlah GB</p>
            <h3 className="text-4xl font-black">31</h3>
            <p className="text-[10px] font-bold mt-1 text-emerald-100">Syarikat Berdaftar</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
             <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2rem] text-white flex flex-col md:flex-row md:items-center justify-between shadow-lg shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Trophy className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-indigo-200">GB Paling Aktif</p>
            <h3 className="text-2xl font-black italic tracking-tight uppercase mb-4">WBP NIEZAK CONSUPSER SDN BHD</h3>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                  <Car className="w-3.5 h-3.5" /> 325 Kenderaan
               </div>
               <div className="flex items-center gap-1.5 bg-amber-400 text-amber-900 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                  <Trophy className="w-3.5 h-3.5" /> Top Performer
               </div>
            </div>
          </div>
          <div className="mt-6 md:mt-0 relative z-10">
             <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/30">
                <Trophy className="w-8 h-8 text-amber-900" />
             </div>
          </div>
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-black text-slate-800">Senarai Syarikat</h2>
            <p className="text-xs text-slate-400 font-medium">Cari dan urus maklumat syarikat</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari syarikat..." 
                className="pl-11 pr-6 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 w-full md:w-80"
              />
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Syarikat</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">PIC & Telefon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_COMPANIES.map((company, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black text-slate-800 uppercase group-hover:text-indigo-600 transition-colors">
                        {company.name}
                      </span>
                      <a 
                        href={getGoogleMapsUrl(company.name, company.address)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 text-slate-400 hover:text-indigo-600 transition-all w-fit group/link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 group-hover/link:animate-bounce" />
                        <span className="text-[10px] font-bold uppercase truncate max-w-[400px] border-b border-transparent group-hover/link:border-indigo-600">
                          {company.address}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5 mt-1 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                          {company.pic}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-black text-slate-400 tracking-widest">
                          {company.phone}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
