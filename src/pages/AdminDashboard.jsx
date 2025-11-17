import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import headerAdminIcon from '/assets/header-admin.svg'
import logoutIcon from '/assets/logout.svg'
import searchIcon from '/assets/search.svg'
import calendarIcon from '/assets/calendar.svg'
import locationIcon from '/assets/location.svg'
import BottomNav from '../components/BottomNav'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [active, setActive] = useState("Semua")
  const tabs = ["Semua", "Baru", "Proses", "Selesai"]
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState("")

  // Filter tambahan
  const [filterCategory, setFilterCategory] = useState("Semua")
  const [filterPriority, setFilterPriority] = useState("Semua")

  // Fetch reports & user
  useEffect(() => {
    let mounted = true

    const fetchReports = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        if (mounted) setReports(data ?? [])
      } catch (err) {
        console.error('Fetch reports error:', err)
        if (mounted) setError('Gagal memuat laporan')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchReports()

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
    }
    fetchUser()

    return () => { mounted = false }
  }, [])

  // Compute totals for tabs
  const totals = useMemo(() => {
    if (!reports) return {}
    return {
      total: reports.length,
      baru: reports.filter(r => (r.status ?? "").toLowerCase() === "diterima").length,
      proses: reports.filter(r => (r.status ?? "").toLowerCase() === "proses").length,
      selesai: reports.filter(r => (r.status ?? "").toLowerCase() === "selesai").length,
    }
  }, [reports])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  // Kategori dinamis
  const categories = useMemo(() => {
    const cats = reports.map(r => r.category).filter(Boolean)
    return ["Semua", ...Array.from(new Set(cats))]
  }, [reports])

  // Priority labels
  const priorityLabels = {
    1: "Rendah",
    2: "Rendah-Sedang",
    3: "Sedang",
    4: "Sedang-Tinggi",
    5: "Tinggi",
  }

  // Compute filtered reports
  const filteredReports = useMemo(() => {
    if (!reports || reports.length === 0) return []

    const q = debouncedSearch.toLowerCase()

    return reports.filter((r) => {
      // Tab/status filter
      if (active !== 'Semua') {
        const status = (r.status ?? '').toLowerCase()
        if (active === 'Baru' && status !== 'diterima') return false
        if (active !== 'Baru' && status !== active.toLowerCase()) return false
      }

      // Search filter
      if (q) {
        const inTitle = (r.title ?? '').toLowerCase().includes(q)
        const inDesc = (r.description ?? '').toLowerCase().includes(q)
        const inAddr = (r.address ?? '').toLowerCase().includes(q)
        if (!inTitle && !inDesc && !inAddr) return false
      }

      // Category filter
      if (filterCategory !== "Semua" && r.category !== filterCategory) return false

      // Priority filter
      if (filterPriority !== "Semua" && r.priority !== Number(filterPriority)) return false

      return true
    })
  }, [reports, debouncedSearch, active, filterCategory, filterPriority])

  const updateStatus = async (id, status) => {
    await supabase.from('reports').update({ status }).eq('id', id)
    // Refetch reports
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
    setReports(data ?? [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/admin'
  }

  const formatName = (email) => {
    if (!email) return ""
    const namePart = email.split("@")[0]
    return namePart.charAt(0).toUpperCase() + namePart.slice(1)
  }

  return (
    <div className="max-w-md mx-auto relative pb-32">
      <header className="relative">
        <img src={headerAdminIcon} alt="Header Admin" className="drop-shadow-md" />
        <h1 className="text-2xl poppins-semibold py-2 px-5">Dashboard Admin</h1>
        {user.email && <h1 className="text-lg font-semibold -mt-2 px-5">Hai, {formatName(user.email)}👋</h1>}
        <div className="bg-[#0A3B44] drop-shadow-md w-fit rounded-lg p-2 absolute right-10 top-12 cursor-pointer" onClick={handleLogout}>
          <img src={logoutIcon} alt="Logout" className="h-5" />
        </div>
      </header>

      <div className="flex flex-col py-2 px-5">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`p-4 rounded-2xl text-left shadow-md transition-all ${active === tab ? "bg-[#004D4D] text-white" : "bg-white text-[#004D4D]"}`}
            >
              <p className="text-md font-semibold">{tab === "Baru" ? "Baru" : tab}</p>
              <p className="text-xl poppins-regular mt-1">{totals[tab.toLowerCase()] ?? totals.total}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-6 relative w-full max-w-sm">
          <img src={searchIcon} alt="Search icon" className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 opacity-60" />
          <input
            type="text"
            placeholder="Cari laporan"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border h-11 border-gray-300 rounded-4xl focus:ring-2 focus:ring-[#006d6d] focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 mt-4">
          {/* Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 border rounded-lg py-2 px-3 focus:ring-1 focus:ring-[#006d6d]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="flex-1 border rounded-lg py-2 px-3 focus:ring-1 focus:ring-[#006d6d]"
          >
            <option>Semua</option>
            {Object.entries(priorityLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* List Laporan */}
        <div className="list-report mt-6">
          <h1 className="text-xl poppins-semibold">{active === "Semua" ? "Semua Laporan" : "Laporan " + active}</h1>

          {loading ? (
            <div className="py-8 flex justify-center text-gray-500">Memuat laporan...</div>
          ) : error ? (
            <div className="py-8 text-red-500">{error}</div>
          ) : filteredReports.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Tidak ada laporan {debouncedSearch ? `untuk "${debouncedSearch}"` : ''}
            </div>
          ) : (
            <div className="max-w-md mx-auto mt-5 flex flex-col gap-5">
              {filteredReports.map((r) => (
                <Link to={`report/${r.id}`} key={r.id}>
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg">
                    {r.photo_url && (
                      <div className="relative">
                        <img
                          src={`https://xepaobgjnetmybdlahdm.supabase.co/storage/v1/object/public/reports/${r.photo_url}`}
                          alt="report"
                          className="w-full h-36 object-cover"
                        />
                        <span className={`absolute top-2 scale-95 right-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
                          r.status === "Selesai" ? "bg-green-400/50 border-green-400 text-green-800"
                            : r.status === "Proses" ? "bg-yellow-400/50 border-yellow-400 text-yellow-800"
                            : "bg-gray-400/50 border-gray-400 text-gray-700"
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    )}

                    <div className="p-4">
                      <h2 className="poppins-semibold text-base truncate w-[70vw]">{r.title}</h2>
                      <p className="text-gray-600 text-sm truncate w-[70vw]">{r.description}</p>

                      <div className="text-xs text-gray-400 mt-2 gap-4">
                        <div className="flex items-center gap-1">
                          <img src={locationIcon} alt="Lokasi" className="h-4.5 w-4.5" />
                          <span className="truncate w-[70vw]">{r.address}</span>
                        </div>
                        <div className="flex items-center mt-2 gap-1">
                          <img src={calendarIcon} alt="Kalender" className="h-4.5 w-4.5" />
                          <span>{new Date(r.created_at).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
