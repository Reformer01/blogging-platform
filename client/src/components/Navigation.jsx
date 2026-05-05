import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, PenTool, Settings } from 'lucide-react';

function Navigation() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-slate-800 text-white border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-400">
          BlogHub
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/editor"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white"
              >
                <PenTool className="w-5 h-5" /> Write
              </Link>
              <Link
                to="/dashboard"
                className="text-slate-300 hover:text-white"
              >
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white"
                >
                  <Settings className="w-5 h-5" /> Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 text-red-400 hover:text-red-300"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
