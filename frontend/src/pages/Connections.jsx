import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Database, Plus, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({ nickname: '', db_type: 'postgres', connection_string: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'success' | 'error' | 'loading' | null
  const [errorMsg, setErrorMsg] = useState('');

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await api.get('/connections');
      setConnections(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch connections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleTestConnection = async (e) => {
    e.preventDefault();
    if (!formData.connection_string) return;
    
    setTestStatus('loading');
    setErrorMsg('');
    try {
      await api.post('/connections/test', {
        db_type: formData.db_type,
        connection_string: formData.connection_string
      });
      setTestStatus('success');
    } catch (err) {
      setTestStatus('error');
      setErrorMsg(err.response?.data?.message || 'Connection failed');
    }
  };

  const handleSaveConnection = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg('');
    try {
      await api.post('/connections', formData);
      setShowForm(false);
      setFormData({ nickname: '', db_type: 'postgres', connection_string: '' });
      setTestStatus(null);
      fetchConnections();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save connection');
      if (!testStatus) setTestStatus('error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this connection?')) return;
    try {
      await api.delete(`/connections/${id}`);
      fetchConnections();
    } catch (err) {
      alert('Failed to delete connection');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Database Connections</h2>
          <p className="text-gray-500">Manage your linked databases to query against.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition"
          >
            <Plus className="w-5 h-5" /> Add Connection
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">New Connection</h3>
          
          {errorMsg && testStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                <input 
                  type="text" 
                  value={formData.nickname}
                  onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  placeholder="e.g. Production PostgreSQL"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Database Type</label>
                <select 
                  value={formData.db_type}
                  onChange={(e) => setFormData({...formData, db_type: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                >
                  <option value="postgres">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Connection String</label>
              <input 
                type="password" 
                value={formData.connection_string}
                onChange={(e) => setFormData({...formData, connection_string: e.target.value})}
                placeholder="postgres://user:pass@localhost:5432/dbname"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={handleTestConnection}
                  disabled={!formData.connection_string || testStatus === 'loading'}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
                >
                  {testStatus === 'loading' ? 'Testing...' : 'Test Connection'}
                </button>
                {testStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {testStatus === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setErrorMsg('');
                    setTestStatus(null);
                  }}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveConnection}
                  disabled={formLoading || !formData.nickname || !formData.connection_string}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save Connection'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Database className="w-12 h-12 mb-3 opacity-20" />
            <p>No connections found. Add one above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map(conn => (
              <div key={conn._id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition bg-white relative group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{conn.nickname}</h4>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md capitalize">
                      {conn.db_type}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(conn._id)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                  title="Delete connection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;
