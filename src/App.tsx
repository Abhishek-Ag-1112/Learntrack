import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import TodosPage from './pages/TodosPage';
import CoursesPage from './pages/CoursesPage';
import NewsPage from './pages/NewsPage';
import HabitsPage from './pages/HabitsPage';
import { AuthProvider } from './store/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/todos" element={<TodosPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/habits" element={<HabitsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
