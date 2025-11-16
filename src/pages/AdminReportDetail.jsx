import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import CustomSelect from '../components/CustomSelect'
import backIcon from '/assets/back.svg'
import updateIcon from '/assets/update.svg'
import deleteIcon from '/assets/delete.svg'

const options = ["Diterima", "Proses", "Selesai"];

export default function AdminReportDetail() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [status, setStatus] = useState(report?.status || "");
  const [response, setResponse] = useState(report?.response || "")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      const { data } = await supabase.from('reports').select('*').eq('id', id).single()
      setReport(data)
      setStatus(data.status)
    }
    fetchReport()

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
    }
    fetchUser()
  }, [id])

  if (!report) return <p>Loading...</p>

  const handleUpdate = async () => {
    if (!status) {
      alert("Status tidak boleh kosong");
      return;
    }

    setLoading(true);

    try {
      const { error, data } = await supabase
        .from("reports")
        .update({
          status: status,
          response: formatName(user.email) + ": " + response,
        })
        .eq("id", report.id);

        console.log(data)

      if (error) throw error;

      // Update state lokal agar UI langsung berubah
      setReport({ ...report, status, response });

      alert("Laporan berhasil diupdate!");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Gagal update laporan");
    } finally {
      setLoading(false);
    }
  };

  const formatName = (email) => {
    if (!email) return "";
    const namePart = email.split("@")[0]; // ambil sebelum @
    return namePart.charAt(0).toUpperCase() + namePart.slice(1); // huruf pertama kapital
  }

  const handleDelete = async () => {
    const confirm = window.confirm("Apakah kamu yakin ingin menghapus laporan ini?");
    if (!confirm) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", report.id);

      if (error) throw error;

      alert("Laporan berhasil dihapus!");
      navigate("/dashboard"); // Kembali ke dashboard setelah hapus
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus laporan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto relative">
      <nav className="flex items-center justify-center h-15 bg-[#0A3B44] rounded-bl-2xl rounded-br-2xl sticky top-0 w-full shadow-md z-10">
       <div onClick={() => navigate(-1)}>
          <div className="back-button absolute left-5 top-4 text-white bg-[#0E5D62] rounded-md p-1">
            <img src={backIcon} alt="Back" className="w-5 h-5 relative right-0.5" />
          </div>
       </div>
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
        
       <nav className="fixed bottom-0 left-0 w-full bg-transparent p-4">
          <div className="flex justify-between max-w-md mx-auto gap-4">
            {/* Tombol Hapus */}
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-500 rounded-full px-6 py-3 drop-shadow-[0_0_10px_rgba(0,0,0,.2)] active:scale-95 transition text-white font-semibold flex items-center justify-center gap-2"
            >
              <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
              Hapus
            </button>

            {/* Tombol Update */}
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-[#093B46] rounded-full px-6 py-3 drop-shadow-[0_0_10px_rgba(0,0,0,.2)] active:scale-95 transition text-white font-semibold flex items-center justify-center gap-2"
            >
              <img src={updateIcon} alt="Update" className="w-5 h-5" />
              Update
            </button>
          </div>
        </nav>



        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-5 w-11/12 max-w-md">

              <h1 className="poppins-semibold text-lg mb-2">Update Laporan</h1>

              <p className="text-md font-semibold truncate w-11/12">
                {report.title}
              </p>
              <p className="text-xs mb-4 truncate w-11/12">
                {report.address}
              </p>

              {/* STATUS */}
              <label className="text-sm font-semibold">Status</label>
              <CustomSelect
                value={status}
                onChange={(v) => setStatus(v)}
                options={options}
                required
              />

              {/* TANGGAPAN */}
              <label className="text-sm font-semibold mt-4 block mb-2">Tanggapan {formatName(user.email)}</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Tulis tanggapan..."
                className="w-full h-28 px-4 py-4 mt-1 border rounded-xl text-sm focus:outline-none resize-none"
              />

              {/* BUTTON */}
              <button
                className="w-full cursor-pointer bg-[#093B46] text-white p-3 rounded-xl mt-4 flex items-center justify-center active:scale-95 transition"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim"}
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
