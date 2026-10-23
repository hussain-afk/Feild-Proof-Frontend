import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ContextProvider from './context/context.jsx'
import './index.css'
import App from './App.jsx'
import MaintenanceGate from './utils/MaintenanceGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ContextProvider>
        <MaintenanceGate>
        <App />
        </MaintenanceGate>
      </ContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
