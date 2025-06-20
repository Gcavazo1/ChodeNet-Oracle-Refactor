import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { NewDashboard } from './components/Dashboard/NewDashboard'
import { AdminPage } from './components/AdminPanel/AdminPage'
import { SolanaWalletProvider } from './lib/SolanaWalletProvider'
import './index.css'
import { IntroSequence } from './components/IntroSequence'
import { SIWSProvider } from './lib/useSIWS'

const RootApp: React.FC = () => {
  const [entered, setEntered] = useState<boolean>(false)
  const [showDashboard, setShowDashboard] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'admin'>('dashboard')

  // Check for route-based navigation
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/admin') {
      setCurrentPage('admin')
      setEntered(true)
      setShowDashboard(true)
    } else {
      setCurrentPage('dashboard')
    }

    // In development, allow query params for navigation
    if (import.meta.env.DEV) {
      const params = new URLSearchParams(window.location.search)
      if (params.get('skipIntro') === '1') {
        setEntered(true)
        setShowDashboard(true)
      }
    }
  }, [])

  const handleEnter = () => {
    setEntered(true)
    // Delay dashboard appearance for smooth transition
    setTimeout(() => {
      setShowDashboard(true)
    }, 500) // 500ms delay after intro completes
  }


  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminPage />
      case 'dashboard':
      default:
        return <NewDashboard />
    }
  }

  return (
    <SolanaWalletProvider>
      <SIWSProvider>
        {!entered && currentPage !== 'admin' ? (
          <IntroSequence onEnter={handleEnter} />
        ) : (
          <div 
            className={`dashboard-fade-in transition-opacity duration-1000 ease-out ${
              showDashboard || currentPage === 'admin' ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundColor: '#000' }}
          >
            {renderCurrentPage()}
          </div>
        )}
      </SIWSProvider>
    </SolanaWalletProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
)
