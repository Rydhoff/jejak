import headerHomeIcon from '/assets/header-home.svg';
import searchIcon from '/assets/search.svg';
import calendarIcon from '/assets/calendar.svg';
import locationIcon from '/assets/location.svg';
import logoJejak from '/logo-jejak.png';
import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient';
import BottomNav from '../components/BottomNav';
import { Link } from 'react-router-dom';

export default function Home() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [active, setActive] = useState('Semua');
  const tabs = ['Semua', 'Baru', 'Proses', 'Selesai'];

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lazy load
  const LIMIT = 6;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) setPage((p) => p + 1);
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Fetch paginated data
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const start = page * LIMIT;
      const end = start + LIMIT - 1;

      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
          .range(start, end);

        if (error) throw error;
        if (data.length < LIMIT) setHasMore(false);

        setReports((prev) => {
          const merged = [...prev, ...data];
          return merged.filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i);
        });
      } catch (err) {
        console.error(err);
        setError('Gagal memuat laporan');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [page]);

  // Reset pagination saat tab berubah
  useEffect(() => {
    setReports([]);
    setPage(0);
    setHasMore(true);
  }, [active]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Filter reports
  const filteredReports = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return reports.filter((r) => {
      // Filter by tab status
      if (active !== 'Semua') {
        const status = (r.status ?? '').toLowerCase();
        if (active === 'Baru' && status !== 'diterima') return false;
        if (active !== 'Baru' && status !== active.toLowerCase()) return false;
      }
      // Filter by search query
      if (!q) return true;
      return (
        (r.title ?? '').toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q) ||
        (r.address ?? '').toLowerCase().includes(q)
      );
    });
  }, [reports, debouncedSearch, active]);

  return (
    <div className="max-w-md mx-auto relative pb-32">
      {/* Header */}
      <header className="relative">
        <img src={headerHomeIcon} alt="Header Home" className="drop-shadow-md" />
        <img src={logoJejak} alt="Logo Jejak" className="h-22 absolute top-7 left-11 drop-shadow-sm" />
        <p className="text-sm poppins-semibold absolute text-[#004d4d] top-28 left-9">
          Tinggalkan Jejak, Wujudkan Perubahan
        </p>
      </header>

      <div className="flex flex-col py-2 px-5">
        {/* Search */}
        <div className="mt-12 relative w-full max-w-sm">
          <img
            src={searchIcon}
            alt="Search icon"
            className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 opacity-60"
          />
          <input
            type="text"
            placeholder="Cari laporan"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border h-11 border-gray-300 rounded-4xl focus:ring-2 focus:ring-[#006d6d] focus:outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-between w-full mt-7">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-4 py-1 rounded-full cursor-pointer border text-sm font-semibold transition-all duration-200 ${
                active === tab
                  ? 'bg-[#004d4d] text-white border-[#004d4d]'
                  : 'bg-white text-[#004d4d] border-[#004d4d] hover:bg-[#004d4d]/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Reports list */}
        <div className="list-report mt-6">
          <h1 className="text-xl poppins-semibold">
            {active === 'Semua' ? 'Semua Laporan' : `Laporan ${active}`}
          </h1>

          {error && <div className="py-8 text-red-500">{error}</div>}

          {filteredReports.length === 0 && !loading ? (
            <div className="py-8 text-center text-gray-500">Tidak ada laporan.</div>
          ) : (
            <div className="max-w-md mx-auto mt-5 flex flex-col gap-5">
              {filteredReports.map((r) => (
                <Link to={`report/${r.id}`} key={`${r.id}-${r.created_at}`}>
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg">
                    {r.photo_url && (
                      <div className="relative">
                        <img
                          src={`https://xepaobgjnetmybdlahdm.supabase.co/storage/v1/object/public/reports/${r.photo_url}`}
                          alt="report"
                          className="w-full h-36 object-cover"
                        />
                        <span
                          className={`absolute top-2 scale-95 right-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
                            r.status === 'Selesai'
                              ? 'bg-green-400/50 border-green-400 text-green-800'
                              : r.status === 'Proses'
                              ? 'bg-yellow-400/50 border-yellow-400 text-yellow-800'
                              : 'bg-gray-400/50 border-gray-400 text-gray-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="poppins-semibold text-base truncate w-[70vw]">{r.title}</h2>
                      <p className="text-gray-600 text-sm truncate w-[70vw]">{r.description}</p>
                      <div className="text-xs text-gray-400 mt-2 gap-4">
                        <div className="flex items-center gap-1">
                          <img src={locationIcon} alt="Lokasi" className="h-4.5 w-4.5" />
                          <span className="truncate w-[70vw]">{r.address}</span>
                        </div>
                        <div className="flex items-center mt-2 gap-1">
                          <img src={calendarIcon} alt="Kalender" className="h-4.5 w-4.5" />
                          <span>
                            {new Date(r.created_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Loader for infinite scroll */}
          <div ref={loaderRef} className="py-6 text-center text-gray-400">
            {loading && 'Memuat...'}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
