import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { startAuthentication } from '@simplewebauthn/browser';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, requestMagicLink, passkeyAuthOptions, passkeyAuthVerify } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Enter your email first');
      return;
    }
    setLoading(true);
    try {
      const resp = await requestMagicLink(email);
      if (resp?.link) {
        toast.success('Dev mode: magic link generated (see server console).');
      } else {
        toast.success('Check your email for the sign-in link.');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not send link');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskey = async () => {
    setLoading(true);
    try {
      const options = await passkeyAuthOptions(email || undefined);
      const credential = await startAuthentication(options);
      await passkeyAuthVerify(credential);
      toast.success('Signed in with passkey!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Passkey sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-700" />
          <div className="text-slate-400 text-xs">or</div>
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handlePasskey}
            disabled={loading}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded transition disabled:opacity-50"
          >
            Continue with passkey
          </button>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading || !email}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded transition disabled:opacity-50"
          >
            Email me a sign-in link
          </button>
        </div>

        <p className="text-slate-400 text-center mt-4">
          Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
