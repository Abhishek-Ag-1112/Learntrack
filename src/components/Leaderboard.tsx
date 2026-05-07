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
        // Fetch all profiles and progress for this course separately
        const [profilesRes, progressRes] = await Promise.all([
          supabase.from('profiles').select('id, name, "photoURL"'),
          supabase.from('progress').select('user_id, status').eq('course_id', course.id)
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (progressRes.error) throw progressRes.error;

        // Group progress by user_id
        const progressByUser: Record<string, any[]> = {};
        progressRes.data?.forEach((p: any) => {
          if (!progressByUser[p.user_id]) progressByUser[p.user_id] = [];
          progressByUser[p.user_id].push(p);
        });

        if (profilesRes.data) {
          const entries: LeaderboardEntry[] = profilesRes.data.map((profile: any) => {
            let completedValue = 0;
            const userProgress = progressByUser[profile.id] || [];

            userProgress.forEach((p: any) => {
              if (p.status === 'done') completedValue += 1;
              else if (p.status === 'half_done') completedValue += 0.5;
            });

            const percentComplete = course.totalLectures === 0
              ? 0
              : Math.round((completedValue / course.totalLectures) * 100);

            return {
              uid: profile.id,
              name: profile.name || 'Anonymous',
              photoURL: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'User'}`,
              completedValue,
              percentComplete
            };
          });

          // Sort by completed value descending, filter out zero progress
          entries.sort((a, b) => b.completedValue - a.completedValue);
          const filtered = entries.filter(e => e.completedValue > 0);

          setLeaders(filtered.slice(0, 10)); // Top 10
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
