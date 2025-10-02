import React, { useMemo } from 'react';
import type { User, EmotionMoji, PartnerNote, SharedEmotionState } from '../types';

interface PartnerNotesProps {
  partner: User;
  partnerNotes: PartnerNote[];
  sharedEmotionStates: SharedEmotionState[];
  onNavigate: () => void;
}

type SummaryItem = {
    id: string;
    // FIX: Add 'academic_summary' and 'subject_update' to the union type to match the possible types from PartnerNote.
    type: 'note' | 'reflection' | 'trip' | 'emotion' | 'academic_summary' | 'subject_update';
    timestamp: string; // ISO string
    content: string;
};

const emotionDetails: Record<EmotionMoji, { icon: string; text: string }> = {
    motivated: { icon: '✨', text: 'se siente motivado/a' },
    happy: { icon: '😄', text: 'se siente feliz' },
    content: { icon: '😊', text: 'está contento/a' },
    tired: { icon: '😴', text: 'está un poco cansado/a' },
    grumpy: { icon: '⛈️', text: 'tiene un día complicado' },
    sad: { icon: '😢', text: 'se siente triste' },
    angry: { icon: '😠', text: 'se siente enojado/a' },
    love_you: { icon: '❤️', text: 'te envía amor' },
    miss_you: { icon: '🥺', text: 'te extraña' },
    hug: { icon: '🤗', text: 'quiere un abrazo' },
    kiss: { icon: '😘', text: 'quiere un beso' },
};

const summaryItemStyles: Record<SummaryItem['type'], { bg: string, text: string, rotate: string }> = {
    note: { bg: 'bg-yellow-200', text: 'text-yellow-900', rotate: 'transform -rotate-2' },
    emotion: { bg: 'bg-pink-200', text: 'text-pink-900', rotate: 'transform rotate-1' },
    reflection: { bg: 'bg-purple-200', text: 'text-purple-900', rotate: 'transform rotate-2' },
    trip: { bg: 'bg-sky-200', text: 'text-sky-900', rotate: 'transform -rotate-1' },
    // FIX: Add styles for the new 'academic_summary' and 'subject_update' types to support their rendering.
    academic_summary: { bg: 'bg-indigo-200', text: 'text-indigo-900', rotate: 'transform rotate-1' },
    subject_update: { bg: 'bg-indigo-200', text: 'text-indigo-900', rotate: 'transform -rotate-2' },
};

export const PartnerNotes: React.FC<PartnerNotesProps> = ({ partner, partnerNotes, sharedEmotionStates, onNavigate }) => {

  const summaryItems = useMemo<SummaryItem[]>(() => {
    const noteItems: SummaryItem[] = partnerNotes
      .filter(n => n.authorId === partner.id)
      .map(n => ({
        id: n.id,
        type: n.type || 'note',
        timestamp: n.timestamp,
        content: 
            n.type === 'reflection' && n.reflectionContent ? `Reflexión: "${n.reflectionContent.dayTitle || '...'}"` :
            n.type === 'trip' && n.tripContent ? `Viaje a: "${n.tripContent.title}"` :
            `"${n.text}"`
        ,
      }));

    const emotionItems: SummaryItem[] = sharedEmotionStates
      .filter(s => s.emotions[partner.id])
      .map(s => ({
        id: s.date,
        type: 'emotion',
        timestamp: new Date(s.date).toISOString(),
        content: `${emotionDetails[s.emotions[partner.id]].icon} ${emotionDetails[s.emotions[partner.id]].text}`
      }));
      
    return [...noteItems, ...emotionItems]
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3);

  }, [partner.id, partnerNotes, sharedEmotionStates]);
  
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "ahora";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md scrapbook-background">
      <h3 className="text-xl font-semibold text-slate-700 mb-4 font-handwriting">Notas de {partner.name}</h3>
      
      {summaryItems.length > 0 ? (
        <div className="space-y-4">
          {summaryItems.map(item => {
            const style = summaryItemStyles[item.type];
            return (
              <div key={item.id} className={`p-4 rounded-md shadow-md ${style.bg} ${style.rotate}`}>
                  <p className={`text-md font-handwriting ${style.text} truncate`}>
                      {item.content}
                  </p>
                  <p className={`text-right text-xs mt-2 opacity-70 ${style.text}`}>{formatTimeAgo(item.timestamp)}</p>
              </div>
            );
          })}
          <div className="pt-3 text-center">
             <button
                onClick={onNavigate}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
             >
                Ver historial completo &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-slate-500 py-8 bg-slate-50/70 rounded-lg">
          No hay actividad reciente de {partner.name}.
        </div>
      )}
    </div>
  );
};
