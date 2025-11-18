import { useEffect, useState, useMemo, useRef } from 'react'
import { supabase } from '../supabaseClient'
import headerAdminIcon from '/assets/header-admin.svg'
import logoutIcon from '/assets/logout.svg'
import searchIcon from '/assets/search.svg'
import calendarIcon from '/assets/calendar.svg'
import locationIcon from '/assets/location.svg'
import BottomNav from '../components/BottomNav'
import { Link } from 'react-router-dom'
import CustomSelect from '../components/CustomSelect'

export default function Dashboard() {

  // 🔥 LAZY LOAD STATE
  const LIMIT = 6
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef(null)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [active, setActive] = useState("Semua")
  const tabs = ["Semua", "Baru", "Proses", "Selesai"]
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState("")

  // Filter kategori & prioritas
  const [filterCategory, setFilterCategory] = useState("Semua")
  const [filterPriority, setFilterPriority] = useState("Semua")

  // Priority labels
  const priorityLabels = {
    5: "Tinggi",
    4: "Sedang-Tinggi",
    3: "Sedang",
    2: "Rendah-Sedang",
    1: "Rendah",
  }

  const priorityOptions = [
    "Semua",
    ...Object.entries(priorityLabels)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([_, label]) => label)
  ]

  // 🔥 FETCH PAGINATED DATA
  const fetchReports = async () => {
    try {
      const start = page * LIMIT
      const end = start + LIMIT - 1

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .range(start, end)

      if (error) throw error

      if (!data || data.length === 0) {
        setHasMore(false)
        return
      }

      // merge tanpa duplicate
      setReports(prev => {
        const ids = new Set(prev.map(r => r.id))
        const merged = [...prev]
        data.forEach(item => {
          if (!ids.has(item.id)) merged.push(item)
        })
        return merged
      })
    } catch (err) {
      console.error("Lazy load error:", err)
      setError("Gagal memuat laporan")
    } finally {
      setLoading(false)
    }
  }

  // first load
  useEffect(() => {
    fetchReports()
  }, [page])

  // User fetch
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
  }, [])

  // 🔥 INTERSECTION OBSERVER (infinite scroll)
  useEffect(() => {
    if (!hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1)
        }
      },
      { threshold: 1 }
    )

    if (loaderRef.current) observer.observe(loaderRef.current)

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [hasMore])

  // Totals
  const totals = useMemo(() => {
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

  // Dynamic categories
  const categories = useMemo(() => {
    const cats = reports.map(r => r.category).filter(Boolean)
    return ["Semua", ...Array.from(new Set(cats))]
  }, [reports])

  // Full filtering
  const filteredReports = useMemo(() => {
    let list = [...reports]

    const q = debouncedSearch.toLowerCase()

    if (active !== "Semua") {
      list = list.filter((r) => {
        const s = (r.status ?? "").toLowerCase()
        if (active === "Baru") return s === "diterima"
        return s === active.toLowerCase()
      })
    }

    if (q) {
      list = list.filter((r) =>
        (r.title ?? "").toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        (r.address ?? "").toLowerCase().includes(q)
      )
    }

    if (filterCategory !== "Semua") {
      list = list.filter((r) => r.category === filterCategory)
    }

    if (filterPriority !== "Semua") {
      const numKey = Object.keys(priorityLabels).find(
        key => priorityLabels[key] === filterPriority
      )
      list = list.filter((r) => Number(r.priority) === Number(numKey))
    }

    return list
  }, [reports, debouncedSearch, active, filterCategory, filterPriority])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/admin"
  }

  const formatName = (email) => {
    if (!email) return ""
    const name = email.split("@")[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  return (
    <div className="max-w-md mx-auto relative pb-32">
      <header className="relative">
        <img src={headerAdminIcon} alt="Header Admin" className="drop-shadow-md" />
        <h1 className="text-2xl poppins-semibold py-2 px-5">Dashboard Admin</h1>

        {user?.email && (
          <h1 className="text-lg font-semibold -mt-2 px-5">
            Hai, {formatName(user.email)}👋
          </h1>
        )}

        <div
          className="bg-[#0A3B44] drop-shadow-md w-fit rounded-lg p-2 absolute right-10 top-12 cursor-pointer"
          onClick={handleLogout}
        >
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
              className={`p-4 rounded-2xl text-left shadow-md transition-all ${
                active === tab ? "bg-[#004D4D] text-white" : "bg-white text-[#004D4D]"
              }`}
            >
              <p className="text-md font-semibold">{tab}</p>
              <p className="text-xl poppins-regular mt-1">
                {totals[tab.toLowerCase()] ?? totals.total}
              </p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-6 relative w-full max-w-sm">
          <img
            src={searchIcon}
            alt="Search icon"
            className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 opacity-60"
          />
          <input
            type="text"
            placeholder="Cari laporan"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border h-11 border-gray-300 rounded-4xl focus:ring-2 focus:ring-[#006d6d] focus:outline-none"
          />
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700">Kategori</label>
            <CustomSelect
              value={filterCategory}
              onChange={setFilterCategory}
              options={categories}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700">Prioritas</label>
            <CustomSelect
              value={filterPriority}
              onChange={setFilterPriority}
              options={priorityOptions}
            />
          </div>
        </div>

        {/* List Laporan */}
        <div className="list-report mt-6">
          <h1 className="text-xl poppins-semibold">
            {active === "Semua" ? "Semua Laporan" : "Laporan " + active}
          </h1>

          {filteredReports.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Tidak ada laporan {debouncedSearch ? `untuk "${debouncedSearch}"` : ""}
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
                        <span
                          className={`absolute top-2 right-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
                            r.status === "Selesai"
                              ? "bg-green-400/50 border-green-400 text-green-800"
                              : r.status === "Proses"
                              ? "bg-yellow-400/50 border-yellow-400 text-yellow-800"
                              : "bg-gray-400/50 border-gray-400 text-gray-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    )}

                    <div className="p-4">
                      <h2 className="poppins-semibold text-base truncate w-[70vw]">
                        {r.title}
                      </h2>
                      <p className="text-gray-600 text-sm truncate w-[70vw]">
                        {r.description}
                      </p>

                      <div className="text-xs text-gray-400 mt-2 gap-4">
                        <div className="flex items-center gap-1">
                          <img src={locationIcon} alt="Lokasi" className="h-4.5 w-4.5" />
                          <span className="truncate w-[70vw]">{r.address}</span>
                        </div>
                        <div className="flex items-center mt-2 gap-1">
                          <img src={calendarIcon} alt="Kalender" className="h-4.5 w-4.5" />
                          <span>
                            {new Date(r.created_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 🔥 Loader sentinel untuk infinite scroll */}
          {hasMore && (
            <div ref={loaderRef} className="py-10 text-center text-gray-400">
              Memuat lebih banyak...
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
