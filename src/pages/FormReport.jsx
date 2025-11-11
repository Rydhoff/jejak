import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import * as mobilenet from '@tensorflow-models/mobilenet'
import '@tensorflow/tfjs'
import sha256 from 'crypto-js/sha256'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Link } from 'react-router-dom'

// Atur ikon default Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

export default function FormReport() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [category, setCategory] = useState('Lainnya')
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState({ lat: -6.2, lng: 107.29 })
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const cacheRef = useRef({})
  const searchTimeout = useRef(null)

  // 🧭 Ambil lokasi user saat pertama kali dibuka
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setLocation(coords)
          await getAddress(coords.lat, coords.lng)
        },
        (err) => console.warn('Gagal ambil lokasi:', err),
        { enableHighAccuracy: true }
      )
    }
  }, [])

  // 🔁 Ambil nama alamat dari koordinat
  const getAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'ReportApp/1.0' } }
      )
      const data = await res.json()
      setAddress(data.display_name || '')
    } catch (err) {
      console.log('Gagal ambil alamat:', err)
    }
  }

  // 🗺️ Marker di peta
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLocation(e.latlng)
        getAddress(e.latlng.lat, e.latlng.lng)
      }
    })
    return (
      <Marker position={location}>
        <Popup>{address || 'Titik lokasi laporan'}</Popup>
      </Marker>
    )
  }

  // 🧭 Update view map ketika lokasi berubah
  function ChangeView({ coords }) {
    const map = useMap()
    map.setView(coords, 20)
    return null
  }

  // 🤖 Deteksi kategori otomatis
  const detectCategory = async (file) => {
    if (!file && !title && !description) return
    setLoading(true)
    const text = (title + ' ' + description).toLowerCase()
    let kategori = 'Lainnya'

    if (text.includes('jalan')) kategori = 'Infrastruktur'
    else if (text.includes('sampah')) kategori = 'Kebersihan'
    else if (text.includes('lampu')) kategori = 'Penerangan'

    if (kategori === 'Lainnya' && file) {
      const model = await mobilenet.load()
      const img = document.createElement('img')
      img.src = URL.createObjectURL(file)
      await new Promise((resolve) => {
        img.onload = async () => {
          const predictions = await model.classify(img)
          const label = predictions[0].className.toLowerCase()
          if (label.includes('street')) kategori = 'Infrastruktur'
          else if (label.includes('trash')) kategori = 'Kebersihan'
          else if (label.includes('lamp')) kategori = 'Penerangan'
          resolve()
        }
      })
    }

    setCategory(kategori)
    setLoading(false)
  }

  useEffect(() => {
    if (photo) detectCategory(photo)
  }, [photo])

  // 🔍 Cari lokasi (debounce + cache + loading)
  const handleSearch = (query) => {
    setAddress(query)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (query.length < 3) {
      setSearchResults([])
      return
    }

    searchTimeout.current = setTimeout(async () => {
      if (cacheRef.current[query]) {
        setSearchResults(cacheRef.current[query])
        return
      }

      setSearchLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5`,
          { headers: { 'User-Agent': 'ReportApp/1.0' } }
        )
        const data = await res.json()
        setSearchResults(data)
        cacheRef.current[query] = data
      } catch (err) {
        console.log('Gagal mencari lokasi:', err)
      } finally {
        setSearchLoading(false)
      }
    }, 300)
  }

  // 🏷️ Ketika user pilih hasil
  const handleSelectLocation = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setLocation({ lat, lng })
    setAddress(result.display_name)
    setSearchResults([])
  }

  // 📨 Submit laporan
  const handleSubmit = async (e) => {
    
    // e.preventDefault()
    // if (!photo) return alert('Pilih foto terlebih dahulu!')

    // setLoading(true)
    const kategori = category

    alert(
      
        name+
        contact+
        title+
        description+
        kategori+
        "photoUrl"+
        location.lat+
        location.lng+
        address+
        'Diterima'+new Date()
      
    )

    // Upload foto ke Supabase
    // const { data, error: uploadError } = await supabase.storage
    //   .from('reports')
    //   .upload(`photos/${photo.name}`, photo)

    // if (uploadError) {
    //   setLoading(false)
    //   return alert('Upload foto gagal!')
    // }

    // const photoUrl = data.path
    // const hash = sha256(title + description + new Date().toISOString()).toString()

    // const { error } = await supabase.from('reports').insert([
    //   {
    //     title,
    //     description,
    //     category: kategori,
    //     photo_url: photoUrl,
    //     location_lat: location.lat,
    //     location_lng: location.lng,
    //     address,
    //     blockchain_hash: hash,
    //     status: 'Diterima',
    //     created_at: new Date()
    //   }
    // ])

    // setLoading(false)
    // if (error) console.log(error)
    // else {
    //   alert(`✅ Laporan terkirim!\nKategori: ${kategori}\nHash: ${hash}`)
    //   setTitle('')
    //   setDescription('')
    //   setPhoto(null)
    //   setCategory('Lainnya')
    // }
  }

  return (
    <div className="max-w-md mx-auto relative">
      <nav className="flex items-center justify-center h-20 bg-[#0A3B44] rounded-2xl absolute -top-6 w-full shadow-md">
       <Link to="/">
          <div className="back-button absolute left-5 top-9 text-white bg-[#0E5D62] rounded-md p-1">
            <img src="../public/assets/back.svg" alt="Back" className="w-5 h-5 relative right-0.5" />
          </div>
       </Link>
        <h1 className="text-lg font-semibold mb-4 text-white text-center relative top-4.5 poppins-semibold">Buat Laporan</h1>
      </nav>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-19 p-5">
        <label className="input-label text-sm poppins-semibold -mb-0.5">Informasi Pelapor</label>
        <div>
          <input
            type="text"
            placeholder="Nama lengkap"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="No. HP: 0895***"
            value={contact}
            onChange={e => setContact(e.target.value)}
            required
          />
        </div>

        <label className="input-label text-sm poppins-semibold mt-2 -mb-0.5">Detail Laporan</label>
        {/* Judul */}
        <div>
          <input
            type="text"
            placeholder="Judul laporan"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        {/* Deskripsi */}
        <div>
          <textarea
            rows={3}
            placeholder="Ceritakan masalah secara singkat..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            className="-mb-1"
          />
        </div>

        {/* Lokasi */}
        <div>
          <div className="relative">
            <input
              type="text"
              value={address}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari lokasi"
            />
            {searchLoading && (
              <p className="absolute right-3 top-2 text-gray-400 text-sm">🔍</p>
            )}
            {searchResults.length > 0 && (
              <ul className="absolute bg-white border w-full max-h-48 overflow-y-auto rounded-xl shadow-lg z-1001">
                {searchResults.map((res) => (
                  <li
                    key={res.place_id}
                    onClick={() => handleSelectLocation(res)}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {res.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="map-container">
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={20}
            style={{ height: '200px', width: '100%' }}
            key={`${location.lat}-${location.lng}`}
            maxBounds={[[-11.0, 95.0], [6.0, 141.0]]}
            maxBoundsViscosity={1.0}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ChangeView coords={location} />
            <LocationMarker />
          </MapContainer>
        </div>

        {/* Foto */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="photo-upload"
            className="flex items-center gap-3 text-white cursor-pointer w-full shadow-sm bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#2a8087] focus:border-[#2a8087] transition"
          >
            <img src="../public/assets/media.svg" alt="Upload Icon" className="w-5 h-5" />

            {photo ? (
              // Jika foto sudah dipilih → tampilkan nama file
              <span className="text-gray-700 truncate max-w-full">
                |&nbsp;&nbsp;{photo.name}
              </span>
            ) : (
              // Jika belum → tampilkan teks "Pilih media"
              <span className="text-gray-400">|&nbsp;&nbsp;Pilih media</span>
            )}
          </label>

          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            className="hidden"
            required
          />
        </div>

          {loading && (
            <div className="absolute w-[60%] text-xs text-gray-600 poppins-semibold p-3 rounded-xl text-center right-5 top-50">🤖 Mendeteksi kategori otomatis...</div>
          )}

        {/* Kategori */}
        {/* <div>
          <label className="input-label">Kategori</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="Infrastruktur">Infrastruktur</option>
            <option value="Kebersihan">Kebersihan</option>
            <option value="Penerangan">Penerangan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div> */}

        

        {/* Tombol kirim */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-3"
        >
          {loading ? 'Loading...' : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  )

}
