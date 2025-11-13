import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import PublicReports from './pages/PublicReports'
import ReportDetail from './components/ReportDetail'
import { supabase } from './supabaseClient'
import { useState, useEffect } from 'react'
import FormReport from './pages/FormReport'

function PrivateRoute({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) console.error(error)
      setUser(data?.user ?? null)
      setLoading(false)
    }

    getUser()

    // ✅ Listen perubahan login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth event:', _event)
      setUser(session?.user ?? null)
    })

    // cleanup listener saat komponen unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/admin" replace />

  return children
}



function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleLoad = () => setLoading(false)
    window.addEventListener('load', handleLoad)
    return () => window.removeEventListener('load', handleLoad)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin w-10 h-10 border-4 border-[#004d4d] border-t-transparent rounded-full"></div>
      </div>
    )
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form-report" element={<FormReport />} />
        <Route path="/dashboard" element={<PrivateRoute>
          <Dashboard />
          </PrivateRoute>} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/reports" element={<PublicReports />} />
        <Route path="/report/:id" element={<ReportDetail />} />
      </Routes>
    </Router>
  )
}

export default App
