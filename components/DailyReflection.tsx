import React, { useState, useEffect, useCallback } from 'react';
import type { JournalEntry } from '../types';

interface DailyReflectionProps {
  journalEntries: JournalEntry[];
  currentJournalEntry: JournalEntry | undefined;
  selectedDate: Date;
  onSave: (entry: JournalEntry) => void;
  onOpenHistory: () => void;
}

const JournalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);


export const DailyReflection: React.FC<DailyReflectionProps> = ({ journalEntries, currentJournalEntry, selectedDate, onSave, onOpenHistory }) => {
  const [positiveThought, setPositiveThought] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');
  const [mood, setMood] = useState('');

  useEffect(() => {
    setPositiveThought(currentJournalEntry?.positiveThought || '');
    setLessonLearned(currentJournalEntry?.lessonLearned || '');
    setMood(currentJournalEntry?.mood || '');
  }, [currentJournalEntry]);
  
  const dateString = selectedDate.toISOString().split('T')[0];

  const handleSave = useCallback(() => {
    onSave({
      date: dateString,
      positiveThought,
      lessonLearned,
      mood,
    });
  }, [dateString, positiveThought, lessonLearned, mood, onSave]);

  useEffect(() => {
    const handler = setTimeout(() => {
      // Only save if there is some content, prevents creating empty entries just by selecting a date
      if(positiveThought.trim() || lessonLearned.trim() || mood.trim()){
         handleSave();
      }
    }, 1000); // Debounce time: 1 second

    return () => {
      clearTimeout(handler);
    };
  }, [positiveThought, lessonLearned, mood, handleSave]);


  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <JournalIcon className="w-6 h-6 text-indigo-500"/>
          <h3 className="text-xl font-semibold text-slate-700">Mi Reflexión del Día</h3>
        </div>
        <button
          onClick={onOpenHistory}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
          disabled={journalEntries.length === 0}
        >
          Ver historial
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="positive-thought" className="block text-sm font-medium text-slate-600 mb-1">
            Un pensamiento positivo o agradecimiento de hoy:
          </label>
          <textarea
            id="positive-thought"
            rows={3}
            value={positiveThought}
            onChange={(e) => setPositiveThought(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 resize-none transition-colors"
            placeholder="¿Qué te hizo sonreír hoy?"
          />
        </div>
        <div>
          <label htmlFor="lesson-learned" className="block text-sm font-medium text-slate-600 mb-1">
            Algo que aprendí sobre mí o sobre los demás:
          </label>
          <textarea
            id="lesson-learned"
            rows={3}
            value={lessonLearned}
            onChange={(e) => setLessonLearned(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 resize-none transition-colors"
            placeholder="Una pequeña o gran revelación..."
          />
        </div>
        <div>
          <label htmlFor="mood" className="block text-sm font-medium text-slate-600 mb-1">
            Describe brevemente tu estado de ánimo general:
          </label>
          <input
            type="text"
            id="mood"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-colors"
            placeholder="p. ej., Tranquilo, enérgico, pensativo..."
          />
        </div>
      </div>
    </div>
  );
};