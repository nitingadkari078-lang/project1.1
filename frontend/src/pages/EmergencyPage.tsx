import { AlertTriangle, Bell, Shield, Mail } from 'lucide-react';

export function EmergencyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Access</h1>
      <p className="text-gray-600 mb-8">
        Request emergency access to your protected medical data when you're unable to provide consent
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <EmergencyCard 
          title="Request Emergency Access" 
          description="Provide full access to authorized hospitals during medical emergencies"
          icon={<AlertTriangle className="w-8 h-8 text-red-600" />}
        />
        <EmergencyCard 
          title="View Requests" 
          description="Manage pending and approved emergency access requests"
          icon={<Bell className="w-8 h-8 text-yellow-600" />}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Recent Access Requests</h2>
        </div>

        <div className="divide-y">
          <EmergencyRequestItem 
            hospital="City General Hospital"
            requester="Dr. Sarah Johnson"
            reason="Patient unconscious emergency - need blood work"
            date="Today, 2:30 PM"
            status="pending"
          />
          <EmergencyRequestItem 
            hospital="Memorial Medical Center"
            requester="Dr. Michael Chen"
            reason="UTI symptoms, patient unable to speak"
            date="Yesterday"
            status="approved"
            notified="true"
          />
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Dr. Sarah Johnson</p>
            <p className="text-sm text-gray-600">Cardiologist at City General Hospital</p>
            <div className="flex items-center gap-2 mt-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">sarah.j@citygeneral.org</span>
            </div>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

function EmergencyCard({ title, description, icon }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow">
      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
}

function EmergencyRequestItem({ hospital, requester, reason, date, status, notified }: any) {
  return (
    <div className="p-6 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-gray-900">{hospital}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
              status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Requester:</strong> {requester}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Reason:</strong> {reason}
          </p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        {notified && (
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <Bell className="w-4 h-4" />
            <span>Notified You</span>
          </div>
        )}
      </div>
    </div>
  );
}
