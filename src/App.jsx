import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useEffect, useState } from 'react'

// pages
import Home from './pages/Home'
import FormReport from './pages/FormReport'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import ReportDetail from './pages/ReportDetail'
import AdminReportDetail from './pages/AdminReportDetail'

function PrivateRoute({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
      setLoading(false)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) return <div className="flex justify-center p-10">Loading...</div>
  if (!user) return <Navigate to="/admin" replace />

  return children
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form-report" element={<FormReport />} />
        <Route path="/admin" element={<AdminLogin />} />

        <Route path="/dashboard" element={
          <PrivateRoute><AdminDashboard /></PrivateRoute>
        } />

        <Route path="/dashboard/report/:id" element={
          <PrivateRoute><AdminReportDetail /></PrivateRoute>
        } />

        <Route path="/report/:id" element={<ReportDetail />} />
      </Routes>
    </Router>
  )
}

export default App
