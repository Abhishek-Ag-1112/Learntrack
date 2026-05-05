import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBook, FiCheckSquare, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../store/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
    { name: 'Todos', path: '#', icon: <FiCheckSquare /> },
    { name: 'Courses', path: '#', icon: <FiBook /> },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-surface/30 backdrop-blur-md flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-xs">
          LT
        </div>
        <span className="text-lg font-bold text-white tracking-tight">LearnTrack</span>
      </div>

      <nav className="flex-1 px-4 mt-8 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
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
  );
}
