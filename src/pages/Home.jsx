import { Link } from 'react-router-dom'
import headerHomeIcon from '/assets/header-home.svg'
import searchIcon from '/assets/search.svg'
import calendarIcon from '/assets/calendar.svg'
import locationIcon from '/assets/location.svg'
import plusIcon from '/assets/plus.svg'
import logoJejak from '/logo-jejak.png'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Home() {
  const [search, setSearch] = useState("")
  const [active, setActive] = useState("Semua");
  const tabs = ["Semua", "Baru", "Proses", "Selesai"];
  const [reports, setReports] = useState([])

  useEffect(() => {
    const fetchReports = async () => {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
      setReports(data)
    }
    fetchReports()
  }, [])

  return (
    <div className="max-w-md mx-auto relative">
      <header className="relative" >
        <img src={headerHomeIcon} alt="Header Home" className="drop-shadow-md" />
        <img src={logoJejak} alt="Logo Jejak" className="h-22 absolute top-8 left-10" />
        <p className="text-sm poppins-semibold absolute top-26 left-8" >Tinggalkan Jejak, Wujudkan Perubahan</p>
      </header>

      <div className="flex flex-col py-2 px-5">
          {/* Search */}
          <div className="mt-12 relative w-full max-w-sm">
            <img
              src={searchIcon} // ganti dengan path ikon kamu
              alt="Search icon"
              className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 opacity-60"
            />

            <input
              type="text"
              placeholder="Cari laporan"
              value={search}
              onChange={e => setSearch(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-2 border h-11 border-gray-300 rounded-4xl focus:ring-2 focus:ring-[#006d6d] focus:outline-none"
            />
          </div>

          {/* Opsi sortir data laporan */}
          <div className="flex justify-between w-full mt-7">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-4 py-1 rounded-full cursor-pointer border text-sm font-semibold transition-all duration-200 
                  ${
                    active === tab
                      ? "bg-[#004d4d] text-white border-[#004d4d] cursor-pointer"
                      : "bg-white text-[#004d4d] border-[#004d4d] hover:bg-[#004d4d]/10 cursor-pointer"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List Laporan */}
          <div className="list-report mt-6">
            <h1 className="text-xl poppins-semibold">{active == "Semua" ? "Semua Laporan" : "Laporan " + active  }</h1>
            <div className="max-w-md mx-auto mt-5 flex flex-col gap-5">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg"
              >
                {/* Gambar */}
                {r.photo_url && (
                  <div className="relative">
                    <img
                      src={`https://xepaobgjnetmybdlahdm.supabase.co/storage/v1/object/public/reports/${r.photo_url}`}
                      alt="report"
                      className="w-full h-36 object-cover"
                    />
                    {/* Label status di pojok kanan atas */}
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full ${
                        r.status === "Selesai"
                          ? "bg-green-500 text-white"
                          : r.status === "Proses"
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-300 text-gray-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                )}

                {/* Isi */}
                <div className="p-4">
                  <h2 className="poppins-semibold text-base truncate w-[70vw]">{r.title}</h2>
                  <p className="text-gray-600 text-sm truncate w-[70vw]">{r.description}</p>

                  {/* Lokasi dan tanggal */}
                  <div className=" text-xs text-gray-400 mt-2 gap-4">
                    <div className="flex items-center gap-1">
                      <img src={locationIcon} alt="Lokasi" className="h-4.5 w-4.5 " />
                      <span className="truncate w-[70vw]">{r.address}</span>
                    </div>
                    <div className="flex items-center mt-2 gap-1">
                      <img src={calendarIcon} alt="Kalender" className="h-4.5 w-4.5 " />
                      <span className="">
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
              ))}
            </div>
          </div>

      </div>

     <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-linear-to-b from-[#1691AC] to-[#093B46] rounded-full shadow-lg p-1">
        <Link to="/form-report"><img src={plusIcon} alt="Buat Laporan" className="w-14" /></Link>
      </div>
    
    </div>
  )
}

