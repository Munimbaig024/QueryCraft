import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Sparkles, Database, Play, Loader2, TableProperties, BarChart2 } from 'lucide-react';
import DynamicChart from '../components/DynamicChart';

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
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate query. Please try again.');
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
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
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
          <Table className="w-5 h-5 text-brand-600" />
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
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md shadow-sm border border-gray-200">
                    Execution time: {execTime}ms
                  </span>
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
  );
};

export default Dashboard;
