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
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-inner transition-colors duration-300 ${moji ? moji.bgColor : 'bg-slate-200'}`}>
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

            <div className="flex justify-center items-center gap-4 sm:gap-8 mb-6">
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

// FIX: Add missing CoupleSpace component export
export const CoupleSpace: React.FC<CoupleSpaceProps> = ({
  currentUser,
  partner,
  qaSessions,
  setQaSessions,
  partnerNotes,
  setPartnerNotes,
  sharedEmotionStates,
  setSharedEmotionStates,
  onOpenEmotionLog,
}) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newNote, setNewNote] = useState('');
  const [viewingTripNote, setViewingTripNote] = useState<PartnerNote | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const todaysEmotionState = useMemo(() => {
    return sharedEmotionStates.find(s => s.date === today);
  }, [sharedEmotionStates, today]);

  const handleSaveEmotion = (moji: EmotionMoji) => {
    const existingStateIndex = sharedEmotionStates.findIndex(s => s.date === today);
    if (existingStateIndex > -1) {
      setSharedEmotionStates(prev => {
        const newState = [...prev];
        newState[existingStateIndex] = {
          ...newState[existingStateIndex],
          emotions: {
            ...newState[existingStateIndex].emotions,
            [currentUser.id]: moji,
          },
        };
        return newState;
      });
    } else {
      setSharedEmotionStates(prev => [
        ...prev,
        { date: today, emotions: { [currentUser.id]: moji } },
      ]);
    }
  };

  const pendingQuestionForUser = useMemo(() => {
    return qaSessions.find(s => s.askerId === partner.id && !s.answer);
  }, [qaSessions, partner.id]);

  const answeredQuestions = useMemo(() => {
    return [...qaSessions]
        .filter(s => s.answer)
        .sort((a,b) => new Date(b.answeredAt!).getTime() - new Date(a.answeredAt!).getTime());
  }, [qaSessions]);

  const allNotesAndSharedItems = useMemo(() => {
      return [...partnerNotes]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [partnerNotes]);


  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const newSession: QASession = {
      id: uuidv4(),
      askerId: currentUser.id,
      question: newQuestion.trim(),
      askedAt: new Date().toISOString(),
    };
    setQaSessions(prev => [newSession, ...prev]);
    setNewQuestion('');
  };

  const handleAnswerQuestion = (sessionId: string) => {
    if (!answer.trim()) return;
    setQaSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, answer: answer.trim(), answeredAt: new Date().toISOString() } : s
    ));
    setAnswer('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const note: PartnerNote = {
      id: uuidv4(),
      authorId: currentUser.id,
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
      type: 'note',
    };
    setPartnerNotes(prev => [note, ...prev]);
    setNewNote('');
  };
  
  const getUserById = (id: string) => id === currentUser.id ? currentUser : partner;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <EnergyStatus
            currentUserState={todaysEmotionState?.emotions[currentUser.id]}
            partnerState={todaysEmotionState?.emotions[partner.id]}
            onStateSelect={handleSaveEmotion}
            onOpenLog={onOpenEmotionLog}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Q&A Section */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Preguntas y Respuestas</h3>
            {pendingQuestionForUser ? (
              <div className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg">
                <p className="font-semibold text-indigo-800">{partner.name} te pregunta:</p>
                <p className="mt-2 text-indigo-900 italic">"{pendingQuestionForUser.question}"</p>
                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Tu respuesta..."
                    className="w-full px-3 py-2 border border-indigo-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button onClick={() => handleAnswerQuestion(pendingQuestionForUser.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Enviar</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAskQuestion}>
                <p className="text-sm text-slate-600 mb-2">Hazle una pregunta a {partner.name} para conectar.</p>
                <div className="flex space-x-2">
                   <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="p. ej., ¿Cuál fue tu parte favorita del día?"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Preguntar</button>
                </div>
              </form>
            )}

            {answeredQuestions.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-medium text-slate-600 text-sm mb-2">Conversaciones pasadas</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {answeredQuestions.map(qa => (
                            <div key={qa.id} className="p-3 bg-slate-50 rounded-lg text-sm">
                                <p><strong className="text-slate-700">{getUserById(qa.askerId).name}:</strong> "{qa.question}"</p>
                                <p className="mt-1 pl-4"><strong className="text-slate-600">R:</strong> {qa.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
          
          {/* Notes section */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Notas y Recuerdos Compartidos</h3>
             <form onSubmit={handleAddNote} className="mb-6">
                <textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    rows={2}
                    placeholder={`Deja una nota para ${partner.name}...`}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <div className="flex justify-end mt-2">
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">Publicar Nota</button>
                </div>
            </form>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {allNotesAndSharedItems.map(note => {
                    const author = getUserById(note.authorId);
                    const isCurrentUser = author.id === currentUser.id;
                    return (
                        <div key={note.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-sm ${isCurrentUser ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                <p className="font-semibold text-sm text-slate-800">{isCurrentUser ? 'Tú' : author.name}</p>
                                {note.type === 'reflection' && note.reflectionContent ? (
                                    <div className="mt-1">
                                        <p className="text-sm text-slate-600">Compartió una reflexión:</p>
                                        <div className="mt-1 p-2 bg-white/50 rounded-md border border-slate-200">
                                            <p className="font-medium italic">"{note.reflectionContent.dayTitle}"</p>
                                        </div>
                                    </div>
                                ) : note.type === 'trip' && note.tripContent ? (
                                     <div className="mt-1">
                                        <p className="text-sm text-slate-600">Compartió un viaje:</p>
                                        <button onClick={() => setViewingTripNote(note)} className="mt-1 p-2 bg-white/50 rounded-md border border-slate-200 w-full text-left hover:bg-white">
                                            <p className="font-medium italic">"{note.tripContent.title}"</p>
                                            <span className="text-xs text-indigo-600">Ver detalles</span>
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.text}</p>
                                )}
                                <p className="text-xs text-slate-400 text-right mt-1">
                                    {new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      </div>
      {viewingTripNote && (
        <TripDetailView 
            note={viewingTripNote}
            onClose={() => setViewingTripNote(null)}
            author={getUserById(viewingTripNote.authorId)}
        />
      )}
    </>
  );
};

const PinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    {/* FIX: Corrected corrupted SVG path data and removed trailing invalid characters. */}
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25h2.25a.75.75 0 0 0 0-1.5H12.75V9Z" clipRule="evenodd" />
  </svg>
);
