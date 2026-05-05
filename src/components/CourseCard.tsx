import { useNavigate } from 'react-router-dom';
import { Course } from '../types';
import { useAuth } from '../store/AuthContext';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const courseProgress = user?.progress[course.id] || {};
  
  // Calculate progress
  let completedValue = 0;
  Object.values(courseProgress).forEach(status => {
    if (status === 'done') completedValue += 1;
    else if (status === 'half_done') completedValue += 0.5;
  });
  
  const percentComplete = course.totalLectures === 0 
    ? 0 
    : Math.round((completedValue / course.totalLectures) * 100);

  let statusBadge = "Not Started";
  let badgeColor = "bg-surface text-textSecondary";
  
  if (percentComplete === 100) {
    statusBadge = "Completed";
    badgeColor = "bg-green-500/20 text-green-400";
  } else if (percentComplete > 0) {
    statusBadge = "In Progress";
    badgeColor = "bg-primary/20 text-primary-light";
  }

  return (
    <div 
      onClick={() => navigate(`/course/${course.id}`)}
      className="glass-card p-5 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`px-2.5 py-1 rounded-md text-xs font-semibold ${badgeColor}`}>
          {statusBadge}
        </div>
        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
          {course.id === 'c1' ? '👨‍💻' : '🤖'}
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[56px] group-hover:text-primary transition-colors">
        {course.title}
      </h3>
      
      <div className="mt-4">
        <div className="flex justify-between text-xs text-textSecondary mb-1.5">
          <span>{Math.floor(completedValue)}/{course.totalLectures} lectures</span>
          <span className="font-medium text-white">{percentComplete}%</span>
        </div>
        <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
}
