import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

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
    <div className="max-w-md mx-auto mt-10 p-5 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-3">{report.title}</h1>
      <p>{report.description}</p>
      <p>Kategori: {report.category}</p>
      <p>Status: {report.status}</p>
      <p>Lokasi: {report.location_lat}, {report.location_lng}</p>
      <p>Hash Blockchain: {report.blockchain_hash}</p>
      {report.photo_url && <img src={`https://luywtsbirmuuyhabcdvv.supabase.co/storage/v1/object/public/reports/${report.photo_url}`} alt="report" className="mt-3 w-full rounded"/>}
    </div>
  )
}
