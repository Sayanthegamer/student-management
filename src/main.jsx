import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      {import.meta.env.PROD && <SpeedInsights />}
    </BrowserRouter>
  </StrictMode>,
)
