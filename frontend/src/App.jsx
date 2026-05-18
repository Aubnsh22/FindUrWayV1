import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './lib/AuthContext.jsx'
import Navbar from './components/layout/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import InsightsPage from './pages/InsightsPage.jsx'
import SavedJobsPage from './pages/SavedJobsPage.jsx'
import SkillTestPage from './pages/SkillTestPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import BackgroundDecorations from './components/ui/BackgroundDecorations.jsx'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen relative" style={{ background: 'var(--color-void)' }}>
          <BackgroundDecorations />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/saved" element={<SavedJobsPage />} />
              <Route path="/test" element={<SkillTestPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(17, 17, 34, 0.9)',
              backdropFilter: 'blur(20px)',
              color: '#F0F0F5',
              border: '1px solid rgba(0, 240, 255, 0.1)',
              borderRadius: '14px',
              fontSize: '13px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(0, 240, 255, 0.03)',
            },
          }}
        />
      </div>
      </AuthProvider>
    </Router>
  )
}
