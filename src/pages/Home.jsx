import { Link } from 'react-router-dom'
import FormReport from '../components/FormReport'

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-10">Coming Soon</h1>
      <Link to="/form-report"><p className="text-center">Buat Laporan</p></Link>
    </div>
  )
}
