import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import backIcon from '/assets/back.svg'

export default function ReportDetail() {
  const { id } = useParams()
  const [report, setReport] = useState(null)

  useEffect(() => {
    const fetchReport = async () => {
      const { data } = await supabase.from('reports').select('*').eq('id', id).single()
      setReport(data)
    }
    fetchReport()
  }, [id])

  if (!report) return <p>Loading...</p>

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
        
    </div>
  )
}
