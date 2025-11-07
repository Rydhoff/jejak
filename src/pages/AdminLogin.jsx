import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    console.log(data)
    if (error) alert('Login gagal: ' + error.message)
    else navigate('/dashboard')
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-5 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-5">Admin Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
