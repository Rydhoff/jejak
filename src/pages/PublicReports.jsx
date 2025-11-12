import { useEffect, useState } from 'react'
import { supabase, supaPublish, supaUrl } from '../supabaseClient'
import ReportCard from '../components/ReportCard'

export default function PublicReports() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    const fetchReports = async () => {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
      console.log(supaUrl, supaPublish)
      setReports(data)
    }
    fetchReports()
  }, [])

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Laporan Publik</h1>
      {reports.map(r => (
        <ReportCard report={r} key={r.id} />
      ))}
    </div>
  )
}
