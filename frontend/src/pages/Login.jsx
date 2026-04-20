import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !email.endsWith('@iitp.ac.in')) {
      setError('You must register with an @iitp.ac.in email address.');
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(`https://campus-connect-ljjb.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Server error connecting to backend');
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-900 text-white">
      <div className="w-full max-w-md rounded-2xl bg-zinc-800 p-8 shadow-xl shadow-zinc-950/50">
        <h1 className="mb-2 text-3xl font-bold text-center">Campus Connect</h1>
        <p className="mb-6 text-center text-zinc-400">
          {isLogin ? 'Welcome back! Please login.' : 'Sign up using your IITP email.'}
        </p>

        {error && <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-500 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full rounded-xl bg-zinc-700/50 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">IITP Email</label>
            <input
              type="email"
              required
              placeholder="e.g. name_2201cs01@iitp.ac.in"
              className="w-full rounded-xl bg-zinc-700/50 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-xl bg-zinc-700/50 p-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold hover:bg-blue-500 transition-colors mt-2"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
}
