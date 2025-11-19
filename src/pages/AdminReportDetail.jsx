import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import CustomSelect from '../components/CustomSelect';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import backIcon from '/assets/back.svg';
import updateIcon from '/assets/update.svg';
import deleteIcon from '/assets/delete.svg';

const options = ["Diterima", "Proses", "Selesai"];

export default function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch report & user data
  useEffect(() => {
    const fetchReport = async () => {
      const { data } = await supabase.from('reports').select('*').eq('id', id).single();
      setReport(data);
      setStatus(data.status);
      setResponse(data.response || "");
    };

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };

    fetchReport();
    fetchUser();
  }, [id]);

  if (!report)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Memuat laporan...
      </div>
    );

  const formatName = (email) => {
    if (!email) return "";
    const namePart = email.split("@")[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const handleUpdate = async () => {
    if (!status) {
      toast.error("Status tidak boleh kosong!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Memperbarui laporan...");

    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: status,
          response: formatName(user.email) + ": " + response,
        })
        .eq("id", report.id);

      if (error) throw error;

      setReport({ ...report, status, response });
      setShowModal(false);

      toast.update(toastId, {
        render: "Laporan berhasil diperbarui!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: "Gagal memperbarui laporan",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const toastId = toast.loading("Menghapus laporan...");

    try {
      // Hapus file foto jika ada
      if (report.photo_url) {
        const { error: storageError } = await supabase.storage
          .from("reports")
          .remove([report.photo_url]);

        if (storageError) console.error("Gagal hapus gambar:", storageError);
      }

      // Hapus data dari database
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", report.id);

      if (error) throw error;

      toast.update(toastId, {
        render: "Laporan berhasil dihapus!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: "Gagal menghapus laporan!",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto relative">
      {/* NAVBAR */}
      <nav className="flex items-center justify-center h-15 bg-[#0A3B44] rounded-bl-2xl rounded-br-2xl sticky top-0 w-full shadow-md z-10">
        <div onClick={() => navigate(-1)}>
          <div className="back-button absolute left-5 top-4 text-white bg-[#0E5D62] rounded-md p-1">
            <img src={backIcon} alt="Back" className="w-5 h-5 relative right-0.5" />
          </div>
        </div>
        <h1 className="text-lg font-semibold mb-4 text-white text-center relative top-2 poppins-semibold">
          Detail Laporan
        </h1>
      </nav>

      {/* FOTO LAPORAN */}
      {report.photo_url && (
        <img
          src={`https://xepaobgjnetmybdlahdm.supabase.co/storage/v1/object/public/reports/${report.photo_url}`}
          alt="report"
          className="w-full -mt-4 h-74 object-cover"
        />
      )}

      {/* DETAIL LAPORAN */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden p-5 m-4 relative -top-12 mb-10">
        <h1 className="poppins-semibold text-lg">{report.title}</h1>

        <div className="text-xs mt-1">
          <div className="mt-1">Pelapor : {report.name}</div>
          <div className="mt-1">Kontak : {report.contact}</div>
          <div className="mt-1">
            Tanggal :{" "}
            {new Date(report.created_at).toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="mt-1">Kategori : {report.category}</div>
          <div className="mt-1">Status : {report.status}</div>
          <div className="mt-1">Lokasi : {report.address}</div>
        </div>

        <h1 className="poppins-semibold text-md mt-3">Deskripsi</h1>
        <p className="text-xs whitespace-pre-line">{report.description}</p>

        <h1 className="poppins-semibold text-md mt-3">Tanggapan</h1>
        <p className="text-xs">{report.response ? report.response : "-"}</p>

        {/* MAP */}
        <h1 className="poppins-semibold text-md mt-3">Lokasi</h1>
        <div className="mt-3 w-full h-52 rounded-xl overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${report.location_lat},${report.location_lng}&z=18&output=embed`}
          ></iframe>
        </div>

        <a
          href={`https://www.google.com/maps?q=${report.location_lat},${report.location_lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 w-full block bg-[#0A3B44] text-white text-center py-2 rounded-xl active:scale-95 transition"
        >
          Buka di Google Maps
        </a>
      </div>

      {/* NAV BOTTOM: UPDATE & DELETE */}
      <nav className="fixed bottom-0 left-0 w-full bg-transparent p-4 z-1001">
        <div className="flex justify-between max-w-md mx-auto gap-4">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 bg-red-500 rounded-full px-6 py-3 drop-shadow-[0_0_10px_rgba(0,0,0,.2)] active:scale-95 transition text-white font-semibold flex items-center justify-center gap-2"
          >
            <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
            Hapus
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex-1 bg-[#093B46] rounded-full px-6 py-3 drop-shadow-[0_0_10px_rgba(0,0,0,.2)] active:scale-95 transition text-white font-semibold flex items-center justify-center gap-2"
          >
            <img src={updateIcon} alt="Update" className="w-5 h-5" />
            Update
          </button>
        </div>
      </nav>

      {/* MODAL DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-1002">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 max-w-md">
            <h1 className="text-lg font-semibold mb-2 text-center poppins-semibold">
              Hapus Laporan?
            </h1>
            <p className="text-sm text-center text-gray-600 mb-6">
              Laporan <span className="font-semibold">{report.title}</span> akan dihapus permanen.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl active:scale-95 transition font-semibold"
              >
                Batal
              </button>

              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  handleDelete();
                }}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl active:scale-95 transition font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UPDATE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-1002">
          <div className="bg-white rounded-2xl shadow-lg p-5 w-11/12 max-w-md">
            <h1 className="poppins-semibold text-lg mb-2">Update Laporan</h1>

            <p className="text-md font-semibold truncate w-11/12">{report.title}</p>
            <p className="text-xs mb-4 truncate w-11/12">{report.address}</p>

            <label className="text-sm font-semibold">Status</label>
            <CustomSelect
              value={status}
              onChange={(v) => setStatus(v)}
              options={options}
              required
            />

            <label className="text-sm font-semibold mt-4 block mb-2">
              Tanggapan {formatName(user.email)}
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Tulis tanggapan..."
              className="w-full h-28 px-4 py-4 mt-1 border rounded-xl text-sm focus:outline-none resize-none"
            />

            <button
              className="w-full cursor-pointer bg-[#093B46] text-white p-3 rounded-xl mt-4 flex items-center justify-center active:scale-95 transition"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Mengirim..." : "Kirim"}
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="w-full text-center text-md mt-2 text-gray-500 cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
}
