import React, { useState } from 'react';
import {
  Shield, Activity, Lock, AlertTriangle, Building2,
  FileText, LogOut, CheckCircle, Bell, X, User as UserIcon, Globe,
  QrCode, MapPin
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { LanguageProvider, useLanguage, LANGUAGES, Language } from './contexts/LanguageContext';
import { Dashboard } from './pages/Dashboard';
import { RecordsPage } from './pages/RecordsPage';
import { KeysPage } from './pages/KeysPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { HospitalPage } from './pages/HospitalPage';
import { QRSharePage } from './pages/QRSharePage';
import { NearbyPage } from './pages/NearbyPage';
import { ProfileSetup } from './components/auth/ProfileSetup';
import type { User, Hospital } from './types';

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="relative inline-flex items-center">
      <Globe className="w-4 h-4 text-gray-500 absolute left-2.5 pointer-events-none" />
      <select
        value={language}
        onChange={e => setLanguage(e.target.value as Language)}
        className="pl-8 pr-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}

function ShareModal({
  hospital,
  onClose,
  onConfirm
}: {
  hospital: Hospital;
  onClose: () => void;
  onConfirm: (duration: number, scope: string[]) => void;
}) {
  const { t } = useLanguage();
  const [duration, setDuration] = useState(30);
  const [scope, setScope] = useState(['lab_report', 'prescription', 'discharge_summary']);

  const toggleCategory = (cat: string) => {
    setScope(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{t('authorizeSharing')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Granting read-only access to <strong>{hospital.hospitalName}</strong>. You can revoke access at any time.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Consent Duration (Auto-Expires)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[7, 30, 90, 365].map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDuration(days)}
                  className={`py-2 text-sm font-medium rounded-lg border transition-all ${
                    duration === days
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('sharingScope')} (Read-Only)
            </label>
            <div className="space-y-2">
              {[
                { id: 'lab_report', label: 'Laboratory & Diagnostic Reports' },
                { id: 'prescription', label: 'Prescriptions & Medications' },
                { id: 'discharge_summary', label: 'Discharge Summaries & Visit Notes' },
                { id: 'imaging_report', label: 'Imaging & Radiology Scans' },
              ].map(item => (
                <label key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scope.includes(item.id)}
                    onChange={() => toggleCategory(item.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => onConfirm(duration, scope)}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
          >
            {t('grantConsent')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToastContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`p-4 rounded-xl shadow-lg border flex items-start justify-between gap-3 bg-white ${
            n.type === 'error'
              ? 'border-red-200 text-red-900'
              : n.type === 'success'
              ? 'border-green-200 text-green-900'
              : 'border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{n.title}</h4>
            <p className="text-xs text-gray-600 mt-1">{n.message}</p>
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function MainLayout() {
  const { user, login, logout, refreshUser } = useAuth();
  const { state, closeShareModal } = useApp();
  const { addNotification } = useNotifications();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleShareConfirm = (duration: number, scope: string[]) => {
    if (state.currentHospital) {
      addNotification({
        type: 'success',
        title: 'Consent Granted',
        message: `Granted ${duration}-day read-only access to ${state.currentHospital.hospitalName}.`
      });
      closeShareModal();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('appName')}</h1>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            {t('subTagline')}
          </p>

          <button
            onClick={login}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 text-base mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#fff" d="M12.24 10.285V13.4h6.887C18.2 15.632 15.645 18 12.24 18c-3.37 0-6.1-2.73-6.1-6s2.73-6 6.1-6c1.55 0 2.96.58 4.04 1.54l2.42-2.42C17.15 3.63 14.85 2.7 12.24 2.7 7.14 2.7 3 6.84 3 12s4.14 9.3 9.24 9.3c5.34 0 8.92-3.75 8.92-9.11 0-.62-.06-1.22-.17-1.8H12.24z"/>
            </svg>
            {t('signInGoogle')}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-6">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>{t('securityVerified')}</span>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: Activity },
    { id: 'records', label: t('records'), icon: FileText },
    { id: 'keys', label: t('keys'), icon: Lock },
    { id: 'qr', label: 'QR Share', icon: QrCode },
    { id: 'hospitals', label: t('hospitals'), icon: Building2 },
    { id: 'nearby', label: 'Nearby', icon: MapPin },
    { id: 'emergency', label: t('emergency'), icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div
              onClick={() => setCurrentPage('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer font-bold text-xl text-gray-900"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <span>{t('appName')}</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const active = currentPage === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentPage(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />

            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">{user.fullName || t('myProfile')}</span>
            </button>

            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t('signOut')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
        {currentPage === 'records' && <RecordsPage />}
        {currentPage === 'keys' && <KeysPage />}
        {currentPage === 'qr' && <QRSharePage />}
        {currentPage === 'hospitals' && <HospitalPage />}
        {currentPage === 'nearby' && <NearbyPage />}
        {currentPage === 'emergency' && <EmergencyPage />}
      </main>

      {/* Share Modal */}
      {state.shareModalOpen && state.currentHospital && (
        <ShareModal
          hospital={state.currentHospital}
          onClose={closeShareModal}
          onConfirm={handleShareConfirm}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <ProfileSetup
              onComplete={updated => {
                refreshUser();
                setShowProfileModal(false);
              }}
            />
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <AuthProvider>
          <AppProvider>
            <MainLayout />
          </AppProvider>
        </AuthProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
}
