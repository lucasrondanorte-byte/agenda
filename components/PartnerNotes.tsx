import React, { useMemo } from 'react';
import type { User, EmotionMoji, PartnerNote, SharedEmotionState, QASession } from '../types';

interface PartnerNotesProps {
  partner: User;
  partnerNotes: PartnerNote[];
  sharedEmotionStates: SharedEmotionState[];
  qaSessions: QASession[];
  onNavigate: () => void;
}

const ChatBubbleLeftEllipsisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.455.09-.934.09-1.425v-2.552c0-3.542 2.67-6.443 6-6.443h2.25c2.519 0 4.716 1.632 5.49 3.868.17.44.258.913.258 1.396Z" />
  </svg>
);
const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
);
const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);
const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);
const AcademicCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path d="M12 14.25c-2.43 0-4.68.62-6.53 1.69.58 1.13 1.34 2.14 2.26 3.06 1.32.96 2.82 1.5 4.38 1.5s3.06-.54 4.38-1.5c.92-.92 1.68-1.93 2.26-3.06C16.68 14.87 14.43 14.25 12 14.25Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25A5.25 5.25 0 0 0 17.25 9V6.75a5.25 5.25 0 0 0-5.25-5.25A5.25 5.25 0 0 0 6.75 6.75V9a5.25 5.25 0 0 0 5.25 5.25Z" />
    </svg>
);
const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
  </svg>
);


type SummaryItem = {
    id: string;
    type: 'note' | 'reflection' | 'trip' | 'emotion' | 'academic_summary' | 'subject_update' | 'question';
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

const summaryItemStyles: Record<SummaryItem['type'], { icon: React.ReactNode, color: string }> = {
    note: { icon: <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />, color: 'bg-yellow-200 text-yellow-800' },
    emotion: { icon: <HeartIcon className="w-5 h-5" />, color: 'bg-pink-200 text-pink-800' },
    reflection: { icon: <BookOpenIcon className="w-5 h-5" />, color: 'bg-purple-200 text-purple-800' },
    trip: { icon: <BriefcaseIcon className="w-5 h-5" />, color: 'bg-sky-200 text-sky-800' },
    academic_summary: { icon: <AcademicCapIcon className="w-5 h-5" />, color: 'bg-indigo-200 text-indigo-800' },
    subject_update: { icon: <AcademicCapIcon className="w-5 h-5" />, color: 'bg-indigo-200 text-indigo-800' },
    question: { icon: <QuestionMarkCircleIcon className="w-5 h-5" />, color: 'bg-cyan-200 text-cyan-800' },
};

export const PartnerNotes: React.FC<PartnerNotesProps> = ({ partner, partnerNotes, sharedEmotionStates, qaSessions, onNavigate }) => {

  const summaryItems = useMemo<SummaryItem[]>(() => {
    // 1. Find the latest emotion and make it the priority item
    const latestEmotionState = [...sharedEmotionStates]
        .filter(s => s.emotions[partner.id])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    let priorityItem: SummaryItem | null = null;
    if(latestEmotionState) {
        const emotion = latestEmotionState.emotions[partner.id];
        priorityItem = {
            id: `emotion-${latestEmotionState.date}`,
            type: 'emotion',
            timestamp: new Date(latestEmotionState.date + 'T23:59:59').toISOString(), // Set to end of day to stay recent
            content: `${partner.name} ${emotionDetails[emotion].text}: ${emotionDetails[emotion].icon}`
        };
    }

    // 2. Get all other activities (notes, questions, etc.)
    const noteItems: SummaryItem[] = partnerNotes
      .filter(n => n.authorId === partner.id)
      .map(n => {
          let content = '';
          let type: SummaryItem['type'] = n.type || 'note';
          switch (type) {
              case 'reflection':
                  content = `${partner.name} ha compartido una reflexión: "${n.reflectionContent?.dayTitle || '...'}"`;
                  break;
              case 'trip':
                  content = `${partner.name} ha compartido un viaje a "${n.tripContent?.title}"`;
                  break;
              case 'subject_update':
                  const statusText = n.subjectUpdateContent?.newStatus === 'aprobada' ? 'aprobó' : 'actualizó';
                  content = `${partner.name} ${statusText} la materia "${n.subjectUpdateContent?.subjectName}"`;
                  break;
              default:
                  content = `${partner.name} dejó una nota.`;
                  type = 'note';
          }
          return { id: n.id, type, timestamp: n.timestamp, content };
      });
    
    const questionItems: SummaryItem[] = qaSessions
        .filter(q => q.askerId === partner.id && !q.answer)
        .map(q => ({
            id: q.id,
            type: 'question',
            timestamp: q.askedAt,
            content: `${partner.name} te hizo una pregunta.`
        }));

    const otherActivities = [...noteItems, ...questionItems].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 3. Build the final list: priority item + the next 2 most recent activities
    const finalSummary: SummaryItem[] = [];
    if (priorityItem) {
        finalSummary.push(priorityItem);
    }
    finalSummary.push(...otherActivities.slice(0, 2));
    
    return finalSummary;

  }, [partner.id, partner.name, partnerNotes, sharedEmotionStates, qaSessions]);
  
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
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-semibold text-zinc-700 mb-4">Novedades de tu Conexión</h3>
      
      {summaryItems.length > 0 ? (
        <div className="space-y-4">
          <ul className="space-y-3">
            {summaryItems.map(item => {
              const style = summaryItemStyles[item.type];
              return (
                <li key={item.id} className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.color}`}>
                      {style.icon}
                    </div>
                    <p className="flex-grow text-sm text-zinc-600 truncate">
                        {item.content}
                    </p>
                    <span className="flex-shrink-0 text-xs text-zinc-400 font-medium">
                        {formatTimeAgo(item.timestamp)}
                    </span>
                </li>
              );
            })}
          </ul>
          <div className="pt-3 text-center">
             <button
                onClick={onNavigate}
                className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors"
             >
                Ver historial completo &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-zinc-500 py-8 bg-zinc-50/70 rounded-lg">
          <p>No hay actividad reciente de {partner.name}.</p>
          <p className="mt-1">¡Anímate a iniciar una conversación en el Espacio de Conexiones!</p>
        </div>
      )}
    </div>
  );
};