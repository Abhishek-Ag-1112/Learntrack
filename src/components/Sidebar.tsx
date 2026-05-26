import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBook, FiCheckSquare, FiLogOut, FiMenu, FiX, FiGlobe, FiActivity } from 'react-icons/fi';
import { useAuth } from '../store/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
    { name: 'Todos', path: '/todos', icon: <FiCheckSquare /> },
    { name: 'Courses', path: '/courses', icon: <FiBook /> },
    { name: 'News Room', path: '/news', icon: <FiGlobe /> },
    { name: 'Habit Tracker', path: '/habits', icon: <FiActivity /> },
  ];

  const handleLinkClick = (path: string) => {
    setIsOpen(false);
    if (path.startsWith('#')) {
      const element = document.getElementById(path.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Top Horizontal Mobile Navigation Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-surface/80 backdrop-blur-md border-b border-white/5 fixed top-0 left-0 right-0 z-30 w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-xs">
            LT
          </div>
          <span className="text-lg font-bold text-white tracking-tight">LearnTrack</span>
        </div>
        
        <div className="flex items-center gap-4">
          <img src={user?.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-2xl p-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Vertical Sidebar / Mobile Drawer */}
      <aside className={`w-64 border-r border-white/5 bg-surface/30 backdrop-blur-md flex flex-col h-screen fixed top-0 bottom-0 z-50 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0 left-0' : '-translate-x-full md:left-0'
      }`}>
        <div className="p-6 flex items-center justify-between border-b border-white/5 md:border-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-xs">
              LT
            </div>
            <span className="text-lg font-bold text-white tracking-tight">LearnTrack</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden text-textSecondary hover:text-white text-xl"
          >
            <FiX />
          </button>
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isHash = item.path.startsWith('#');
            return isHash ? (
              <button
                key={item.name}
                onClick={() => handleLinkClick(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-textSecondary hover:bg-white/5 hover:text-white text-left text-sm font-medium cursor-pointer"
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary/20 text-primary font-semibold' 
                    : 'text-textSecondary hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <img src={user?.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-white/10" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-textSecondary truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-textSecondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <FiLogOut className="text-xl" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
