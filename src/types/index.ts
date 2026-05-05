export interface Lecture {
  id: string;
  title: string;
  status: 'not_done' | 'half_done' | 'done';
}

export interface Phase {
  id: string;
  title: string;
  lectures: Lecture[];
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  phases: Phase[];
  totalLectures: number;
}

export interface UserProgress {
  [courseId: string]: {
    [lectureId: string]: 'not_done' | 'half_done' | 'done';
  }
}

export interface Todo {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
}

export interface HeatmapData {
  date: string;
  count: number;
}

export interface UserData {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  progress: UserProgress;
  todos: Todo[];
  activity: HeatmapData[];
}

export const _types = true;
