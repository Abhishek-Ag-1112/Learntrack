import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../store/AuthContext';
import { parseCourses } from '../utils/markdownParser';
import type { Course } from '../types';
import { FiBookOpen, FiCopy, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

const GENERATION_PROMPT = `Please convert my syllabus or list of topics into a Course JSON structure.

Structure requirements:
1. It must be a valid JSON object.
2. It should have the following schema:
{
  "title": "Course Name",
  "description": "Short description of the course",
  "phases": [
    {
      "title": "Phase 1: Foundation",
      "lectures": [
        "Lecture 1: Time and Space Complexity",
        "Lecture 2: Big O Notation"
      ]
    }
  ]
}

Ensure all topics are organized under phases. Do not include markdown codeblocks or other explanations outside the JSON. Return only the JSON object.

Here is my syllabus:
[Paste your syllabus here]`;

const JSON_PLACEHOLDER = `{
  "title": "React Advanced Course",
  "description": "Master React hooks, design patterns, and performance optimization.",
  "phases": [
    {
      "title": "Phase 1: Advanced Hooks & Context",
      "lectures": [
        "Deep dive into useMemo and useCallback",
        "Building robust custom hooks",
        "Optimizing React Context API performance"
      ]
    },
    {
      "title": "Phase 2: State Management & Patterns",
      "lectures": [
        "Zustand vs Redux Toolkit state stores",
        "Compound components & Render Props",
        "React 19 Server Components paradigm"
      ]
    }
  ]
}`;

export default function CoursesPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const courses = useMemo(() => {
    const defaultCourses = parseCourses();
    return [...defaultCourses, ...(user?.customCourses || [])];
  }, [user?.customCourses]);

  if (!user) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(GENERATION_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setJsonText('');
    setErrorMsg(null);
  };

  const handleCreateCourse = () => {
    try {
      if (!jsonText.trim()) {
        setErrorMsg("Please paste the JSON content.");
        return;
      }
      
      const parsed = JSON.parse(jsonText);
      
      // Basic Schema Validation
      if (!parsed.title || typeof parsed.title !== 'string') {
        setErrorMsg("Course must contain a 'title' string.");
        return;
      }
      if (!parsed.phases || !Array.isArray(parsed.phases)) {
        setErrorMsg("Course must contain a 'phases' array.");
        return;
      }
      if (parsed.phases.length === 0) {
        setErrorMsg("Course must contain at least one phase.");
        return;
      }
      
      for (let i = 0; i < parsed.phases.length; i++) {
        const phase = parsed.phases[i];
        if (!phase.title || typeof phase.title !== 'string') {
          setErrorMsg(`Phase at index ${i} must have a 'title' string.`);
          return;
        }
        if (!phase.lectures || !Array.isArray(phase.lectures)) {
          setErrorMsg(`Phase '${phase.title}' at index ${i} must contain a 'lectures' array.`);
          return;
        }
        if (phase.lectures.length === 0) {
          setErrorMsg(`Phase '${phase.title}' must contain at least one lecture.`);
          return;
        }
      }

      // Convert to full Course structure
      const courseId = `custom-${Date.now()}`;
      let totalLecturesCount = 0;
      
      const structuredPhases = parsed.phases.map((phase: any, pIdx: number) => {
        const phaseId = `phase-${pIdx + 1}`;
        return {
          id: phaseId,
          title: phase.title,
          lectures: phase.lectures.map((lecture: any, lIdx: number) => {
            const lecTitle = typeof lecture === 'string' ? lecture : (lecture.title || `Lecture ${lIdx + 1}`);
            totalLecturesCount++;
            return {
              id: `${courseId}-${phaseId}-l${lIdx + 1}`,
              title: lecTitle,
              status: 'not_done' as const
            };
          })
        };
      });

      const newCourse: Course = {
        id: courseId,
        title: parsed.title,
        description: parsed.description || '',
        phases: structuredPhases,
        totalLectures: totalLecturesCount
      };

      const existingCustom = user?.customCourses || [];
      updateUser({
        customCourses: [...existingCustom, newCourse]
      });

      // Clear & Close
      setJsonText('');
      setErrorMsg(null);
      setIsModalOpen(false);
    } catch (e: any) {
      setErrorMsg(e.message || "Invalid JSON syntax. Please verify JSON formatting (braces, quotes, commas).");
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    const existingCustom = user?.customCourses || [];
    const updatedCustom = existingCustom.filter(c => c.id !== courseId);
    
    const updatedProgress = { ...(user?.progress || {}) };
    if (updatedProgress[courseId]) {
      delete updatedProgress[courseId];
    }

    updateUser({
      customCourses: updatedCustom,
      progress: updatedProgress
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 p-6 md:p-8 pt-24 md:pt-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary text-2xl">
                <FiBookOpen />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Your Courses</h1>
                <p className="text-sm text-textSecondary">Select a course to view its curriculum, track your progress, and check rankings.</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-sm font-semibold transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Add Custom Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onDelete={handleDeleteCourse} 
              />
            ))}
          </div>
        </div>
      </main>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md transition-all">
          <div className="glass-panel w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface/50">
              <div>
                <h2 className="text-xl font-bold text-white">Add Custom Course</h2>
                <p className="text-xs text-textSecondary mt-1">Create a tailored syllabus using JSON format.</p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-textSecondary hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Step-by-Step Instructions */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">How to add a course:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-surface/40 border border-white/5 rounded-xl p-3.5 flex flex-col">
                    <span className="text-xs font-bold text-secondary mb-1">Step 1</span>
                    <p className="text-xs text-textSecondary leading-relaxed">Copy the AI generation prompt below.</p>
                  </div>
                  <div className="bg-surface/40 border border-white/5 rounded-xl p-3.5 flex flex-col">
                    <span className="text-xs font-bold text-secondary mb-1">Step 2</span>
                    <p className="text-xs text-textSecondary leading-relaxed">Paste into ChatGPT/Gemini with your syllabus.</p>
                  </div>
                  <div className="bg-surface/40 border border-white/5 rounded-xl p-3.5 flex flex-col">
                    <span className="text-xs font-bold text-secondary mb-1">Step 3</span>
                    <p className="text-xs text-textSecondary leading-relaxed">Paste the generated JSON here and create!</p>
                  </div>
                </div>
              </div>

              {/* Prompt Copy Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">AI Generation Prompt</span>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 text-xs text-primary hover:opacity-90 font-medium bg-primary/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    {copiedPrompt ? <FiCheck className="text-green-400" /> : <FiCopy />}
                    {copiedPrompt ? <span className="text-green-400">Copied!</span> : <span>Copy Prompt</span>}
                  </button>
                </div>
                <div className="bg-background/80 border border-white/5 rounded-xl p-4 font-mono text-[11px] text-textSecondary/90 max-h-[160px] overflow-y-auto leading-relaxed select-all">
                  {GENERATION_PROMPT}
                </div>
              </div>

              {/* JSON Input Section */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">Course JSON Content</label>
                <textarea
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder={JSON_PLACEHOLDER}
                  className="w-full h-64 bg-background border border-white/10 rounded-xl p-4 font-mono text-xs text-green-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none leading-relaxed transition-all placeholder:text-textSecondary/30"
                />
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 flex gap-3 text-sm items-start">
                  <FiAlertTriangle className="text-lg flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Invalid JSON Format</div>
                    <div className="text-xs mt-1 text-red-300/90">{errorMsg}</div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface/50 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-semibold text-textSecondary hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCourse}
                className="px-5 py-2 bg-primary hover:opacity-90 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer"
              >
                Create Course
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
