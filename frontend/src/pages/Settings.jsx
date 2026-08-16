import React from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
      
      <div className="max-w-2xl">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">
            Profile Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 font-medium">
                {user?.name || 'Loading...'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 font-medium">
                {user?.email || 'Loading...'}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">
            Preferences
          </h3>
          <p className="text-sm text-gray-500">
            More customization options like UI themes and notification preferences will be available in future updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
