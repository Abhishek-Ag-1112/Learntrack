import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../store/AuthContext';
import { parseCourses } from '../utils/markdownParser';
import type { Course } from '../types';
import { FiBookOpen } from 'react-icons/fi';

export default function CoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses] = useState<Course[]>(() => parseCourses());

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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary text-2xl">
              <FiBookOpen />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Your Courses</h1>
              <p className="text-sm text-textSecondary">Select a course to view its curriculum, track your progress, and check rankings.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
