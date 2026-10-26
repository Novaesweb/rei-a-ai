import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppContent } from './App'
import { StoreProvider } from './context/StoreContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  </React.StrictMode>
)
