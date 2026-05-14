import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../store/AuthContext';
import { parseCourses } from '../utils/markdownParser';
import type { Course, Phase } from '../types';
import { FiArrowLeft, FiCheck, FiMinus } from 'react-icons/fi';
import Leaderboard from '../components/Leaderboard';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, updateUser, recordActivity } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const courses = parseCourses();
    const found = courses.find(c => c.id === id);
    if (found) setCourse(found);
  }, [id, user, navigate]);

  if (!user || !course) return <div className="min-h-screen bg-background" />;

  const courseProgress = user.progress[course.id] || {};

  let completedValue = 0;
  Object.values(courseProgress).forEach(status => {
    if (status === 'done') completedValue += 1;
    else if (status === 'half_done') completedValue += 0.5;
  });
  
  const percentComplete = course.totalLectures === 0 
    ? 0 
    : Math.round((completedValue / course.totalLectures) * 100);

  const handleToggle = (lectureId: string) => {
    const currentStatus = courseProgress[lectureId] || 'not_done';
    let nextStatus: 'not_done' | 'half_done' | 'done' = 'half_done';
    
    if (currentStatus === 'not_done') nextStatus = 'half_done';
    else if (currentStatus === 'half_done') nextStatus = 'done';
    else if (currentStatus === 'done') nextStatus = 'not_done';

    updateUser({
      progress: {
        ...user.progress,
        [course.id]: {
          ...courseProgress,
          [lectureId]: nextStatus
        }
      }
    });
    
    // Record activity on any progress change
    recordActivity();
  };

  const getStatusIcon = (status: string) => {
    if (status === 'done') return <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"><FiCheck className="text-xs" /></div>;
    if (status === 'half_done') return <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center bg-primary/20"><FiMinus className="text-xs text-primary" /></div>;
    return <div className="w-5 h-5 rounded-full border-2 border-white/20 group-hover:border-primary/50 transition-colors" />;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-textSecondary hover:text-white transition-colors mb-8"
          >
            <FiArrowLeft /> Back to Dashboard
          </button>

          {/* Header */}
          <div className="glass-panel p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            <h1 className="text-3xl font-bold text-white mb-4 relative z-10">{course.title}</h1>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-textSecondary mb-2">
                  <span>Overall Progress</span>
                  <span className="font-bold text-white">{percentComplete}%</span>
                </div>
                <div className="w-full bg-surface h-3 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>
              <div className="text-sm font-medium text-textSecondary whitespace-nowrap px-4 py-2 bg-surface rounded-xl border border-white/5">
                {Math.floor(completedValue)} / {course.totalLectures} Done
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Curriculum */}
            <div className="lg:col-span-2 space-y-6">
              {course.phases.map((phase: Phase) => {
                let phaseCompleted = 0;
                phase.lectures.forEach(l => {
                  const st = courseProgress[l.id];
                  if (st === 'done') phaseCompleted += 1;
                  else if (st === 'half_done') phaseCompleted += 0.5;
                });
                
                return (
                  <div key={phase.id} className="glass-card overflow-hidden">
                    <div className="p-5 border-b border-white/5 bg-surface/50 flex justify-between items-center">
                      <h2 className="text-lg font-bold text-white">{phase.title}</h2>
                      <span className="text-xs font-semibold text-textSecondary bg-background px-2.5 py-1 rounded-md">
                        {Math.floor(phaseCompleted)} / {phase.lectures.length}
                      </span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {phase.lectures.map((lecture) => {
                        const status = courseProgress[lecture.id] || 'not_done';
                        return (
                          <button 
                            key={lecture.id}
                            onClick={() => handleToggle(lecture.id)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group text-left"
                          >
                            {getStatusIcon(status)}
                            <span className={`flex-1 text-sm ${status === 'done' ? 'text-textSecondary line-through' : 'text-white/90'}`}>
                              {lecture.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar / Leaderboard */}
            <div className="space-y-6">
              <Leaderboard course={course} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
