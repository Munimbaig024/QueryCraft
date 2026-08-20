import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Sparkles, Database, Play, Loader2, TableProperties, BarChart2, Download, History as HistoryIcon, ArrowRight } from 'lucide-react';
import DynamicChart from '../components/DynamicChart';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null); // { sql, visualization }
  const [errorMsg, setErrorMsg] = useState('');
  
  // Execution states
  const [executionData, setExecutionData] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [execTime, setExecTime] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

  // History state
  const [recentHistory, setRecentHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/query/history');
      if (res.data.success) {
        setRecentHistory(res.data.data.slice(0, 15)); // Keep top 15 in sidebar
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

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
    fetchHistory();
  }, []);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || !selectedConnection) return;
    
    setLoading(true);
    setErrorMsg('');
    setGeneratedResult(null);
    setExecutionData(null);
    setExecTime(null);

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
      toast.success('SQL Generated Successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate query. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setErrorMsg('');
    
    try {
      const res = await api.post('/query/execute', {
        connectionId: selectedConnection,
        sql: generatedResult.sql,
        prompt: prompt
      });
      
      if (res.data.success) {
        setExecutionData(res.data.data);
        setExecTime(res.data.executionTimeMs);
        
        // Auto-switch to chart view if the AI recommended one
        if (generatedResult.visualization && generatedResult.visualization !== 'table') {
          setViewMode('chart');
        } else {
          setViewMode('table');
        }
        
        // Refresh history to show this latest execution
        fetchHistory();
      }
      toast.success('Query Executed Successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Execution failed';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setExecuting(false);
    }
  };

  const handleExportCSV = () => {
    if (!executionData || executionData.length === 0) return;
    const headers = Object.keys(executionData[0]).join(',');
    const rows = executionData.map(row => 
      Object.values(row).map(val => `"${val}"`).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    toast.success('Exported to CSV');
  };

  const handleExportJSON = () => {
    if (!executionData || executionData.length === 0) return;
    const json = JSON.stringify(executionData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.json';
    a.click();
    toast.success('Exported to JSON');
  };

  const handleHistoryClick = (item) => {
    setPrompt(item.natural_query);
    if (item.connection_id) {
      setSelectedConnection(item.connection_id._id || item.connection_id);
    }
    setGeneratedResult({
      sql: item.generated_sql,
      visualization: 'table' // fallback visualization for history load
    });
    setExecutionData(null);
    setExecTime(null);
    toast.success('Loaded past query');
  };

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 shrink-0">
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
                className="w-full h-[100px] p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition resize-none text-gray-700"
              ></textarea>
              
              <div className="absolute bottom-4 right-4">
                <button
                  type="submit"
                  disabled={loading || !prompt.trim() || !selectedConnection}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
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
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-0">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-brand-600" />
            Results
          </h3>
          
          {generatedResult ? (
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              {/* SQL Code Block */}
              <div className="bg-gray-900 rounded-xl p-4 shrink-0 shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Generated SQL</span>
                  <span className="text-xs text-brand-400 bg-brand-400/10 px-2 py-1 rounded-md">
                    Vis: {generatedResult.visualization}
                  </span>
                </div>
                <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                  {generatedResult.sql}
                </pre>
              </div>
              
              {/* Action Button */}
              {!executionData && (
                <div className="shrink-0">
                  <button 
                    onClick={handleExecute}
                    disabled={executing}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {executing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Executing Query...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current" /> Execute Query
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Data Table / Chart View */}
              {executionData && (
                <div className="flex-1 flex flex-col min-h-0 mt-2">
                  <div className="flex justify-between items-center mb-2 shrink-0">
                    <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                      Data Output
                      {generatedResult.visualization !== 'table' && (
                        <div className="flex bg-gray-100 rounded-lg p-0.5 ml-4">
                          <button 
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition ${viewMode === 'table' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            <TableProperties className="w-3 h-3" /> Table
                          </button>
                          <button 
                            onClick={() => setViewMode('chart')}
                            className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition ${viewMode === 'chart' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            <BarChart2 className="w-3 h-3" /> Chart
                          </button>
                        </div>
                      )}
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={handleExportCSV}
                          className="px-2 py-1 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded flex items-center gap-1 transition"
                        >
                          <Download className="w-3 h-3" /> CSV
                        </button>
                        <button 
                          onClick={handleExportJSON}
                          className="px-2 py-1 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded flex items-center gap-1 transition"
                        >
                          <Download className="w-3 h-3" /> JSON
                        </button>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md shadow-sm border border-gray-200">
                        Execution time: {execTime}ms
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto border border-gray-200 rounded-xl shadow-inner bg-white">
                    {viewMode === 'table' ? (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
                          <tr>
                            {executionData.length > 0 ? (
                              Object.keys(executionData[0]).map((key) => (
                                <th key={key} className="p-3 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                  {key}
                                </th>
                              ))
                            ) : (
                              <th className="p-3 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">Result</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {executionData.length > 0 ? (
                            executionData.map((row, i) => (
                              <tr key={i} className="hover:bg-brand-50/50 transition-colors">
                                {Object.values(row).map((val, j) => (
                                  <td key={j} className="p-3 text-sm text-gray-700 whitespace-nowrap">
                                    {val !== null ? String(val) : <span className="text-gray-400 italic">null</span>}
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="p-8 text-center text-gray-500 italic">No rows returned from this query.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <div className="h-full min-h-[300px] p-6">
                        <DynamicChart data={executionData} type={generatedResult.visualization} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
              <Sparkles className="w-12 h-12 mb-3 text-gray-300" />
              <p>Your generated SQL and results will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      <div className="w-72 lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-col shrink-0 hidden md:flex">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-brand-600" />
            Recent Queries
          </div>
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {recentHistory.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center mt-4">No recent history.</p>
          ) : (
            recentHistory.map((item) => (
              <div 
                key={item._id} 
                onClick={() => handleHistoryClick(item)}
                className="p-3 border border-gray-100 rounded-xl hover:bg-brand-50 hover:border-brand-200 cursor-pointer transition group"
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
                    "{item.natural_query}"
                  </p>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-400 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2" />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${item.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.success ? 'Success' : 'Error'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
