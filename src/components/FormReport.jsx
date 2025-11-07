import { useState, useEffect, useRef } from 'react'
import { supabase, supbaseUrl1, supbaseUrl2 } from '../supabaseClient'
import * as mobilenet from '@tensorflow-models/mobilenet'
import '@tensorflow/tfjs'
import sha256 from 'crypto-js/sha256'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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
  console.log(supbaseUrl1, supbaseUrl2)

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
    e.preventDefault()
    if (!photo) return alert('Pilih foto dulu!')

    setLoading(true)
    const kategori = category

    // Upload foto ke Supabase
    const { data, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(`photos/${photo.name}`, photo)

    if (uploadError) {
      setLoading(false)
      return alert('Upload foto gagal!')
    }

    const photoUrl = data.path
    const hash = sha256(title + description + new Date().toISOString()).toString()

    const { error } = await supabase.from('reports').insert([
      {
        title,
        description,
        category: kategori,
        photo_url: photoUrl,
        location_lat: location.lat,
        location_lng: location.lng,
        address,
        blockchain_hash: hash,
        status: 'Diterima',
        created_at: new Date()
      }
    ])

    setLoading(false)
    if (error) console.log(error)
    else {
      alert(`✅ Laporan terkirim!\nKategori: ${kategori}\nHash: ${hash}`)
      setTitle('')
      setDescription('')
      setPhoto(null)
      setCategory('Lainnya')
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-5 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Laporkan Masalah</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Judul masalah"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <textarea
          placeholder="Deskripsi masalah"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={e => setPhoto(e.target.files[0])}
          required
        />
        {loading && <p className="text-gray-500 text-sm">Mendeteksi kategori otomatis...</p>}

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border p-2 rounded bg-gray-50"
        >
          <option value="Infrastruktur">Infrastruktur</option>
          <option value="Kebersihan">Kebersihan</option>
          <option value="Penerangan">Penerangan</option>
          <option value="Lainnya">Lainnya</option>
        </select>

        {/* 🔍 Kolom alamat yang bisa diketik untuk mencari */}
        <div className="relative z-1000 search-container"> {/* Tambahkan z-index tinggi */}
          <input
            type="text"
            value={address}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Alamat lokasi (bisa diketik untuk mencari)"
            className="border p-2 w-full rounded relative z-1001 bg-white"
          />
          {searchLoading && (
            <p className="absolute right-3 top-2 text-gray-400 text-sm">🔍...</p>
          )}
          {searchResults.length > 0 && (
            <ul className="absolute z-2000 bg-white border w-full max-h-48 overflow-y-auto rounded shadow">
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

        <MapContainer
          center={[location.lat, location.lng]}
          zoom={20}
          style={{ height: '200px', width: '100%' }}
          key={`${location.lat}-${location.lng}`}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ChangeView coords={location} />
          <LocationMarker />
        </MapContainer>

        {/* <div className="grid grid-cols-2 gap-2">
          <input type="text" value={location.lat} readOnly className="border p-2 rounded" placeholder="Latitude" />
          <input type="text" value={location.lng} readOnly className="border p-2 rounded" placeholder="Longitude" />
        </div> */}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 rounded mt-2"
        >
          {loading ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  )
}
