import React, { useState } from 'react';
import { Hash, Lock, ShieldAlert, User, FileText, AlertTriangle } from 'lucide-react';

export function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">MediVault Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<ShieldAlert className="w-6 h-6" />} title="Emergency Access" onClick={onNavigate} to="emergency" />
        <StatCard icon={<FileText className="w-6 h-6" />} title="My Records" onClick={onNavigate} to="records" />
        <StatCard icon={<Lock className="w-6 h-6" />} title="Hospital Keys" onClick={onNavigate} to="keys" />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <RecentItem icon={<Lock className="w-5 h-5" />} title="Hospital key created" time="2 hours ago" />
          <RecentItem icon={<FileText className="w-5 h-5" />} title="Case file viewed" time="Yesterday" />
          <RecentItem icon={<ShieldAlert className="w-5 h-5" />} title="Emergency access requested" time="3 days ago" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, onClick, to }: any) {
  return (
    <div 
      onClick={() => onClick?.(to)}
      className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg cursor-pointer hover:bg-white transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
    </div>
  );
}

function RecentItem({ icon, title, time }: any) {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">{icon}</div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
      </div>
      <span className="text-sm text-gray-500">{time}</span>
    </div>
  );
}
