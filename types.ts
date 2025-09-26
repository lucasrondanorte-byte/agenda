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
  whatsappReminder?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  routineId?: string; // ID of the parent routine
  color?: string;
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
  whatsappReminder?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  color?: string;
}


export interface JournalEntry {
  date: string; // YYYY-MM-DD
  positiveThought: string;
  lessonLearned: string;
  mood: string;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export interface TripHighlight {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  photo?: string; // base64 encoded image
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

export type NotificationType = 'pairing_request' | 'pairing_accepted' | 'new_message' | 'new_emotion' | 'event_reminder' | 'generic';

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
}


export interface User {
  id: string;
  name: string;
  pairedWith?: string | null;
}

export interface PairingRequest {
  id:string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface SharedMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface EmotionLog {
  id: string;
  userId: string;
  userName: string;
  emotion: '😊' | '😢' | '😠' | '😍' | '🤔';
  timestamp: string;
}
