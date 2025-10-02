import React, { useState, useEffect } from 'react';
import type { JournalEntry, User } from '../types';

interface DailyReflectionProps {
  journalEntries: JournalEntry[];
  currentJournalEntry: JournalEntry | undefined;
  selectedDate: Date;
  onSave: (entry: Omit<JournalEntry, 'timestamp'>) => void;
  onOpenHistory: () => void;
  onOpenShareModal: (entry: JournalEntry) => void;
  partner: User | null;
}

const JournalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.195.025.39.05.588.082a2.25 2.25 0 0 1 2.829 2.829.096.096 0 0 0 .082.082m0 0a2.25 2.25 0 1 0 2.186 0m-2.186 0a2.25 2.25 0 0 0-2.829-2.829.096.096 0 0 1-.082-.082m0 0a2.25 2.25 0 1 0 0-2.186m0 2.186c-.195-.025-.39-.05-.588-.082a2.25 2.25 0 0 1-2.829-2.829.096.096 0 0 0-.082-.082" />
    </svg>
);


const reflectionEmotions = [
    { emoji: '😊', label: 'Contento' },
    { emoji: '😌', label: 'Tranquilo' },
    { emoji: '🤔', label: 'Pensativo' },
    { emoji: '💪', label: 'Productivo' },
    { emoji: '😟', label: 'Complicado' },
];


export const DailyReflection: React.FC<DailyReflectionProps> = ({ journalEntries, currentJournalEntry, selectedDate, onSave, onOpenHistory, onOpenShareModal, partner }) => {
  const [positiveThought, setPositiveThought] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');
  const [dayTitle, setDayTitle] = useState('');
  const [emotionEmoji, setEmotionEmoji] = useState('');

  const [isSaved, setIsSaved] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    setPositiveThought(currentJournalEntry?.positiveThought || '');
    setLessonLearned(currentJournalEntry?.lessonLearned || '');
    setDayTitle(currentJournalEntry?.dayTitle || '');
    setEmotionEmoji(currentJournalEntry?.emotionEmoji || '');
    setHasChanged(false); // Reset change tracking when date changes
  }, [currentJournalEntry, selectedDate]);
  
  const handleSave = () => {
    if (positiveThought.trim() || lessonLearned.trim() || dayTitle.trim() || emotionEmoji) {
      onSave({
        date: selectedDate.toISOString().split('T')[0],
        positiveThought,
        lessonLearned,
        dayTitle,
        emotionEmoji,
      });
      setIsSaved(true);
      setHasChanged(false);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setEmotionEmoji(emoji);
    if (!hasChanged) setHasChanged(true);
  }

  const createChangeHandler = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value as T);
      if (!hasChanged) setHasChanged(true);
    };
  };

  const isSaveDisabled = isSaved || !hasChanged;
  const isShareDisabled = !currentJournalEntry || hasChanged || !partner;


  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <JournalIcon className="w-6 h-6 text-teal-500"/>
          <h3 className="text-xl font-semibold text-zinc-700">Mi Reflexión del Día</h3>
        </div>
        <button
          onClick={onOpenHistory}
          className="text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors disabled:text-zinc-400 disabled:cursor-not-allowed"
          disabled={journalEntries.length === 0}
        >
          Ver historial
        </button>
      </div>
      <div className="space-y-6">
        <div>
          <label htmlFor="positive-thought" className="block text-sm font-medium text-zinc-600 mb-1">
            Un pensamiento positivo o agradecimiento de hoy:
          </label>
          <textarea
            id="positive-thought"
            rows={3}
            value={positiveThought}
            onChange={createChangeHandler(setPositiveThought)}
            className="w-full px-3 py-2 border border-zinc-200 bg-stone-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-300 resize-none transition-colors"
            placeholder="¿Qué te hizo sonreír hoy?"
          />
        </div>
        <div>
          <label htmlFor="lesson-learned" className="block text-sm font-medium text-zinc-600 mb-1">
            Algo que aprendí sobre mí o sobre los demás:
          </label>
          <textarea
            id="lesson-learned"
            rows={3}
            value={lessonLearned}
            onChange={createChangeHandler(setLessonLearned)}
            className="w-full px-3 py-2 border border-zinc-200 bg-stone-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-300 resize-none transition-colors"
            placeholder="Una pequeña o gran revelación..."
          />
        </div>
         <div>
            <label className="block text-sm font-medium text-zinc-600 mb-2">¿Qué emoción representa mejor este día?</label>
            <div className="flex flex-wrap justify-around bg-stone-50/70 p-3 rounded-lg gap-2">
                {reflectionEmotions.map(({emoji, label}) => (
                    <button 
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 w-20 ${emotionEmoji === emoji ? 'bg-teal-200 scale-110' : 'hover:bg-zinc-200'}`}
                    aria-label={`Seleccionar emoción: ${label}`}
                    title={label}
                    >
                        <span className="text-3xl">{emoji}</span>
                        <span className="text-xs font-medium text-zinc-700 mt-1">{label}</span>
                    </button>
                ))}
            </div>
        </div>
        <div>
          <label htmlFor="day-title" className="block text-sm font-medium text-zinc-600 mb-1">
            Si tuvieras que ponerle un título a tu día, ¿cuál sería?
          </label>
          <input
            type="text"
            id="day-title"
            value={dayTitle}
            onChange={createChangeHandler(setDayTitle)}
            className="w-full px-3 py-2 border border-zinc-200 bg-stone-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-colors"
            placeholder="p. ej., Un día de calma inesperada, Misión cumplida..."
          />
        </div>
        <div className="flex justify-end pt-2 space-x-3">
             <button
                onClick={() => onOpenShareModal(currentJournalEntry!)}
                disabled={isShareDisabled}
                title={isShareDisabled ? (partner ? 'Guarda tu reflexión para poder compartirla' : 'Conecta con una pareja para compartir') : 'Compartir reflexión'}
                className="flex items-center justify-center space-x-2 px-4 py-2 w-40 border border-zinc-300 bg-white rounded-md text-sm font-medium text-zinc-700 shadow-sm transition-colors duration-200 hover:bg-zinc-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <ShareIcon className="w-5 h-5" />
                <span>Compartir</span>
            </button>
            <button
                onClick={handleSave}
                disabled={isSaveDisabled}
                className={`flex items-center justify-center space-x-2 px-4 py-2 w-40 border border-transparent rounded-md text-sm font-medium text-white shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
                    ${isSaved ? 'bg-green-500' : 'bg-teal-600'}
                    ${isSaveDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-teal-700'}
                `}
            >
                {isSaved ? (
                    <>
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>¡Guardado!</span>
                    </>
                ) : (
                    <span>Guardar Reflexión</span>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};