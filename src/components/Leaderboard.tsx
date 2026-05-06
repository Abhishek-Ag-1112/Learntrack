import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Course } from '../types';

import { useAuth } from '../store/AuthContext';

interface LeaderboardProps {
  course: Course;
}

interface LeaderboardEntry {
  uid: string;
  name: string;
  photoURL: string;
  completedValue: number;
  percentComplete: number;
}

export default function Leaderboard({ course }: LeaderboardProps) {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('uid, name, "photoURL", progress');

        if (error) throw error;

        if (data) {
          const entries: LeaderboardEntry[] = data.map((user: any) => {
            const courseProgress = user.progress?.[course.id] || {};
            let completedValue = 0;
            Object.values(courseProgress).forEach((status: any) => {
              if (status === 'done') completedValue += 1;
              else if (status === 'half_done') completedValue += 0.5;
            });

            const percentComplete = course.totalLectures === 0 
              ? 0 
              : Math.round((completedValue / course.totalLectures) * 100);

            return {
              uid: user.uid,
              name: user.name || 'Anonymous',
              photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'User'}`,
              completedValue,
              percentComplete
            };
          });

          // Sort by completed value descending
          entries.sort((a, b) => b.completedValue - a.completedValue);
          
          setLeaders(entries.slice(0, 10)); // Top 10
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [course, user?.progress]);

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 w-full bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🏆 Top Learners
      </h3>
      
      {leaders.length === 0 ? (
        <p className="text-textSecondary text-sm">No learners yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {leaders.map((leader, index) => (
            <div 
              key={leader.uid} 
              className="flex items-center gap-4 p-3 rounded-xl bg-surface/50 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                index === 1 ? 'bg-gray-300/20 text-gray-300' :
                index === 2 ? 'bg-amber-700/20 text-amber-500' :
                'bg-surface text-textSecondary'
              }`}>
                #{index + 1}
              </div>
              
              <img 
                src={leader.photoURL} 
                alt={leader.name} 
                className="w-10 h-10 rounded-full border border-white/10"
              />
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{leader.name}</h4>
                <div className="flex items-center gap-2 text-xs text-textSecondary">
                  <span>{Math.floor(leader.completedValue)} / {course.totalLectures}</span>
                  <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${leader.percentComplete}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="font-bold text-primary text-sm">
                {leader.percentComplete}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
