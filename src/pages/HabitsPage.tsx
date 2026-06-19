import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../store/AuthContext';
import { FiActivity, FiPlus, FiTrash2, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiMinus } from 'react-icons/fi';

interface HabitLog {
  [dateStr: string]: 'done' | 'missed' | 'skipped' | 'none';
}

interface Habit {
  id: string;
  name: string;
  category: string;
  color: string;
  logs: HabitLog;
}

const DEFAULT_HABITS: Habit[] = [
  {
    id: 'h1',
    name: 'Go to gym',
    category: 'Fitness',
    color: '#10B981', // Emerald
    logs: {
      '2026-05-24': 'done',
      '2026-05-25': 'done',
      '2026-05-26': 'done',
    }
  },
  {
    id: 'h2',
    name: 'Read book',
    category: 'Learning',
    color: '#F59E0B', // Amber
    logs: {
      '2026-05-24': 'done',
      '2026-05-25': 'missed',
      '2026-05-26': 'done',
    }
  },
  {
    id: 'h3',
    name: 'Meditate 10 minutes',
    category: 'Mindfulness',
    color: '#3B82F6', // Blue
    logs: {
      '2026-05-24': 'done',
      '2026-05-25': 'skipped',
      '2026-05-26': 'done',
    }
  }
];

export default function HabitsPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Selected Month State
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  // Add Habit Form State
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Fitness');
  const [newHabitColor, setNewHabitColor] = useState('#10B981');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Load habits from user profile, or fallback to default ones
  const habits = useMemo(() => {
    if (!user) return [];
    const userHabits = user.habits;
    return userHabits && userHabits.length > 0 ? userHabits : DEFAULT_HABITS;
  }, [user]);

  // Month navigation helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate days in selected month
  const daysInMonth = useMemo(() => {
    const date = new Date(currentYear, currentMonth + 1, 0);
    const count = date.getDate();
    const days = [];
    
    for (let i = 1; i <= count; i++) {
      const dayDate = new Date(currentYear, currentMonth, i);
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      days.push({
        num: i,
        dayName: dayNames[dayDate.getDay()],
        dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }
    return days;
  }, [currentYear, currentMonth]);

  // Toggling a cell's log status: none -> done -> missed -> skipped -> none
  const handleCellClick = (habitId: string, dateStr: string) => {
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        const currentLog = h.logs[dateStr] || 'none';
        let nextLog: 'done' | 'missed' | 'skipped' | 'none' = 'done';
        
        if (currentLog === 'none') nextLog = 'done';
        else if (currentLog === 'done') nextLog = 'missed';
        else if (currentLog === 'missed') nextLog = 'skipped';
        else if (currentLog === 'skipped') nextLog = 'none';

        return {
          ...h,
          logs: {
            ...h.logs,
            [dateStr]: nextLog
          }
        };
      }
      return h;
    });

    updateUser({ habits: updatedHabits });
  };

  // Calculate stats for a single habit in current month view
  const calculateHabitStat = (habit: Habit) => {
    let completed = 0;
    let loggedDays = 0;
    
    daysInMonth.forEach(day => {
      const log = habit.logs[day.dateStr];
      if (log && log !== 'none') {
        loggedDays++;
        if (log === 'done') {
          completed++;
        }
      }
    });

    if (loggedDays === 0) return 0;
    return Math.round((completed / loggedDays) * 100);
  };

  // Calculate day-level completion score (vertical columns)
  const calculateDayStat = (dateStr: string) => {
    let completed = 0;
    let total = 0;

    habits.forEach(h => {
      const log = h.logs[dateStr];
      if (log === 'done') {
        completed++;
        total++;
      } else if (log === 'missed') {
        total++;
      }
    });

    if (total === 0) return null;
    return Math.round((completed / total) * 100);
  };

  // Add new habit
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `habit-${Math.random().toString(36).substring(7)}`,
      name: newHabitName.trim(),
      category: newHabitCategory,
      color: newHabitColor,
      logs: {}
    };

    updateUser({ habits: [...habits, newHabit] });
    setNewHabitName('');
    setShowAddForm(false);
  };

  // Delete habit
  const handleDeleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    updateUser({ habits: updatedHabits });
  };

  // Cell status renderer helper
  const renderCellStatus = (status: string) => {
    if (status === 'done') {
      return <FiCheck className="text-emerald-400 text-lg font-extrabold" />;
    }
    if (status === 'missed') {
      return <FiX className="text-rose-400 text-lg font-bold" />;
    }
    if (status === 'skipped') {
      return <FiMinus className="text-gray-400 text-lg" />;
    }
    return null;
  };

  // Calculate current active streak for a habit (consecutive checks backwards from today)
  const calculateStreak = (habit: Habit) => {
    const today = new Date();
    let streakCount = 0;
    const dateIndex = new Date(today);

    while (true) {
      const dateStr = `${dateIndex.getFullYear()}-${String(dateIndex.getMonth() + 1).padStart(2, '0')}-${String(dateIndex.getDate()).padStart(2, '0')}`;
      const log = habit.logs[dateStr] || 'none';
      
      if (log === 'done') {
        streakCount++;
      } else if (log === 'skipped') {
        // Skipped days don't break the streak but don't increment it either
      } else {
        // Anything else breaks it
        break;
      }
      
      // Move to previous day
      dateIndex.setDate(dateIndex.getDate() - 1);
      
      // Avoid infinite loop if somehow checking dates too far back
      if (streakCount > 365) break;
    }
    return streakCount;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8 pt-24 md:pt-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-2xl">
                <FiActivity />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Habit Matrix Tracker</h1>
                <p className="text-sm text-textSecondary">Build good habits. Break bad ones. Visualize monthly progression.</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <FiPlus /> New Habit
            </button>
          </div>

          {/* Add Habit Overlay Form */}
          {showAddForm && (
            <div className="glass-panel p-6 mb-8 bg-surface/50 border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">✨ Track New Habit</h3>
              <form onSubmit={handleAddHabit} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-textSecondary mb-1">Habit Name</label>
                    <input
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      placeholder="e.g. Meditate, Workout, Drink Water"
                      className="w-full bg-surface border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-textSecondary/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-textSecondary mb-1">Category</label>
                    <select
                      value={newHabitCategory}
                      onChange={(e) => setNewHabitCategory(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                    >
                      <option>Fitness</option>
                      <option>Learning</option>
                      <option>Mindfulness</option>
                      <option>Health</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-xs text-textSecondary mb-1">Color Code</label>
                    <div className="flex gap-2">
                      {['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewHabitColor(c)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${
                            newHabitColor === c ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-sm text-textSecondary hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Start Tracking
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Month Controller */}
          <div className="glass-panel p-4 mb-8 bg-surface/30 border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              🗓️ {monthNames[currentMonth]} {currentYear}
            </h3>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <FiChevronLeft />
              </button>
              <button 
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10 transition-all cursor-pointer"
              >
                Today
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* Habit Tracker Table Grid */}
          <div className="glass-panel overflow-hidden bg-surface/20 border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  {/* Calendar Weekday Names */}
                  <tr className="border-b border-white/5 bg-surface/40">
                    <th className="sticky left-0 z-20 px-4 py-3 bg-surface/90 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider min-w-[200px] border-r border-white/5">
                      Habit
                    </th>
                    {daysInMonth.map((day) => (
                      <th key={`name-${day.num}`} className="px-2 py-2 text-center text-xs font-bold text-textSecondary min-w-[36px]">
                        {day.dayName}
                      </th>
                    ))}
                  </tr>
                  
                  {/* Calendar Date Numbers */}
                  <tr className="border-b border-white/5 bg-surface/20">
                    <th className="sticky left-0 z-20 px-4 py-2 bg-surface/90 text-left text-xs text-textSecondary border-r border-white/5">
                      Success Rate & Streak
                    </th>
                    {daysInMonth.map((day) => (
                      <th key={`num-${day.num}`} className="px-2 py-2 text-center text-xs font-bold text-white">
                        {day.num}
                      </th>
                    ))}
                  </tr>

                  {/* Day-level completion score row (vertical stats) */}
                  <tr className="border-b border-white/5 bg-surface/10">
                    <th className="sticky left-0 z-20 px-4 py-1.5 bg-surface/90 text-left text-[10px] text-textSecondary uppercase tracking-wider border-r border-white/5">
                      Daily Score
                    </th>
                    {daysInMonth.map((day) => {
                      const score = calculateDayStat(day.dateStr);
                      return (
                        <th key={`score-${day.num}`} className="px-2 py-1.5 text-center text-[10px] font-bold">
                          {score !== null ? (
                            <span className={score === 100 ? 'text-emerald-400' : 'text-primary-light'}>
                              {score}%
                            </span>
                          ) : (
                            <span className="opacity-25">-</span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {habits.map((habit) => {
                    const habitPct = calculateHabitStat(habit);
                    const streakVal = calculateStreak(habit);
                    return (
                      <tr key={habit.id} className="hover:bg-white/5 transition-colors group">
                        {/* Habit Profile Card Header (Sticky) */}
                        <td className="sticky left-0 z-20 p-4 bg-surface/90 border-r border-white/5 min-w-[200px] flex items-center justify-between">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-2.5 h-10 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                            <div className="overflow-hidden">
                              <h4 className="text-sm font-bold text-white truncate max-w-[120px] group-hover:text-primary transition-colors">
                                {habit.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-textSecondary uppercase font-medium">{habit.category}</span>
                                {streakVal > 0 && (
                                  <span className="text-[10px] text-orange-400 font-bold flex items-center gap-0.5" title="Current streak">
                                    🔥 {streakVal}d
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Success percentage badge */}
                          <div className="flex flex-col items-end gap-1 select-none">
                            <div className="text-xs font-bold text-white">{habitPct}%</div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteHabit(habit.id); }}
                              className="text-textSecondary hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
                              title="Delete Habit"
                            >
                              <FiTrash2 className="text-xs" />
                            </button>
                          </div>
                        </td>

                        {/* Logs Calendar Grid Columns */}
                        {daysInMonth.map((day) => {
                          const status = habit.logs[day.dateStr] || 'none';
                          return (
                            <td 
                              key={`log-${habit.id}-${day.num}`}
                              onClick={() => handleCellClick(habit.id, day.dateStr)}
                              className={`p-1 text-center cursor-pointer select-none transition-colors border-r border-white/5 border-b border-white/5 hover:bg-white/10 ${
                                status === 'done' ? 'bg-emerald-500/10' :
                                status === 'missed' ? 'bg-rose-500/10' :
                                status === 'skipped' ? 'bg-white/5' : ''
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center border border-transparent hover:border-white/10">
                                {renderCellStatus(status)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Habit Grid Legend */}
            <div className="p-4 bg-surface/40 border-t border-white/5 flex flex-wrap gap-6 justify-center text-xs text-textSecondary">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-white/10 bg-emerald-500/10 flex items-center justify-center">
                  <FiCheck className="text-emerald-400 text-xs" />
                </div>
                <span>Completed (Click to Cycle)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-white/10 bg-rose-500/10 flex items-center justify-center">
                  <FiX className="text-rose-400 text-xs" />
                </div>
                <span>Missed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                  <FiMinus className="text-gray-400 text-xs" />
                </div>
                <span>Skipped / Rest Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-white/10 bg-transparent" />
                <span>Not Logged</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
