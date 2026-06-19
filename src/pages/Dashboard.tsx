import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import ActivityHeatmap from '../components/Heatmap';
import TodoList from '../components/TodoList';
import { useAuth } from '../store/AuthContext';
import { parseCourses } from '../utils/markdownParser';
import { FaFire } from 'react-icons/fa';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const courses = useMemo(() => {
    const defaultCourses = parseCourses();
    return [...defaultCourses, ...(user?.customCourses || [])];
  }, [user?.customCourses]);

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
        <div className="max-w-6xl mx-auto">
          {/* Header & Streak */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name.split(' ')[0]} 👋</h1>
              <p className="text-textSecondary">Here's your learning overview for today.</p>
            </div>
            
            <div className="glass-panel px-6 py-4 flex items-center gap-4 bg-gradient-to-r from-surface to-orange-900/20 border-orange-500/20">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-2xl animate-pulse">
                <FaFire />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">Day {user.streak}</div>
                <div className="text-xs text-orange-200">Current Streak</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Courses & Heatmap) */}
            <div className="lg:col-span-2 space-y-8">
              <section id="courses" className="scroll-mt-24 md:scroll-mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Your Courses</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
              
              <section>
                <ActivityHeatmap />
              </section>
            </div>

            {/* Right Column (Todos) */}
            <div className="space-y-8">
              <section id="todos" className="scroll-mt-24 md:scroll-mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Focus Tasks</h2>
                <TodoList />
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
