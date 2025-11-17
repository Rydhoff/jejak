import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import ReportDetail from './pages/ReportDetail'
import { supabase } from './supabaseClient'
import { useState, useEffect } from 'react'
import FormReport from './pages/FormReport'
import AdminReportDetail from './pages/AdminReportDetail'

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
      // console.log('Auth event:', _event)
      setUser(session?.user ?? null)
    })

    // cleanup listener saat komponen unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-gray-500">Loading...</div>
  if (!user) return <Navigate to="/admin" replace />

  return children
}



function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ⏱ Safety fallback: walaupun window.load gagal, tetap hentikan loading setelah 2 detik
    const timeout = setTimeout(() => setLoading(false), 2000)

    // ✅ Kalau semua resource sudah selesai load, hentikan lebih cepat
    const handleLoad = () => {
      clearTimeout(timeout)
      setLoading(false)
    }

    if (document.readyState === 'complete') {
      // Kalau dokumen sudah siap sebelum listener dibuat
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      window.removeEventListener('load', handleLoad)
      clearTimeout(timeout)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <img src="/logo-jejak.png" alt="Loading..." className="animate-pulse w-24 opacity-90" />
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form-report" element={<FormReport />} />
        <Route path="/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/dashboard/report/:id" element={<PrivateRoute><AdminReportDetail /></PrivateRoute>} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/report/:id" element={<ReportDetail />} />
      </Routes>
    </Router>
  )
}

export default App
