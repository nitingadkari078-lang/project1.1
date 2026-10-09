import { Key, AlertTriangle, Bell } from 'lucide-react';
import { PrivateKeyCard } from '../components/auth/PrivateKeyCard';

export function KeysPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Hospital Keys</h1>
      <p className="text-gray-600 mb-8">
        Your hospital-specific keys are stored securely. Use these to access your records
      </p>

      <div className="space-y-6">
        <FutureKeyBox>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create New Key</h3>
              <p className="text-sm text-gray-600">Generate a key for a new hospital</p>
            </div>
          </div>
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Generate Key →
          </button>
        </FutureKeyBox>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Key Safety</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Store these keys securely in your password manager. Never share them with unauthorized parties.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800">Notifications</h3>
              <p className="text-sm text-blue-700 mt-1">
                You'll be notified anytime someone requests access to your records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FutureKeyBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {children}
    </div>
  );
}
