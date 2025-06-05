import React from 'react'
import ReactDOM from 'react-dom/client'
import { NewDashboard } from './components/Dashboard/NewDashboard'

// Import global styles and setup
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NewDashboard />
  </React.StrictMode>,
)
