import React, { useState } from 'react';
import { Search, Building2, ShieldCheck, Clock } from 'lucide-react';
import type { Hospital } from '../../types';

interface HospitalSearchProps {
  hospitals: Hospital[];
  onSelectHospital: (hospital: Hospital) => void;
  onConnect?: (hospital: Hospital) => void;
}

export function HospitalSearch({ hospitals, onSelectHospital, onConnect }: HospitalSearchProps) {
  const [search, setSearch] = useState('');

  const filtered = hospitals.filter(h =>
    h.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase()) ||
    h.hospitalId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search hospitals by name, ID, or city..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(hospital => (
          <div
            key={hospital.id}
            className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{hospital.hospitalName}</h3>
                    <p className="text-xs text-gray-500">{hospital.city} • ID: {hospital.hospitalId}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {hospital.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 my-3 text-xs">
                {hospital.hasPrivateKey && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    <ShieldCheck className="w-3.5 h-3.5" /> Key Saved
                  </span>
                )}
                {hospital.hasVisitHistory && (
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5" /> Visit Records
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => onSelectHospital(hospital)}
                className="flex-1 py-2 px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Share Records
              </button>
              {onConnect && (
                <button
                  onClick={() => onConnect(hospital)}
                  className="py-2 px-3 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

