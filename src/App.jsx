import React from 'react'
import Routing from './router/Routing'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111827', // Slate 900
            color: '#f3f4f6',      // Slate 100
            border: '1px solid #1f2937', // Slate 800
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            fontSize: '13px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#3b82f6', // Cyber Blue
              secondary: '#111827',
            },
            style: {
              borderLeft: '4px solid #3b82f6',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // Red Accent
              secondary: '#111827',
            },
            style: {
              borderLeft: '4px solid #ef4444',
            },
          },
        }}
      />
      <Routing />
    </div>
  )
}

export default App
