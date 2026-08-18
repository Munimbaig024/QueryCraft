import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Sparkles, Database, Play, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null); // { sql, visualization }
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await api.get('/connections');
        setConnections(res.data.data || []);
        if (res.data.data && res.data.data.length > 0) {
          setSelectedConnection(res.data.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch connections', err);
      }
    };
    fetchConnections();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedConnection) return;
    
    setLoading(true);
    setErrorMsg('');
    setGeneratedResult(null);

    try {
      const res = await api.post('/query/generate', {
        connectionId: selectedConnection,
        prompt: prompt
      });
      
      if (res.data.success) {
        setGeneratedResult({
          sql: res.data.sql,
          visualization: res.data.visualization
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            AI Query Generator
          </h2>
          
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-400" />
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="" disabled>Select Database</option>
              {connections.map(c => (
                <option key={c._id} value={c._id}>{c.nickname} ({c.db_type})</option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleGenerate}>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Show me the total revenue grouped by month for the last year..."
              className="w-full min-h-[120px] p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition resize-y text-gray-700"
            ></textarea>
            
            <div className="absolute bottom-4 right-4">
              <button
                type="submit"
                disabled={loading || !prompt.trim() || !selectedConnection}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                Generate SQL
              </button>
            </div>
          </div>
        </form>
        
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated SQL</h3>
        
        {generatedResult ? (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="bg-gray-900 rounded-xl p-4 overflow-auto">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {generatedResult.sql}
              </pre>
            </div>
            <div className="text-sm text-gray-500">
              Recommended Visualization: <span className="font-semibold capitalize text-brand-600">{generatedResult.visualization}</span>
            </div>
            
            <div className="mt-auto">
              <button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-medium rounded-xl border border-gray-200 cursor-not-allowed">
                Execute Query (Coming in next commit)
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
            Generated SQL will appear here
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
