// Defines the shared data structures used throughout the application.
export type EventCategory = 'personal' | 'pareja' | 'trabajo' | 'otro';

export interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  description?: string;
  category: EventCategory;
  reminder: boolean;
  routineId?: string; // ID of the parent routine
  color?: string;
  completed?: boolean;
  isAcademic?: boolean; // Flag for events generated from exams
}

export interface Routine {
  id: string;
  title: string;
  time: string;
  description?: string;
  category: EventCategory;
  frequency: 'weekly' | 'monthly';
  daysOfWeek?: number[]; // 0 for Sunday, 1 for Monday...
  dayOfMonth?: number; // 1-31
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reminder: boolean;
  color?: string;
}


export interface JournalEntry {
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO String for exact time
  positiveThought: string;
  lessonLearned: string;
  dayTitle: string;
  emotionEmoji: string;
}

export type TaskStatus = 'todo' | 'inProgress' | 'done';

export interface Task {
  id: string;
  projectId: string;
  text: string;
  status: TaskStatus;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  icon?: string; // Emoji
  category?: string;
  targetDate?: string; // YYYY-MM-DD
}


export interface TripHighlight {
  id:string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  photo?: string; // base64 encoded image
  emotion?: string; // Emoji representing the feeling of the moment
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  coverPhoto?: string; // base64 encoded image
  notes?: string;
  highlights: TripHighlight[];
}

export interface ShoppingListItem {
    id: string;
    text: string;
    completed: boolean;
    completedBy?: string; // ID of the user who completed the item
}

export interface ShoppingList {
    id: string;
    title: string;
    icon: string; // Emoji
    items: ShoppingListItem[];
    ownerId: string;
    isShared?: boolean;
}

export type NotificationType = 
    | 'pairing_request' 
    | 'pairing_accepted' 
    | 'new_partner_note' 
    | 'new_qa_question' 
    | 'new_shared_emotion' 
    | 'new_shared_reflection' 
    | 'new_shared_trip'
    | 'event_reminder'
    | 'daily_reflection_prompt'
    | 'goal_checkin'
    | 'generic';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  /** For toast-only actions */
  action?: {
    label: string;
    callback: () => void;
  };
  /** To prevent duplicate notifications from being created for the same underlying event */
  relatedId?: string;
  /** Contextual data for navigation or other actions */
  data?: {
      date?: string; // e.g., for reflections or events
  };
}


export interface User {
  id: string;
  name: string;
  pairedWith?: string | null;
  pin?: string;
}

export interface PairingRequest {
  id:string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
}

// For the Q&A game
export interface QASession {
  id: string;
  askerId: string;
  question: string;
  answer?: string;
  askedAt: string; // ISO timestamp
  answeredAt?: string; // ISO timestamp
}

export interface AcademicSummaryData {
  gpa: number;
  progressPercentage: number;
  approvedCount: number;
  totalCount: number;
  recentlyApproved: { name: string; grade: number | null }[];
}


// For the little notes
export interface PartnerNote {
  id: string;
  authorId: string;
  text: string;
  timestamp: string; // ISO timestamp
  type?: 'note' | 'reflection' | 'trip' | 'academic_summary' | 'subject_update';
  reflectionContent?: Omit<JournalEntry, 'timestamp'>;
  tripContent?: Omit<Trip, 'id'>;
  academicSummaryContent?: AcademicSummaryData;
  subjectUpdateContent?: { subjectName: string; newStatus: SubjectStatus; finalGrade: number | null };
  replyToId?: string;
}


export type EmotionMoji = 'motivated' | 'content' | 'tired' | 'grumpy' | 'happy' | 'sad' | 'angry' | 'love_you' | 'miss_you' | 'hug' | 'kiss';

export interface SharedEmotionState {
  date: string; // YYYY-MM-DD
  emotions: {
    [userId: string]: EmotionMoji;
  };
}

export interface TourStep {
  element: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

// Academic Types
export interface Semester {
  id: string;
  year: number;
  term: 'Primer Cuatrimestre' | 'Segundo Cuatrimestre' | 'Verano' | 'Anual';
  subjectIds: string[]; // Array of subject IDs assigned to this semester
}

export type SubjectStatus = 'pendiente' | 'cursando' | 'aprobada' | 'recursar' | 'final_pendiente';

export interface Subject {
  id: string;
  name: string;
  status: SubjectStatus;
  finalGrade: number | null;
  prerequisiteIds: string[]; // Array of subject IDs
}

export interface Exam {
  id: string;
  subjectId: string;
  type: 'parcial' | 'final';
  title: string; // e.g., "Primer Parcial", "Final"
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  grade: number | null;
  topics?: string;
}

export interface Idea {
  id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  createdAt: string;
}

export interface StickyNote {
  id: string;
  text: string;
  position: { x: number; y: number };
  color: string;
  rotation: number;
  width: number;
  height: number;
}