import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { LangProvider } from './contexts/LangContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LangProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LangProvider>
  </StrictMode>,
)
