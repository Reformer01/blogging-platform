import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import {
  PencilSimple,
  GearSix,
  SignOut,
  UserPlus,
  List,
  X,
  Sun,
  Moon,
} from '@phosphor-icons/react';

function Navigation() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setHidden(y > 200 && y > lastY + 4);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  return (
    <nav
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-smooth ${
        hidden ? '-translate-y-24 opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div
        className={`rounded-full px-5 md:px-7 py-2.5 flex items-center gap-6 md:gap-10 min-w-max border transition-all duration-500 ${
          scrolled
            ? 'bg-noir-900/90 backdrop-blur-2xl border-white/[0.08] shadow-glass'
            : 'bg-noir-900/40 backdrop-blur-xl border-white/[0.04]'
        }`}
      >
        {/* Logo — serif for editorial */}
        <Link to="/" className="font-serif text-lg text-cream hover:text-gold transition-colors duration-300">
          BlogHub
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5">
          <button 
            onClick={toggleTheme} 
            className="text-warm-gray hover:text-cream transition-colors p-1.5 rounded-lg hover:bg-white/5 glow-element"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} weight="bold" /> : <Moon size={16} weight="bold" />}
          </button>
          
          {user ? (
            <>
              <Link to="/editor" className="flex items-center gap-1.5 text-warm-gray hover:text-cream transition-colors text-[13px] font-medium">
                <PencilSimple size={15} weight="bold" />
                Write
              </Link>
              <Link to="/dashboard" className="text-warm-gray hover:text-cream transition-colors text-[13px] font-medium">
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-1.5 text-warm-gray hover:text-cream transition-colors text-[13px] font-medium">
                  <GearSix size={15} weight="bold" />
                  Admin
                </Link>
              )}
              <button onClick={() => { logout(); }} className="text-warm-muted hover:text-red-400 transition-colors">
                <SignOut size={16} weight="bold" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-warm-gray hover:text-cream transition-colors text-[13px] font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 bg-gold text-noir-900 font-semibold px-4 py-1.5 rounded-full text-[13px] hover:bg-gold-light transition-colors active:scale-[0.97]"
              >
                <UserPlus size={14} weight="bold" />
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-warm-gray hover:text-cream transition-colors" aria-label="Menu">
          {isOpen ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-14 right-0 bg-noir-800/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-2.5 w-52 md:hidden shadow-glass animate-fade-up">
          <button 
            onClick={() => { toggleTheme(); setIsOpen(false); }} 
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-cream-dim hover:bg-white/5 transition-colors text-sm"
          >
            {theme === 'dark' ? <Sun size={16} weight="bold" /> : <Moon size={16} weight="bold" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <div className="border-t border-white/5 my-1" />
          
          {user ? (
            <>
              <Link to="/editor" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-cream-dim hover:bg-white/5 transition-colors text-sm">Write</Link>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-cream-dim hover:bg-white/5 transition-colors text-sm">Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-cream-dim hover:bg-white/5 transition-colors text-sm">Admin</Link>
              )}
              <div className="border-t border-white/5 my-1" />
              <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-xl text-red-400 hover:bg-white/5 text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-cream-dim hover:bg-white/5 transition-colors text-sm">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="block px-4 py-2.5 rounded-xl text-cream-dim hover:bg-white/5 transition-colors text-sm">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navigation;
