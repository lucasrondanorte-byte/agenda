import React from 'react';
import type { User, SharedMessage, EmotionLog } from '../types';

interface PartnerNotesProps {
  partner: User;
  message: SharedMessage | null;
  emotion: EmotionLog | null;
}

const PinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
  </svg>
);


export const PartnerNotes: React.FC<PartnerNotesProps> = ({ partner, message, emotion }) => {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "justo ahora";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `hace ${diffInDays} d`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-xl font-semibold text-slate-700 mb-4">Notas de {partner.name}</h3>
      <div className="space-y-6">
        {message ? (
          <div className="relative bg-yellow-200 p-4 rounded-lg shadow-lg transform -rotate-2">
             <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-600">
                <PinIcon className="w-5 h-5 opacity-50" />
            </div>
            <p className="text-sm text-yellow-900 italic">"{message.text}"</p>
            <p className="text-right text-xs text-yellow-800 mt-2 font-medium">{formatTimeAgo(message.timestamp)}</p>
          </div>
        ) : (
          <div className="text-center text-sm text-slate-500 py-4 bg-slate-50 rounded-lg">
            {partner.name} no ha dejado mensajes recientes.
          </div>
        )}

        {emotion ? (
          <div className="relative bg-blue-200 p-4 rounded-lg shadow-lg transform rotate-2">
             <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600">
                <PinIcon className="w-5 h-5 opacity-50" />
            </div>
            <div className="flex items-center">
                <span className="text-3xl mr-3">{emotion.emotion}</span>
                <p className="text-sm text-blue-900">
                    {partner.name} se siente así.
                </p>
            </div>
            <p className="text-right text-xs text-blue-800 mt-1 font-medium">{formatTimeAgo(emotion.timestamp)}</p>
          </div>
        ) : (
             <div className="text-center text-sm text-slate-500 py-4 bg-slate-50 rounded-lg">
                No hay emociones recientes de {partner.name}.
            </div>
        )}
      </div>
    </div>
  );
};