import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const [reports, setReports] = useState([])

  const fetchReports = async () => {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
    setReports(data)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('reports').update({ status }).eq('id', id)
    fetchReports()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/admin'
  }

  useEffect(() => { fetchReports() }, [])

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Dashboard Admin</h1>
      <button onClick={handleLogout} className="bg-red-500 text-white px-2 rounded mb-3">Logout</button>

      {reports.map(r => (
        <div key={r.id} className="border p-3 rounded mb-3">
          <h2 className="font-semibold">{r.title}</h2>
          <p>{r.description}</p>
          <p>Kategori: {r.category}</p>
          <p>Status: {r.status}</p>
          <p>Lokasi: {r.location_lat}, {r.location_lng}</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => updateStatus(r.id, 'Proses')} className="bg-yellow-500 text-white px-2 rounded">Proses</button>
            <button onClick={() => updateStatus(r.id, 'Selesai')} className="bg-green-500 text-white px-2 rounded">Selesai</button>
          </div>
        </div>
      ))}
    </div>
  )
}
