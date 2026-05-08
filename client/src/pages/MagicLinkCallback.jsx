import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function MagicLinkCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { verifyMagicLink } = useAuthStore();
  const [status, setStatus] = useState('Verifying sign-in link…');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('Missing token.');
      return;
    }

    (async () => {
      try {
        await verifyMagicLink(token);
        toast.success('Signed in!');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        toast.error(err?.response?.data?.error || 'Magic link invalid/expired');
        setStatus('Link invalid or expired.');
      }
    })();
  }, [params, verifyMagicLink, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">Signing you in</h2>
        <p className="text-slate-300">{status}</p>
        <div className="mt-6">
          <Link to="/login" className="text-blue-400 hover:text-blue-300">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

