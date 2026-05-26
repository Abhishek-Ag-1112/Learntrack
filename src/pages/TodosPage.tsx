import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TodoList from '../components/TodoList';
import { useAuth } from '../store/AuthContext';
import { FiCheckSquare } from 'react-icons/fi';

export default function TodosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8 pt-24 md:pt-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-2xl">
              <FiCheckSquare />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Focus Tasks</h1>
              <p className="text-sm text-textSecondary">Manage your daily tasks, yesterday's missed items, and tomorrow's goals.</p>
            </div>
          </div>

          <div className="w-full">
            <TodoList />
          </div>
        </div>
      </main>
    </div>
  );
}
