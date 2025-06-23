import React, { lazy, Suspense, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { SolanaWalletProvider } from './lib/SolanaWalletProvider'
import { SIWSProvider } from './lib/useSIWS'
import { useIntroGate } from './intro/useIntroGate'
import { NewDashboard } from './components/Dashboard/NewDashboard'
import { AdminPage } from './components/AdminPanel/AdminPage'
import { IntroSequence } from './components/IntroSequence'
import './index.css'
import { AssetsPreloader } from './intro/AssetsPreloader'

const IntroExperience = lazy(() => import('./intro/IntroExperience'))

function App() {
  const { introSeen, markIntroSeen } = useIntroGate()
  const [sessionIntroCompleted, setSessionIntroCompleted] = useState(false);

  const hasSeenIntro = introSeen || sessionIntroCompleted;

  const handleIntroFinish = (savePreference: boolean) => {
    if (savePreference) {
      markIntroSeen();
    }
    setSessionIntroCompleted(true);
  };

  return (
    <Router>
      <Suspense fallback={<div className="w-screen h-screen bg-black" />}>
        <AssetsPreloader />
        <Routes>
          <Route 
            path="/intro" 
            element={
              !hasSeenIntro ? (
                <IntroExperience onIntroFinish={handleIntroFinish} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              hasSeenIntro ? (
                <MainApplication />
              ) : (
                <Navigate to="/intro" replace />
              )
            } 
          />
          <Route path="/admin" element={<AdminPage />} />
          {/* A catch-all for any other routes, can redirect to home or a 404 page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

// This component handles the logic for post-cinematic-intro flow
function MainApplication() {
  const [entered, setEntered] = useState(false)

  if (!entered) {
    return <IntroSequence onEnter={() => setEntered(true)} />
  }

  return (
    <SolanaWalletProvider>
      <SIWSProvider>
        <NewDashboard />
        <Toaster />
      </SIWSProvider>
    </SolanaWalletProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
