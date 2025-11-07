import { Link } from 'react-router-dom'
import FormReport from '../components/FormReport'

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-10">SmartPublic</h1>
      
      <h3 className='text-center'><Link to="/reports">Klik untuk lihat laporan masalah yang ada</Link></h3>
      <p className="text-center mt-2 text-gray-600">AI-Powered Public Report System</p>
      <FormReport />
    </div>
  )
}
