import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import backIcon from '/assets/back.svg';

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        if (!data) throw new Error('Laporan tidak ditemukan.');
        setReport(data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat laporan.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Memuat laporan...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-500">
        {error}
      </div>
    );

  const priorityText = (value) => {
  switch (value) {
    case 1: return 'Rendah';
    case 2: return 'Rendah - Sedang';
    case 3: return 'Sedang';
    case 4: return 'Sedang - Tinggi';
    case 5: return 'Tinggi';
    default: return '-';
  }
};

  return (
    <div className="max-w-md mx-auto relative pb-10">
      <nav className="flex items-center justify-center h-15 bg-[#0A3B44] rounded-bl-2xl rounded-br-2xl sticky top-0 w-full shadow-md z-10">
        <Link to="/">
          <div className="back-button absolute left-5 top-4 text-white bg-[#0E5D62] rounded-md p-1">
            <img src={backIcon} alt="Back" className="w-5 h-5 relative right-0.5" />
          </div>
        </Link>
        <h1 className="text-lg font-semibold mb-4 text-white text-center relative top-2 poppins-semibold">
          Detail Laporan
        </h1>
      </nav>

      {report?.photo_url && (
        <img
          src={`https://xepaobgjnetmybdlahdm.supabase.co/storage/v1/object/public/reports/${report.photo_url}`}
          alt="report"
          className="w-full -mt-4 h-72 object-cover rounded-b-2xl"
        />
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden p-5 mt-4 relative -top-12">
        <h1 className="poppins-semibold text-lg">{report?.title || '-'}</h1>

        <div className="text-xs mt-2 space-y-1">
          <div>Pelapor: {report?.name || '-'}</div>
          <div>
            Tanggal:{' '}
            {report?.created_at
              ? new Date(report.created_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '-'}
          </div>
          <div>Prioritas: {priorityText(report?.priority)}</div>
          <div>Kategori: {report?.category || '-'}</div>
          <div>Status: {report?.status || '-'}</div>
          <div>Lokasi: {report?.address || '-'}</div>
        </div>

        <h2 className="poppins-semibold text-md mt-3">Deskripsi</h2>
        <p className="text-xs whitespace-pre-line">{report?.description || '-'}</p>

        <h2 className="poppins-semibold text-md mt-3">Tanggapan</h2>
        <p className="text-xs">{report?.response || '-'}</p>

        <h2 className="poppins-semibold text-md mt-3">Lokasi</h2>
        <div className="mt-2 w-full h-52 rounded-xl overflow-hidden">
          {report?.location_lat && report?.location_lng ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${report.location_lat},${report.location_lng}&z=18&output=embed`}
            ></iframe>
          ) : (
            <p className="text-gray-500 text-center mt-3">Lokasi tidak tersedia</p>
          )}
        </div>

        {report?.location_lat && report?.location_lng && (
          <a
            href={`https://www.google.com/maps?q=${report.location_lat},${report.location_lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full block bg-[#0A3B44] text-white text-center py-2 rounded-xl active:scale-95 transition"
          >
            Buka di Google Maps
          </a>
        )}
      </div>
    </div>
  );
}
