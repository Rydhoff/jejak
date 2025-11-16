import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import backIcon from '/assets/back.svg'
import updateIcon from '/assets/update.svg'
import atminPusing from '/jiah.png'

export default function AdminReportDetail() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [status, setStatus] = useState(report?.status || "")
  const [response, setResponse] = useState(report?.response || "")
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    const fetchReport = async () => {
      const { data } = await supabase.from('reports').select('*').eq('id', id).single()
      setReport(data)
    }
    fetchReport()
  }, [id])

  if (!report) return <p>Loading...</p>

  const handleUpdate = async () => {
    setLoading(true);

    const { error } = await supabase
      .from('reports')
      .update({
        status: status,
        response: response
      })
      .eq('id', report.id);

    setLoading(false);

    if (!error) {
      alert("Laporan berhasil diupdate!");
      setShowModal(false);

      // Refresh data
      setReport({ ...report, status, response });
    } else {
      alert("Gagal update laporan");
    }
  };

  return (
    <div className="max-w-md mx-auto relative">
      <nav className="flex items-center justify-center h-15 bg-[#0A3B44] rounded-bl-2xl rounded-br-2xl sticky top-0 w-full shadow-md z-10">
       <Link to="/">
          <div className="back-button absolute left-5 top-4 text-white bg-[#0E5D62] rounded-md p-1">
            <img src={backIcon} alt="Back" className="w-5 h-5 relative right-0.5" />
          </div>
       </Link>
        <h1 className="text-lg font-semibold mb-4 text-white text-center relative top-2 poppins-semibold">Detail Laporan</h1>
      </nav>
      {report.photo_url && <img src={`https://xepaobgjnetmybdlahdm.supabase.co/storage/v1/object/public/reports/${report.photo_url}`} alt="report" className="w-full -mt-4 h-74 object-cover"/>}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden p-5 m-4 relative -top-12">
          <h1 className="poppins-semibold text-lg">{report.title}</h1>
          <div className="text-xs mt-1">
            <div className="mt-1">
              {/* <img src={locationIcon} alt="Lokasi" className="h-4.5 w-4.5" /> */}
              <span className="">Pelapor : {report.name}</span>
            </div>
            <div className="mt-1">
              {/* <img src={locationIcon} alt="Lokasi" className="h-4.5 w-4.5" /> */}
              <span className="">Kontak : {report.contact}</span>
            </div>
            <div className="mt-1">
              {/* <img src={calendarIcon} alt="Kalender" className="h-4.5 w-4.5" /> */}
              <span>
                Tanggal : {new Date(report.created_at).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="mt-1">
                {/* <img src={locationIcon} alt="Lokasi" className="h-4.5 w-4.5" /> */}
                <span className="">Kategori : {report.category}</span>
              </div>
              <div className="mt-1">
                {/* <img src={locationIcon} alt="Lokasi" className="h-4.5 w-4.5" /> */}
                <span className="">Status : {report.status}</span>
              </div>
               <div className="mt-1">
              {/* <img src={locationIcon} alt="Lokasi" className="h-4.5 w-4.5" /> */}
              <span className="">Lokasi : {report.address}</span>
            </div>
            </div>
            
            
          </div>
          <h1 className="poppins-semibold text-md mt-3">Deskripsi</h1>
          <p className="text-xs whitespace-pre-line">{report.description}</p>

          <h1 className="poppins-semibold text-md mt-3">Tanggapan</h1>
          <p className="text-xs">{report.response ? report.response : "-" }</p>
        </div>
        
        <nav className="fixed bottom-0 left-0 w-full">
          <div className="relative flex justify-center items-center">
            {/* Tombol Update */}
            <div onClick={() => setShowModal(true)} className="absolute -top-20 bg-[#093B46] rounded-full px-7 py-3 drop-shadow-[0_0_10px_rgba(0,0,0,.2)] active:scale-95 transition">
              <div className="text-white font-semibold flex">
                <img src={updateIcon} alt="Update" /><p className="ml-2">Update Laporan</p>
              </div>
            </div>
          </div>
        </nav>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-5 w-11/12 max-w-md">

              {/* <h1 className="poppins-semibold text-lg mb-2">Update Laporan</h1> */}

              {/* <p className="text-xs">
                {report.title}
              </p>
              <p className="text-xs mb-4">
                {report.address}
              </p> */}
              <h1 className="font-bold text-xl text-center">YANG BENER AJAA</h1>
              <h1 className="font-bold text-xl text-center">BELUM BERES ATMIN PUSINK</h1>

              <img src={atminPusing} alt="Pucink" />

              {/* STATUS
              <label className="text-sm font-semibold">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 mt-1 border rounded-xl text-sm focus:outline-none"
              >
                <option value="Baru">Baru</option>
                <option value="Proses">Proses</option>
                <option value="Selesai">Selesai</option>
              </select>

              TANGGAPAN
              <label className="text-sm font-semibold mt-4 block">Tanggapan Admin</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Tulis tanggapan admin..."
                className="w-full h-28 p-3 mt-1 border rounded-xl text-sm focus:outline-none resize-none"
              /> */}

              {/* BUTTON */}
              {/* <button
                className="w-full cursor-pointer bg-[#093B46] text-white p-3 rounded-xl mt-4 flex items-center justify-center active:scale-95 transition"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim"}
              </button> */}
              <button
                className="w-full cursor-pointer bg-[#093B46] text-white p-3 rounded-xl mt-4 flex items-center justify-center active:scale-95 transition"
                onClick={() => {
                  const phone = "62895324443540"; // wajib pakai kode negara
                  const text = encodeURIComponent("Hai Mas Gantengg 😍");
                  window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
                }}
              >
                Kirim
              </button>

              {/* CLOSE */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full text-center text-md mt-2 text-gray-500 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}
    </div>
  )
}
