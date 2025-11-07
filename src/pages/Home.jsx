import FormReport from '../components/FormReport'

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-10">SmartPublic</h1>
      
      <h3 className='text-center'><a href="http://localhost:5173/reports">Lihat laporan masalah yang ada</a></h3>
      <p className="text-center mt-2 text-gray-600">AI-Powered Public Report System</p>
      <FormReport />
    </div>
  )
}
