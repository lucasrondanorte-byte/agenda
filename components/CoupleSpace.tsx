import React, { useState, useMemo } from 'react';
import type { User, SharedEmotionState, EmotionMoji, QASession, PartnerNote } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TripDetailView } from './TripDetailView';

interface CoupleSpaceProps {
  currentUser: User;
  partner: User;
  qaSessions: QASession[];
  setQaSessions: React.Dispatch<React.SetStateAction<QASession[]>>;
  partnerNotes: PartnerNote[];
  setPartnerNotes: React.Dispatch<React.SetStateAction<PartnerNote[]>>;
  sharedEmotionStates: SharedEmotionState[];
  setSharedEmotionStates: React.Dispatch<React.SetStateAction<SharedEmotionState[]>>;
  onOpenEmotionLog: () => void;
}

const emotionMojis: { value: EmotionMoji; label: string; icon: string; bgColor: string }[] = [
    { value: 'happy', label: 'Feliz', icon: '😄', bgColor: 'bg-green-200' },
    { value: 'content', label: 'Contento', icon: '😊', bgColor: 'bg-sky-200' },
    { value: 'motivated', label: 'Motivado', icon: '✨', bgColor: 'bg-yellow-200' },
    { value: 'love_you', label: 'Te Amo', icon: '❤️', bgColor: 'bg-red-200' },
    { value: 'hug', label: 'Abrazo', icon: '🤗', bgColor: 'bg-pink-200' },
    { value: 'kiss', label: 'Beso', icon: '😘', bgColor: 'bg-rose-200' },
    { value: 'miss_you', label: 'Te Extraño', icon: '🥺', bgColor: 'bg-purple-200' },
    { value: 'sad', label: 'Triste', icon: '😢', bgColor: 'bg-blue-200' },
    { value: 'tired', label: 'Cansado', icon: '😴', bgColor: 'bg-indigo-200' },
    { value: 'grumpy', label: 'Complicado', icon: '⛈️', bgColor: 'bg-slate-300' },
    { value: 'angry', label: 'Enojado', icon: '😠', bgColor: 'bg-orange-300' },
];


const EnergyStatus: React.FC<{
    currentUserState?: EmotionMoji,
    partnerState?: EmotionMoji,
    onStateSelect: (state: EmotionMoji) => void,
    onOpenLog: () => void;
}> = ({ currentUserState, partnerState, onStateSelect, onOpenLog }) => {

    const MojiDisplay: React.FC<{ state?: EmotionMoji }> = ({ state }) => {
        const moji = state ? emotionMojis.find(e => e.value === state) : null;
        return (
            <div className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-inner transition-colors duration-300 ${moji ? moji.bgColor : 'bg-slate-200'}`}>
               {moji ? moji.icon : '?'}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xl font-semibold text-slate-800">Mi Energía de Hoy</h3>
                 <button
                    onClick={onOpenLog}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    Ver Historial
                </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Elige un "Moji" que represente tu día.</p>

            <div className="flex justify-center items-center gap-8 mb-6">
                <div className="text-center">
                    <MojiDisplay state={currentUserState} />
                    <p className="font-semibold text-slate-700 mt-2">Tú</p>
                </div>
                 <div className="text-center">
                    <MojiDisplay state={partnerState} />
                    <p className="font-semibold text-slate-700 mt-2">Tu Pareja</p>
                </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 bg-slate-50 p-3 rounded-lg">
                {emotionMojis.map(({value, label, icon}) => (
                     <button 
                        key={value}
                        onClick={() => onStateSelect(value)}
                        className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 w-20 ${currentUserState === value ? 'bg-indigo-200 scale-110' : 'hover:bg-slate-200'}`}
                        title={label}
                    >
                        <span className="text-3xl">{icon}</span>
                        <span className="text-xs font-medium text-slate-700 mt-1 text-center">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const PinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
  </svg>
);

const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);


export const CoupleSpace: React.FC<CoupleSpaceProps> = ({ 
    currentUser, partner, qaSessions, setQaSessions, 
    partnerNotes, setPartnerNotes, sharedEmotionStates, setSharedEmotionStates,
    onOpenEmotionLog
}) => {
  const [newNote, setNewNote] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [viewingTripNote, setViewingTripNote] = useState<PartnerNote | null>(null);

  const todaysDateString = new Date().toISOString().split('T')[0];

  const todaysEmotionState = useMemo(() => {
    return sharedEmotionStates.find(s => s.date === todaysDateString);
  }, [sharedEmotionStates, todaysDateString]);
  
  const myTodaysEmotion = todaysEmotionState?.emotions[currentUser.id];
  const partnerTodaysEmotion = todaysEmotionState?.emotions[partner.id];

  const handleEmotionSelect = (state: EmotionMoji) => {
      setSharedEmotionStates(prev => {
          const existingEntry = prev.find(s => s.date === todaysDateString);
          if(existingEntry) {
              return prev.map(s => s.date === todaysDateString ? {
                  ...s,
                  emotions: { ...s.emotions, [currentUser.id]: state }
              } : s);
          } else {
              return [...prev, {
                  date: todaysDateString,
                  emotions: { [currentUser.id]: state }
              }];
          }
      });
  };

  const handleSaveNote = () => {
    if (newNote.trim() === '') return;
    const note: PartnerNote = {
      id: uuidv4(),
      authorId: currentUser.id,
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
      type: 'note',
    };
    setPartnerNotes(prev => [...prev, note]);
    setNewNote('');
  };

  const sortedQASessions = useMemo(() => 
    [...qaSessions].sort((a,b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime()),
  [qaSessions]);

  const sortedPartnerNotes = useMemo(() => 
    [...partnerNotes].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  [partnerNotes]);

  const viewingTripAuthor = useMemo(() => {
    if (!viewingTripNote) return null;
    return viewingTripNote.authorId === currentUser.id ? currentUser : partner;
  }, [viewingTripNote, currentUser, partner]);

  const latestSession = sortedQASessions[0] || null;
  const unansweredQuestion = latestSession && !latestSession.answer && latestSession.askerId !== currentUser.id ? latestSession : null;
  
  const isMyTurnToAsk = !latestSession || (latestSession.answer && latestSession.askerId !== currentUser.id) || (!latestSession.answer && latestSession.askerId === currentUser.id);

  const handleAskQuestion = () => {
    if (newQuestion.trim() === '') return;
    const session: QASession = {
      id: uuidv4(),
      askerId: currentUser.id,
      question: newQuestion.trim(),
      askedAt: new Date().toISOString(),
    };
    setQaSessions(prev => [...prev, session]);
    setNewQuestion('');
  };

  const handleAnswerQuestion = () => {
    if (newAnswer.trim() === '' || !unansweredQuestion) return;
    setQaSessions(prev => prev.map(s => s.id === unansweredQuestion.id ? {
      ...s,
      answer: newAnswer.trim(),
      answeredAt: new Date().toISOString(),
    } : s));
    setNewAnswer('');
  };
  
  const completedSessions = sortedQASessions.filter(s => s.answer);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Q&A Game */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">El Juego de Preguntas</h3>
            
            {/* Action Panel */}
            <div className="p-4 bg-slate-50 rounded-lg">
              {unansweredQuestion ? (
                <div>
                  <p className="text-sm font-medium text-slate-600">{partner.name} te pregunta:</p>
                  <p className="mt-2 text-lg font-semibold text-indigo-800">"{unansweredQuestion.question}"</p>
                  <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      rows={3}
                      className="mt-4 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Escribe tu respuesta aquí..."
                  />
                  <button onClick={handleAnswerQuestion} className="mt-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
                      Responder
                  </button>
                </div>
              ) : isMyTurnToAsk ? (
                <div>
                  <p className="font-semibold text-indigo-800">¡Es tu turno de preguntar!</p>
                  <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Escribe tu pregunta..."
                  />
                  <button onClick={handleAskQuestion} className="mt-2 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
                      Enviar Pregunta
                  </button>
                </div>
              ) : (
                  <div className="text-center py-6">
                      <p className="font-semibold text-slate-700">Esperando la respuesta de {partner.name}...</p>
                      <p className="text-sm text-slate-500 mt-1">Pregunta: "{latestSession?.question}"</p>
                  </div>
              )}
            </div>

            {/* History */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-slate-700 mb-3">Historial de Conversaciones</h4>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {completedSessions.length > 0 ? (
                      completedSessions.map(s => (
                          <div key={s.id} className="p-3 bg-slate-50/70 rounded-lg">
                            <p className="text-sm text-slate-600">
                                <span className="font-semibold">{s.askerId === currentUser.id ? 'Tú' : partner.name}</span> preguntó:
                            </p>
                            <p className="font-medium text-slate-800 mt-1 italic">"{s.question}"</p>
                              <p className="text-sm text-slate-600 mt-2">
                                  <span className="font-semibold">{s.askerId === currentUser.id ? partner.name : 'Tú'}</span> respondió:
                            </p>
                            <p className="font-medium text-slate-800 mt-1 pl-3 border-l-2 border-indigo-300">{s.answer}</p>
                          </div>
                      ))
                  ) : (
                      <p className="text-center text-sm text-slate-500 py-8">Tus conversaciones aparecerán aquí.</p>
                  )}
              </div>
            </div>
          </div>

          {/* Notes Mailbox */}
          <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Buzón de Notas</h3>
              <p className="text-sm text-slate-500 mb-4">Déjale un mensaje rápido a tu pareja para alegrarle el día.</p>
              <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-handwriting text-lg"
                  placeholder="Escribe una notita aquí..."
              />
              <button onClick={handleSaveNote} className="mt-2 w-full px-4 py-2 bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-500 transition-colors shadow-sm font-semibold">
                  Dejar Nota
              </button>

               <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="text-lg font-medium text-slate-700 mb-3">Álbum de Recuerdos</h4>
                <div className="min-h-[20rem] scrapbook-background p-4 rounded-lg border border-slate-200">
                    {sortedPartnerNotes.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-8 items-start">
                            {sortedPartnerNotes.map((note, index) => {
                               const author = note.authorId === currentUser.id ? currentUser : partner;
                               const rotationClass = `transform ${index % 4 === 0 ? 'rotate-2' : index % 4 === 1 ? '-rotate-3' : index % 4 === 2 ? 'rotate-3' : '-rotate-1'}`;

                               if (note.type === 'trip' && note.tripContent) {
                                const { tripContent } = note;
                                return (
                                   <div key={note.id} onClick={() => setViewingTripNote(note)} className={`cursor-pointer group w-60 hover:scale-110 hover:!rotate-0 transition-transform ${rotationClass}`}>
                                       <div className="bg-white p-3 pb-5 shadow-xl">
                                            <div className="h-40 bg-slate-200 flex items-center justify-center overflow-hidden">
                                                {tripContent.coverPhoto ? <img src={tripContent.coverPhoto} alt={tripContent.title} className="w-full h-full object-cover"/> : <CameraIcon className="w-12 h-12 text-slate-400"/>}
                                            </div>
                                            <div className="mt-3 text-center">
                                                <h4 className="font-bold text-slate-800 text-xl font-handwriting truncate">{tripContent.title}</h4>
                                            </div>
                                        </div>
                                       <p className="text-xs text-center text-slate-500 mt-2">De: {author.name}</p>
                                   </div>
                                );
                               }

                               if (note.type === 'reflection' && note.reflectionContent) {
                                const { reflectionContent } = note;
                                return (
                                   <div key={note.id} className={`relative bg-indigo-50 p-5 shadow-lg w-64 border-l-4 border-indigo-300 ${rotationClass} hover:scale-110 hover:!rotate-0 transition-transform`}>
                                      <div className="flex justify-between items-start">
                                          <h4 className="font-bold text-slate-800 text-2xl font-handwriting pr-2">{reflectionContent.dayTitle || `Reflexión`}</h4>
                                          {reflectionContent.emotionEmoji && <span className="text-3xl">{reflectionContent.emotionEmoji}</span>}
                                      </div>
                                      {reflectionContent.positiveThought && <blockquote className="text-md text-slate-700 mt-2 italic">"{reflectionContent.positiveThought}"</blockquote>}
                                      <p className="text-right text-xs text-slate-500 mt-4">- {author.name}</p>
                                   </div>
                                );
                               }
                               // Default to a Post-it note
                               return (
                                   <div key={note.id} className={`relative w-60 h-60 p-6 flex items-center justify-center bg-yellow-300 shadow-xl ${rotationClass} hover:scale-110 hover:!rotate-0 transition-transform`}>
                                      <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-700/50"><PinIcon className="w-6 h-6" /></div>
                                      <p className="text-2xl text-yellow-900 font-handwriting whitespace-pre-wrap text-center">"{note.text}"</p>
                                      <p className="absolute bottom-2 right-2 text-xs text-yellow-800/70">De: {author.name}</p>
                                   </div>
                               )
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-slate-500 py-8">Tus notas y recuerdos compartidos aparecerán aquí.</p>
                    )}
                </div>
              </div>
          </div>
        </div>
        {/* Side Panel */}
        <div className="space-y-8">
          <EnergyStatus 
              currentUserState={myTodaysEmotion}
              partnerState={partnerTodaysEmotion}
              onStateSelect={handleEmotionSelect}
              onOpenLog={onOpenEmotionLog}
          />
        </div>
      </div>
      {viewingTripNote && viewingTripAuthor && (
        <TripDetailView
            note={viewingTripNote}
            onClose={() => setViewingTripNote(null)}
            author={viewingTripAuthor}
        />
      )}
    </>
  );
};