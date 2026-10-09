import { Button } from '../common/UiComponents';
import { useNotifications } from '../../contexts/NotificationContext';
import type { PrivateKey } from '../../types';

interface PrivateKeyCardProps {
  keyData: PrivateKey;
  onRevoke: (keyId: string, reason: string) => Promise<void>;
  onViewDetails: () => void;
}

export function PrivateKeyCard({ keyData, onRevoke, onViewDetails }: PrivateKeyCardProps) {
  const { addNotification } = useNotifications();
  
  const handleRevoke = async () => {
    const reason = prompt('Please provide a reason for revoking this key:');
    if (reason) {
      await onRevoke(keyData.id, reason);
      addNotification({
        type: 'success',
        title: 'Key Revoked Successfully',
        message: 'The hospital private key has been revoked.'
      });
    }
  };

  const formatAge = (days: number) => {
    if (days < 1) return `${Math.floor(days * 24)} hours`;
    if (days < 30) return `${days} days`;
    return `${Math.floor(days / 30)} months`;
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{keyData.hospitalName}</h3>
          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            ID: {keyData.hospitalPrivateKeyIndex}
          </span>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      </div>
      <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Age:</span>
          <span>{formatAge(keyData.age)} old</span>
        </div>
        {keyData.expiresAt && (
          <div className="flex justify-between">
            <span>Expires:</span>
            <span>{new Date(keyData.expiresAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          Details
        </button>
        <button
          onClick={handleRevoke}
          className="flex-1 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors"
        >
          Revoke Key
        </button>
      </div>
    </div>
  );
}

interface KeyDisplayProps {
  keyText: string;
  onSave?: () => void;
}

export function KeyDisplay({ keyText, onSave }: KeyDisplayProps) {
  return (
    <div className="mb-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Hospital Private Key
        <span className="block text-xs text-gray-500 font-normal mt-1">
          Save this key securely in your password manager for this hospital
        </span>
      </label>
      <input
        type="text"
        value={keyText}
        readOnly
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
      {onSave && (
        <button
          onClick={onSave}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Copy to Password Manager
        </button>
      )}
    </div>
  );
}
