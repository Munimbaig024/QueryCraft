import React from 'react'
import Layout from './components/Layout'

function App() {
  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center h-full">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to QueryCraft</h3>
        <p className="text-gray-500 max-w-md">
          Your base layout is ready! Navigate to the sidebar to manage databases, run natural language queries, and view past history.
        </p>
      </div>
    </Layout>
  )
}

export default App
