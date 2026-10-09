import React, { useEffect } from 'react';
import { HospitalSearch } from '../components/hospital/HospitalSearch';
import { useApp } from '../contexts/AppContext';
import { useNotifications } from '../contexts/NotificationContext';
import type { Hospital } from '../types';

export function HospitalPage() {
  const { state, fetchHospitals, openShareModal } = useApp();
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleConnect = (hospital: Hospital) => {
    addNotification({
      type: 'info',
      title: 'Connection Initiated',
      message: `Access authorization requested for ${hospital.hospitalName}.`
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hospital Directory</h1>
        <p className="text-gray-600">
          Search affiliated medical centers and manage health record sharing permissions.
        </p>
      </div>

      <HospitalSearch
        hospitals={state.hospitals}
        onSelectHospital={openShareModal}
        onConnect={handleConnect}
      />
    </div>
  );
}

