import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

import headerLoginIcon from '/assets/header-login.svg';
import logoJejak from '/logo-jejak.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) alert('Login gagal: ' + error.message);
    else navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto relative">
      <header className="relative">
        <img src={headerLoginIcon} alt="Header Login" className="drop-shadow-md" />
        <img
          src={logoJejak}
          alt="Logo Jejak"
          className="h-28 absolute top-18 left-1/2 -translate-x-1/2"
        />
      </header>

      <div className="bg-white w-[80%] rounded-2xl shadow-lg overflow-hidden p-5 absolute left-1/2 -translate-x-1/2 top-1/2 translate-y-1/2">
        <h1 className="poppins-semibold text-xl text-center mt-4">Login Admin</h1>
        <p className="text-xs text-center mb-5">Masuk untuk mengelola laporan</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 px-5 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 px-5 rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-3 mb-5 disabled:bg-gray-400 active:scale-100"
          >
            {loading ? 'Loading' : 'Login'}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
