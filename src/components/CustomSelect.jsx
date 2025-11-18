import { useState, useRef, useEffect } from "react";

export default function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // klik luar untuk close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // tentukan warna button sesuai value
  let buttonColorClass = "bg-white text-gray-700";
  if (value === "Baru") buttonColorClass = "bg-gray-100 text-gray-700";
  if (value === "Proses") buttonColorClass = "bg-orange-100 text-orange-700";
  if (value === "Selesai") buttonColorClass = "bg-green-100 text-green-700";

  return (
    <div ref={wrapperRef} className="relative w-full mt-2">
      {/* Select box */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full text-left px-4 py-2 rounded-xl 
                    flex justify-between items-center text-sm shadow-sm p-2 h-13 border border-gray-200 outline-none 
                    focus:ring-1 focus:ring-[#2a8087] focus:border-[#2a8087] transition ${buttonColorClass}`}
      >
        {value}
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg
                    py-2 z-10 animate-fadeIn w-full p-2 text-sm border border-gray-200
                    max-h-[27vh] overflow-y-auto scrollbar-thin"
        >
          {options.map((opt) => {
            // hanya beri warna jika sedang dipilih
            let selectedColorClass = "";
            if (value === opt) {
              if (opt === "Diterima") selectedColorClass = "bg-gray-100 text-gray-700";
              if (opt === "Proses") selectedColorClass = "bg-orange-100 text-orange-700";
              if (opt === "Selesai") selectedColorClass = "bg-green-100 text-green-700";
            }

            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer text-sm rounded-lg transition hover:bg-gray-100 ${selectedColorClass}`}
              >
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
