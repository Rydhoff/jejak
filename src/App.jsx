import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
  // --- Realtime Notif
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission()
    }

    const sub = supabase
      .channel("report-insert")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        payload => showNotification(payload.new)
      )
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [])

  const showNotification = async (report) => {
    // Notif in-app
    toast.info(`Laporan masuk: ${report.title}`)

    // Push notif via service worker
    if (Notification.permission === "granted") {
      const registration = await navigator.serviceWorker.getRegistration()
      registration?.showNotification("Laporan Baru Masuk!", {
        body: report.description,
        icon: "/logo-jejak.png",
        vibrate: [200, 100, 200],
      })
    }
  }

  return (
    <>
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

      <ToastContainer position="top-right" autoClose={5000} />
    </>
  )
}

export default App
