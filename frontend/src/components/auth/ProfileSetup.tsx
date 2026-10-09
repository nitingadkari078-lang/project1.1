import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { User } from '../../types';

interface ProfileSetupProps {
  onComplete: (user: User) => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    age: user?.age || 0,
    phone: user?.phone || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const updatedUser: User = {
        id: user?.id || 'usr_demo_123',
        email: user?.email || 'user@example.com',
        createdAt: user?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fullName: formData.fullName,
        age: formData.age,
        phone: formData.phone
      };
      onComplete(updatedUser);
      addNotification({ type: 'success', title: 'Profile Updated', message: 'Your profile has been saved successfully.' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Update Failed', message: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white">👤</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Create your secured MediVault account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              required
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})}
              min="0"
              max="120"
              required
              placeholder="Enter your age"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="+1 234 567 8900"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
