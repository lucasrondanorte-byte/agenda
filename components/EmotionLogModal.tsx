import React, { useState, useMemo } from 'react';
import type { SharedEmotionState, User, EmotionMoji } from '../types';

interface EmotionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedEmotionStates: SharedEmotionState[];
  currentUser: User;
  partner: User;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);
const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const emotionMojis: Record<EmotionMoji, string> = {
    happy: '😄', content: '😊', motivated: '✨', love_you: '❤️', hug: '🤗',
    kiss: '😘', miss_you: '🥺', sad: '😢', tired: '😴', grumpy: '⛈️', angry: '😠'
};

export const EmotionLogModal: React.FC<EmotionLogModalProps> = ({ isOpen, onClose, sharedEmotionStates, currentUser, partner }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const emotionsByDate = useMemo(() => {
    return sharedEmotionStates.reduce((acc, state) => {
      acc[state.date] = state.emotions;
      return acc;
    }, {} as Record<string, { [userId: string]: EmotionMoji }>);
  }, [sharedEmotionStates]);

  if (!isOpen) return null;

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-start-${i}`} className="border-r border-b border-slate-100"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split('T')[0];
      const emotions = emotionsByDate[dateString];

      days.push(
        <div key={i} className="relative p-2 h-24 border-r border-b border-slate-100 flex flex-col">
          <span className="text-sm font-medium text-slate-600">{i}</span>
          {emotions && (
            <div className="mt-2 flex-grow flex flex-col justify-center items-center gap-1">
                {emotions[currentUser.id] && (
                    <div className="flex items-center gap-2 w-full">
                        <span className="text-xs font-medium text-slate-500">Tú:</span>
                        <span className="text-2xl">{emotionMojis[emotions[currentUser.id]]}</span>
                    </div>
                )}
                {emotions[partner.id] && (
                     <div className="flex items-center gap-2 w-full">
                        <span className="text-xs font-medium text-slate-500">{partner.name}:</span>
                        <span className="text-2xl">{emotionMojis[emotions[partner.id]]}</span>
                    </div>
                )}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Historial de Energía</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
            <XMarkIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-700">
            {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex space-x-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <ChevronLeftIcon className="w-5 h-5 text-slate-500" />
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <ChevronRightIcon className="w-5 h-5 text-slate-500" />
            </button>
            </div>
        </div>

        <div className="grid grid-cols-7 border-t border-l border-slate-100 rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
            {daysOfWeek.map(day => (
            <div key={day} className="text-center py-2 text-sm font-semibold text-slate-500 bg-slate-50 border-r border-b border-slate-100">{day}</div>
            ))}
            {renderDays()}
        </div>
      </div>
    </div>
  );
};
