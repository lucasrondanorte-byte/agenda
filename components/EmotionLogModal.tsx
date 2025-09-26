import React from 'react';
import type { EmotionLog } from '../types';

interface EmotionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  emotions: EmotionLog[];
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export const EmotionLogModal: React.FC<EmotionLogModalProps> = ({ isOpen, onClose, emotions }) => {
  if (!isOpen) return null;

  const sortedEmotions = [...emotions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Historial de Emociones</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
                <XMarkIcon className="w-6 h-6 text-slate-500" />
            </button>
        </div>
        
        <div className="flex-grow overflow-y-auto max-h-[60vh] pr-2">
            {sortedEmotions.length > 0 ? (
                <ul className="space-y-3">
                    {sortedEmotions.map(log => (
                        <li key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center">
                                <span className="text-3xl mr-4">{log.emotion}</span>
                                <div>
                                    <p className="font-medium text-slate-800">{log.userName}</p>
                                     <p className="text-xs text-slate-500">
                                        {new Date(log.timestamp).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric'})}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-center text-slate-500 py-8">No se han registrado emociones todavía.</p>
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