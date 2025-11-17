import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import ReportDetail from './pages/ReportDetail'
import { supabase } from './supabaseClient'
import { useState, useEffect } from 'react'
import FormReport from './pages/FormReport'
import AdminReportDetail from './pages/AdminReportDetail'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading...
      </div>
    )
  if (!user) return <Navigate to="/admin" replace />

  return children
}

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000)
    const handleLoad = () => {
      clearTimeout(timeout)
      setLoading(false)
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      window.removeEventListener('load', handleLoad)
      clearTimeout(timeout)
    }
  }, [])

  // --- 🔔 Realtime Notifikasi Laporan ---
  useEffect(() => {
    // Request izin notifikasi browser
    if (Notification.permission !== 'granted') {
      Notification.requestPermission()
    }

    // Subscribe ke Supabase Realtime untuk tabel "reports"
    const subscription = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        payload => {
          console.log('Laporan baru:', payload.new)
          showNotification(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const showNotification = report => {
    // In-app toast
    toast.info(`Laporan baru: ${report.title}`)

    // Browser push notification
    if (Notification.permission === 'granted') {
      new Notification('Laporan Baru Masuk!', {
        body: report.description,
        icon: '/logo-jejak.png',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <img src="/logo-jejak.png" alt="Loading..." className="animate-pulse w-24 opacity-90" />
      </div>
    )
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form-report" element={<FormReport />} />
          <Route
            path="/dashboard"
            element={<PrivateRoute><AdminDashboard /></PrivateRoute>}
          />
          <Route
            path="/dashboard/report/:id"
            element={<PrivateRoute><AdminReportDetail /></PrivateRoute>}
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/report/:id" element={<ReportDetail />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  )
}

export default App
