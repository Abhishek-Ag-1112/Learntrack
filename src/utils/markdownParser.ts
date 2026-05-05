import { Course, Phase, Lecture } from '../types';
import { courseMarkdown } from '../data/courseRaw';

export function parseCourses(): Course[] {
  // We manually split into two known parts based on the file content.
  const parts = courseMarkdown.split("Machine learnig by andrew ng");
  
  const dsaPart = parts[0];
  const mlPart = parts[1];
  
  return [
    parseCourseSection("c1", "Striver's A2Z DSA Course", dsaPart),
    parseCourseSection("c2", "Stanford CS229: Machine Learning", mlPart)
  ];
}

function parseCourseSection(id: string, title: string, text: string): Course {
  const lines = text.split('\n');
  const phases: Phase[] = [];
  let currentPhase: Phase | null = null;
  let totalLectures = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check if line is a Phase/Module header
    // e.g. ### **Phase 1: The Foundation (L1 - L16)**
    // e.g. #### **Module 1: Supervised Learning (Regression & Classification)**
    if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      const titleMatch = trimmed.match(/#+\s*(?:\*\*)?(.*?)(?:\*\*)?$/);
      if (titleMatch) {
        currentPhase = {
          id: `phase-${phases.length + 1}`,
          title: titleMatch[1],
          lectures: []
        };
        phases.push(currentPhase);
      }
    } 
    // Check if line is a lecture item
    // e.g. * [ ] 1. Don't watch my A2Z DSA Course (Strategy)
    else if (trimmed.startsWith('* [ ]') || trimmed.startsWith('* \\[')) {
      if (currentPhase) {
        // extract title
        const lectureTitle = trimmed.replace(/^\*\s*(?:\[\s*\]|\\\[\s*\\\])\s*/, '').trim();
        if (lectureTitle) {
          currentPhase.lectures.push({
            id: `${id}-${currentPhase.id}-l${currentPhase.lectures.length + 1}`,
            title: lectureTitle,
            status: 'not_done'
          });
          totalLectures++;
        }
      }
    }
  }
  
  return {
    id,
    title,
    phases,
    totalLectures
  };
}
