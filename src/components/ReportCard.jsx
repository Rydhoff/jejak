export default function ReportCard({ report }) {
  return (
    <div className="border p-3 rounded mb-3">
      <h2 className="font-semibold">{report.title}</h2>
      <p>{report.description}</p>
      <p>Kategori: {report.category}</p>
      <p>Status: {report.status}</p>
      <p>Hash Blockchain: {report.blockchain_hash}</p>
    </div>
  )
}
