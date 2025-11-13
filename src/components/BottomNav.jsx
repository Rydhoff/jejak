import { Link, useLocation } from "react-router-dom"
import plusIcon from "/assets/plus.svg"
import homeColor from "/assets/home-color.svg"
import homeGray from "/assets/home-gray.svg"
import personColor from "/assets/person-color.svg"
import personGray from "/assets/person-gray.svg"
import bottomNavIcon from "/assets/bottom-nav.svg"

export default function BottomNav() {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <nav className="fixed -bottom-1">
      <div className="relative flex justify-center">
        {/* Tombol + */}
        <div className="absolute -top-9 z-10 bg-linear-to-b from-[#1691AC] to-[#093B46] rounded-full p-1 drop-shadow-[0_0_10px_rgba(0,0,0,.2)] active:scale-95 transition">
          <Link to="/form-report">
            <img src={plusIcon} alt="Buat Laporan" className="w-12.5" />
          </Link>
        </div>

        {/* Background Navbar */}
        <img
          src={bottomNavIcon}
          alt="Bottom Navbar"
          className="w-full drop-shadow-[0_-4px_10px_rgba(0,0,0,0.125)]"
        />

        {/* Tombol navigasi kiri-kanan */}
        <div className="absolute bottom-3 w-full flex justify-around px-8 text-xs text-gray-400">
          {/* Tombol Home */}
          <Link to="/" className="flex flex-col items-center">
            <img
              src={currentPath === "/" ? homeColor : homeGray}
              alt="Home"
              className="w-6"
            />
            <span
              className={`${
                currentPath === "/"
                  ? "bg-linear-to-b from-[#1691AC] to-[#093B46] bg-clip-text text-transparent font-semibold"
                  : "text-gray-400"
              }`}
            >
              Home
            </span>
          </Link>

          {/* Spacer tengah biar tombol + nggak ketimpa */}
          <div className="w-14" />

          {/* Tombol Admin */}
          <Link to="/dashboard" className="flex flex-col items-center">
            <img
              src={currentPath === "/admin" || currentPath === "/dashboard" ? personColor : personGray}
              alt="Admin"
              className="w-6"
            />
            <span
              className={`${
                currentPath === "/admin" || currentPath === "/dashboard"
                  ? "bg-linear-to-b from-[#1691AC] to-[#093B46] bg-clip-text text-transparent font-semibold"
                  : "text-gray-400"
              }`}
            >
              Admin
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
