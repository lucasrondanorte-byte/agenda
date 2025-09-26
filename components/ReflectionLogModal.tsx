import React from 'react';
import type { JournalEntry } from '../types';

interface ReflectionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: JournalEntry[];
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export const ReflectionLogModal: React.FC<ReflectionLogModalProps> = ({ isOpen, onClose, journalEntries }) => {
  if (!isOpen) return null;

  const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Ensure correct date parsing
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Historial de Reflexiones</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
                <XMarkIcon className="w-6 h-6 text-slate-500" />
            </button>
        </div>
        
        <div className="flex-grow overflow-y-auto max-h-[60vh] pr-2 space-y-4">
            {sortedEntries.length > 0 ? (
                sortedEntries.map(entry => (
                    <div key={entry.date} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-semibold text-indigo-700 mb-3">{formatDate(entry.date)}</p>
                        <div className="space-y-3 text-sm">
                            {entry.mood && (
                                <div>
                                    <p className="font-medium text-slate-600">Estado de ánimo:</p>
                                    <p className="text-slate-800 bg-white p-2 rounded-md">{entry.mood}</p>

                                </div>
                            )}
                            {entry.positiveThought && (
                                <div>
                                    <p className="font-medium text-slate-600">Pensamiento positivo:</p>
                                    <blockquote className="text-slate-800 bg-white p-2 rounded-md border-l-4 border-indigo-300 italic">{entry.positiveThought}</blockquote>
                                </div>
                            )}
                             {entry.lessonLearned && (
                                <div>
                                    <p className="font-medium text-slate-600">Lección aprendida:</p>
                                    <blockquote className="text-slate-800 bg-white p-2 rounded-md border-l-4 border-slate-300">{entry.lessonLearned}</blockquote>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                 <p className="text-center text-slate-500 py-8">No se han guardado reflexiones todavía.</p>
            )}
        </div>

        <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cerrar
            </button>
        </div>
      </div>
    </div>
  );
};