import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { History as HistoryIcon, Clock, CheckCircle2, XCircle, Search, Database } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/query/history');
        if (res.data.success) {
          setHistory(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.natural_query.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.generated_sql.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-brand-600" />
            Query History
          </h2>
          <p className="text-gray-500 mt-1">Review your past natural language queries and generated SQL.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-400">
            Loading history...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <p>No query history found.</p>
          </div>
        ) : (
          <div className="space-y-4 pr-2">
            {filteredHistory.map((item) => (
              <div key={item._id} className="p-5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition group">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Column: Natural Query & Meta */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      {item.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                      <h4 className="font-semibold text-gray-800 text-lg">"{item.natural_query}"</h4>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(item.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Database className="w-3.5 h-3.5" />
                        {item.connection_id?.nickname || 'Unknown DB'}
                      </span>
                      {item.success && (
                        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md">
                          {item.execution_time_ms}ms
                        </span>
                      )}
                    </div>
                    
                    {!item.success && item.error_message && (
                      <div className="mt-auto text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                        {item.error_message}
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column: SQL */}
                  <div className="flex-1 bg-gray-900 rounded-xl p-4 overflow-x-auto relative">
                    <span className="absolute top-2 right-3 text-[10px] text-gray-500 uppercase tracking-wider font-bold">SQL</span>
                    <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap mt-3">
                      {item.generated_sql}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
