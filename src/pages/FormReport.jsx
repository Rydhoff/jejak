import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { callAI } from '../services/aiServices';

import backIcon from '/assets/back.svg';
import mediaIcon from '/assets/media.svg';

// --- Setup Leaflet icon ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

export default function FormReport() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({ lat: -6.2, lng: 106.816666 });

  const cacheRef = useRef({});
  const searchTimeout = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // --- Get user location automatically ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          reverseGeocode(coords.lat, coords.lng);
        },
        (err) => console.warn('Gagal ambil lokasi:', err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'ReportApp/1.0' } }
      );
      const data = await res.json();
      setAddress(data.display_name || '');
    } catch (err) {
      console.log('reverseGeocode error', err);
    }
  };

  const handleSearch = (query) => {
    setAddress(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      if (cacheRef.current[query]) {
        setSearchResults(cacheRef.current[query]);
        return;
      }

      setSearchLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          { headers: { 'User-Agent': 'ReportApp/1.0' } }
        );
        const data = await res.json();
        setSearchResults(data);
        cacheRef.current[query] = data;
      } catch (err) {
        console.log('search error', err);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  };

  const handleSelectLocation = (res) => {
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);
    setLocation({ lat, lng });
    setAddress(res.display_name);
    setSearchResults([]);
  };

  const uploadPhoto = async (file) => {
    const uniqueName = `${uuidv4()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('reports')
      .upload(`photos/${uniqueName}`, file);
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description) return toast.error('Isi deskripsi laporan terlebih dahulu!');
    if (!photo) return toast.error('Pilih foto bukti terlebih dahulu!');

    setLoading(true);
    const tId = toast.loading('Mengirim laporan...');

    try {
      const aiResult = await callAI({ text: description });
      const { category, title, moderation, priority } = aiResult;

      if (moderation === true) {
        toast.update(tId, {
          render: 'Laporan mengandung kata tidak pantas atau sensitif. Mohon perbaiki deskripsi.',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        });
        setLoading(false);
        return;
      }

      const photoPath = await uploadPhoto(photo);

      const { error: insertError } = await supabase.from('reports').insert([
        {
          name,
          contact,
          description: aiResult.description,
          title,
          category,
          moderation,
          priority,
          photo_url: photoPath,
          location_lat: location.lat,
          location_lng: location.lng,
          address,
          status: 'Diterima',
          created_at: new Date()
        }
      ]);

      if (insertError) throw insertError;

      toast.update(tId, {
        render: 'Laporan berhasil dikirim!',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });

      setName('');
      setContact('');
      setDescription('');
      setPhoto(null);
    } catch (err) {
      console.error(err);
      toast.update(tId, {
        render: 'Gagal mengirim laporan',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Leaflet components ---
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLocation(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      }
    });

    return (
      <Marker position={[location.lat, location.lng]}>
        <Popup>{address || 'Titik lokasi laporan'}</Popup>
      </Marker>
    );
  }

  function ChangeView({ coords }) {
    const map = useMap();
    useEffect(() => {
      if (coords) map.setView([coords.lat, coords.lng], 18);
    }, [coords, map]);
    return null;
  }

  return (
    <div className="max-w-md mx-auto relative">
      <nav className="flex items-center justify-center h-15 bg-[#0A3B44] rounded-bl-2xl rounded-br-2xl sticky top-0 w-full shadow-md">
        <Link to="/">
          <div className="back-button absolute left-5 top-4 text-white bg-[#0E5D62] rounded-md p-1">
            <img src={backIcon} alt="Back" className="w-5 h-5 relative right-0.5" />
          </div>
        </Link>
        <h1 className="text-lg font-semibold mb-4 text-white text-center relative top-2 poppins-semibold">Buat Laporan</h1>
      </nav>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-5">
        <label className="input-label text-sm poppins-semibold -mb-0.5">Informasi Pelapor</label>
        <input type="text" placeholder="Nama lengkap" value={name} onChange={e => setName(e.target.value)} required />
        <input
          type="text"
          placeholder="No. HP: 0895***"
          value={contact}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) setContact(value);
          }}
          required
        />

        <label className="input-label text-sm poppins-semibold mt-2 -mb-0.5">Detail Laporan</label>
        <textarea
          rows={3}
          placeholder="Ceritakan masalah secara singkat..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          className="-mb-1"
        />

        <div>
          <div className="relative">
            <input type="text" value={address} onChange={(e) => handleSearch(e.target.value)} placeholder="Cari lokasi" />
            {searchLoading && (<p className="absolute right-4 top-4 text-gray-400 text-sm">🔍</p>)}
            {searchResults.length > 0 && (
              <ul className="absolute bg-white border w-full max-h-48 overflow-y-auto rounded-xl shadow-lg z-1001">
                {searchResults.map((res) => (
                  <li key={res.place_id} onClick={() => handleSelectLocation(res)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{res.display_name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="map-container">
          <MapContainer center={[location.lat, location.lng]} zoom={18} style={{ height: '200px', width: '100%' }} key={`${location.lat}-${location.lng}`}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ChangeView coords={location} />
            <LocationMarker />
          </MapContainer>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="photo-upload" className="flex items-center h-13 gap-3 text-white cursor-pointer w-full shadow-sm bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#2a8087] focus:border-[#2a8087] transition">
            <img src={mediaIcon} alt="Upload Icon" className="w-5 h-5" />
            {photo ? (
              <span className="text-gray-700 truncate max-w-full">|&nbsp;&nbsp;{photo.name}</span>
            ) : (
              <span className="text-gray-400">|&nbsp;&nbsp;Pilih media</span>
            )}
          </label>
          <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="hidden" required />
        </div>

        {loading && (<div className="absolute w-[60%] text-xs text-gray-600 poppins-semibold p-3 rounded-xl text-center right-5 top-58">🤖 Mengirim ke AI...</div>)}

        <button type="submit" disabled={loading} className="btn-primary mt-3 disabled:bg-gray-400 active:scale-100">{loading ? 'Loading' : 'Kirim Laporan'}</button>
      </form>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </div>
  );
}
