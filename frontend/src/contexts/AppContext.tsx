import React, { createContext, useContext, useState } from 'react';
import type { Hospital, User } from '../types';
import { useNotifications } from './NotificationContext';

interface AppState {
  user: User | null;
  hospitals: Hospital[];
  currentHospital: Hospital | null;
  selectedKeys: string[];
  shareModalOpen: boolean;
  emergencyModalOpen: boolean;
}

const INITIAL_STATE: AppState = {
  user: null,
  hospitals: [],
  currentHospital: null,
  selectedKeys: [],
  shareModalOpen: false,
  emergencyModalOpen: false,
};

interface AppContextType {
  state: AppState;
  fetchHospitals: () => Promise<void>;
  selectHospital: (hospital: Hospital) => void;
  toggleKey: (hospitalId: string) => void;
  openShareModal: (hospital: Hospital) => void;
  closeShareModal: () => void;
  openEmergencyModal: () => void;
  closeEmergencyModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const { addNotification } = useNotifications();

  const fetchHospitals = async () => {
    const hospitals: Hospital[] = [
      {
        id: '1', hospitalId: 'EMR001', hospitalName: 'City General Hospital',
        city: 'New York', status: 'active', hasPrivateKey: true, hasVisitHistory: true
      },
      {
        id: '2', hospitalId: 'EMR002', hospitalName: 'Memorial Medical Center',
        city: 'Los Angeles', status: 'active', hasPrivateKey: true, hasVisitHistory: true
      },
      {
        id: '3', hospitalId: 'EMR003', hospitalName: 'St. Jude Children Research Hospital',
        city: 'Memphis', status: 'active', hasPrivateKey: false, hasVisitHistory: false
      },
      {
        id: '4', hospitalId: 'EMR004', hospitalName: 'Mayo Clinic Health System',
        city: 'Rochester', status: 'active', hasPrivateKey: false, hasVisitHistory: false
      },
    ];
    setState(prev => ({ ...prev, hospitals }));
  };

  const selectHospital = (hospital: Hospital) => {
    setState(prev => ({ ...prev, currentHospital: hospital, shareModalOpen: true }));
  };

  const toggleKey = (hospitalId: string) => {
    setState(prev => ({
      ...prev,
      selectedKeys: prev.selectedKeys.includes(hospitalId)
        ? prev.selectedKeys.filter(k => k !== hospitalId)
        : [...prev.selectedKeys, hospitalId]
    }));
  };

  const openShareModal = (hospital: Hospital) => {
    setState(prev => ({ ...prev, shareModalOpen: true, currentHospital: hospital }));
  };

  const closeShareModal = () => {
    setState(prev => ({ ...prev, shareModalOpen: false }));
  };

  const openEmergencyModal = () => {
    setState(prev => ({ ...prev, emergencyModalOpen: true }));
  };

  const closeEmergencyModal = () => {
    setState(prev => ({ ...prev, emergencyModalOpen: false }));
  };

  return (
    <AppContext.Provider value={{ state, fetchHospitals, selectHospital, toggleKey, openShareModal, closeShareModal, openEmergencyModal, closeEmergencyModal }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
