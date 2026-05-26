import { useState } from 'react';
import { FiCheck, FiPlus, FiTrash2, FiClock } from 'react-icons/fi';
import { useAuth } from '../store/AuthContext';
import { addDays, subDays } from 'date-fns';

type DayTab = 'yesterday' | 'today' | 'tomorrow';

export default function TodoList() {
  const { user, updateUser, recordActivity } = useAuth();
  const [activeTab, setActiveTab] = useState<DayTab>('today');
  const [newTask, setNewTask] = useState('');

  if (!user) return null;

  const today = new Date();
  
  const getTargetDate = (tab: DayTab) => {
    if (tab === 'yesterday') return subDays(today, 1).toISOString().split('T')[0];
    if (tab === 'tomorrow') return addDays(today, 1).toISOString().split('T')[0];
    return today.toISOString().split('T')[0];
  };

  const activeDate = getTargetDate(activeTab);
  
  const activeTodos = user.todos.filter(t => t.date === activeDate);
  const missedYesterday = user.todos.filter(t => 
    t.date === getTargetDate('yesterday') && !t.completed
  ).length;

  const handleToggle = (id: string) => {
    const todoToToggle = user.todos.find(t => t.id === id);
    const newTodos = user.todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    updateUser({ todos: newTodos });
    
    if (todoToToggle && !todoToToggle.completed) {
      recordActivity();
    }
  };

  const handleDelete = (id: string) => {
    updateUser({ todos: user.todos.filter(t => t.id !== id) });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const newTodo = {
      id: Math.random().toString(36).substring(7),
      text: newTask.trim(),
      date: activeDate,
      completed: false
    };
    
    updateUser({ todos: [...user.todos, newTodo] });
    setNewTask('');
  };

  return (
    <div className="glass-panel flex flex-col h-[400px]">
      <div className="flex border-b border-white/10">
        <button 
          onClick={() => setActiveTab('yesterday')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'yesterday' ? 'text-white' : 'text-textSecondary hover:text-white'}`}
        >
          Yesterday
          {missedYesterday > 0 && activeTab !== 'yesterday' && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          )}
          {activeTab === 'yesterday' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button 
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'today' ? 'text-white' : 'text-textSecondary hover:text-white'}`}
        >
          Today
          {activeTab === 'today' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button 
          onClick={() => setActiveTab('tomorrow')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'tomorrow' ? 'text-white' : 'text-textSecondary hover:text-white'}`}
        >
          Tomorrow
          {activeTab === 'tomorrow' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        {activeTodos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-textSecondary">
            <FiClock className="text-4xl mb-3 opacity-20" />
            <p>No tasks for {activeTab}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeTodos.map(todo => (
              <div 
                key={todo.id} 
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${todo.completed ? 'bg-white/5 border-transparent opacity-60' : 'bg-surface/50 border-white/5 hover:border-white/10'}`}
              >
                <button 
                  onClick={() => handleToggle(todo.id)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${todo.completed ? 'bg-green-500 border-green-500 text-white' : 'border-white/20 hover:border-primary'}`}
                >
                  {todo.completed && <FiCheck className="text-xs" />}
                </button>
                <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-textSecondary' : 'text-white'}`}>
                  {todo.text}
                </span>
                {activeTab === 'yesterday' && !todo.completed && (
                  <span className="text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Missed</span>
                )}
                <button 
                  onClick={() => handleDelete(todo.id)}
                  className="text-textSecondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAdd} className="p-4 border-t border-white/10 bg-surface/30">
        <div className="relative">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder={`Add a task for ${activeTab}...`}
            className="w-full bg-surface border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-textSecondary/50"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-colors"
          >
            <FiPlus />
          </button>
        </div>
      </form>
    </div>
  );
}
