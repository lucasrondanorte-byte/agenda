import React, { useState, useMemo } from 'react';
import type { User, SharedEmotionState, EmotionMoji, QASession, PartnerNote, SubjectStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TripDetailView } from './TripDetailView';
import { GoogleGenAI } from "@google/genai";

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
  onAddReply: (noteId: string, replyText: string) => void;
  onPinNote: (note: PartnerNote) => void;
}

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
);
const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-3.181-4.991v4.99" />
    </svg>
);


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

const SubjectUpdateNoteCard: React.FC<{ note: PartnerNote }> = ({ note }) => {
    const { subjectName, newStatus, finalGrade } = note.subjectUpdateContent!;
    const isApproved = newStatus === 'aprobada';

    return (
        <div className="mt-1">
            <div className={`p-3 rounded-md border-l-4 ${isApproved ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                <p className={`text-sm ${isApproved ? 'text-green-800' : 'text-red-800'}`}>
                    {isApproved
                        ? `¡Ha aprobado `
                        : `Necesita recursar `
                    }
                    <strong className="font-bold">{subjectName}</strong>
                    {isApproved && finalGrade && ` con un ${finalGrade}!`}
                </p>
            </div>
        </div>
    );
};

const ReplyForm: React.FC<{ noteId: string, onAddReply: CoupleSpaceProps['onAddReply'], onCancel: () => void }> = ({ noteId, onAddReply, onCancel }) => {
    const [replyText, setReplyText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onAddReply(noteId, replyText.trim());
        setReplyText('');
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2 flex items-center space-x-2">
            <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Escribe una respuesta..."
                autoFocus
                className="w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Enviar</button>
        </form>
    );
};

const PinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

type QuestionCategory = "Conexión Profunda" | "Recuerdos" | "¿Qué Prefieres?" | "Futuro y Sueños" | "Aleatorio";
const questionCategories: QuestionCategory[] = ["Aleatorio", "Conexión Profunda", "Recuerdos", "¿Qué Prefieres?", "Futuro y Sueños"];

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
  onAddReply,
  onPinNote,
}) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newNote, setNewNote] = useState('');
  const [viewingTripNote, setViewingTripNote] = useState<PartnerNote | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const [generatedQuestion, setGeneratedQuestion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('Aleatorio');
  const [isWritingCustom, setIsWritingCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);


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

    const { mainNotes, repliesByNoteId } = useMemo(() => {
        const allNotes = [...partnerNotes].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const main = allNotes.filter(n => !n.replyToId);
        const replies = allNotes.filter(n => n.replyToId);
        
        const repliesMap = replies.reduce((acc, reply) => {
            if (!acc[reply.replyToId!]) {
                acc[reply.replyToId!] = [];
            }
            acc[reply.replyToId!].push(reply);
            return acc;
        }, {} as Record<string, PartnerNote[]>);

        return { mainNotes: main.reverse(), repliesByNoteId: repliesMap };

    }, [partnerNotes]);


  const handleAskQuestion = (questionText: string) => {
    const newSession: QASession = {
      id: uuidv4(),
      askerId: currentUser.id,
      question: questionText,
      askedAt: new Date().toISOString(),
    };
    setQaSessions(prev => [newSession, ...prev]);
  };
  
  const handleSendCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    handleAskQuestion(newQuestion.trim());
    setNewQuestion('');
    setIsWritingCustom(false);
  }

  const handleSendGeneratedQuestion = () => {
      if (!generatedQuestion) return;
      handleAskQuestion(generatedQuestion);
      setGeneratedQuestion(null);
  };

  const handleGenerateQuestion = async () => {
    if (!process.env.API_KEY) {
      setGenerationError("La clave API no está configurada para esta función.");
      return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let prompt = `Creá una pregunta corta y directa para hacerle a tu pareja, usando la conjugación "vos". La pregunta debe ser simple y fomentar una conversación. No agregues ninguna explicación ni texto introductorio, solo la pregunta.`;
      if (selectedCategory !== 'Aleatorio') {
        prompt += ` El tema es: '${selectedCategory}'.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const questionText = response.text;
      const cleanedQuestion = questionText.trim().replace(/^"|"$/g, ''); // Remove quotes if AI adds them
      setGeneratedQuestion(cleanedQuestion);

    } catch (e) {
      console.error("Error generating question:", e);
      setGenerationError("No se pudo generar una pregunta. Inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
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
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Pregunta del Día</h3>
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
            ) : isWritingCustom ? (
                <form onSubmit={handleSendCustomQuestion}>
                    <p className="text-sm text-slate-600 mb-2">Escribe tu pregunta para {partner.name}.</p>
                    <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="p. ej., ¿Cuál fue tu parte favorita del día?"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Preguntar</button>
                    </div>
                    <button onClick={() => setIsWritingCustom(false)} className="text-xs text-slate-500 hover:underline mt-2">Volver al juego</button>
                </form>
            ) : (
                <div className="p-4 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-lg text-center">
                    <div className="mb-4">
                        <label htmlFor="category-select" className="text-sm font-medium text-indigo-800 mr-2">Elige un mazo de cartas:</label>
                        <select
                            id="category-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as QuestionCategory)}
                            className="bg-white border border-indigo-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                           {questionCategories.map(deck => <option key={deck} value={deck}>{deck}</option>)}
                        </select>
                    </div>
                    
                    {generatedQuestion ? (
                        <div className="bg-white p-4 rounded-lg shadow-md min-h-[100px] flex flex-col justify-center items-center">
                            <p className="text-lg italic text-slate-700">"{generatedQuestion}"</p>
                            <div className="flex gap-4 mt-4">
                                <button onClick={handleGenerateQuestion} disabled={isGenerating} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50">
                                    <ArrowPathIcon className="w-4 h-4" /> {isGenerating ? 'Generando...' : 'Otra'}
                                </button>
                                <button onClick={handleSendGeneratedQuestion} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">
                                    Enviar esta pregunta
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={handleGenerateQuestion} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold transition-transform hover:scale-105 disabled:opacity-70 disabled:scale-100">
                            <SparklesIcon className="w-5 h-5" />
                            {isGenerating ? 'Generando...' : 'Generar Pregunta'}
                        </button>
                    )}
                     {generationError && <p className="text-xs text-red-600 mt-2">{generationError}</p>}
                    <button onClick={() => setIsWritingCustom(true)} className="text-xs text-slate-500 hover:underline mt-4">¿Prefieres escribir la tuya?</button>
                </div>
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
                {mainNotes.map(note => {
                    const author = getUserById(note.authorId);
                    const isCurrentUser = author.id === currentUser.id;
                    const noteReplies = repliesByNoteId[note.id] || [];

                    return (
                      <div key={note.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className="w-full max-w-sm">
                            <div className={`p-3 rounded-lg ${isCurrentUser ? 'bg-indigo-100' : 'bg-slate-100'}`}>
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
                                ) : note.type === 'subject_update' && note.subjectUpdateContent ? (
                                    <SubjectUpdateNoteCard note={note} />
                                ) : (
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.text}</p>
                                )}
                                <p className="text-xs text-slate-400 text-right mt-1">
                                    {new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                             {/* Replies */}
                            {noteReplies.length > 0 && (
                                <div className="pl-4 mt-2 space-y-2 border-l-2 border-slate-300">
                                    {noteReplies.map(reply => {
                                        const replyAuthor = getUserById(reply.authorId);
                                        const isReplyCurrentUser = replyAuthor.id === currentUser.id;
                                        return (
                                            <div key={reply.id} className={`p-2 rounded-lg text-sm ${isReplyCurrentUser ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                                                <p className="font-semibold text-xs text-slate-600">{replyAuthor.name} respondió:</p>
                                                <p className="text-slate-700">{reply.text}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                             {/* Reply action */}
                            {replyingTo === note.id ? (
                                <ReplyForm noteId={note.id} onAddReply={onAddReply} onCancel={() => setReplyingTo(null)} />
                            ) : (
                                <div className="mt-1 text-right flex items-center justify-end space-x-2">
                                    {(note.type === 'note' || !note.type) && (
                                      <button onClick={() => onPinNote(note)} title="Guardar nota en el pizarrón" className="text-xs font-semibold text-yellow-600 hover:underline">
                                        <PinIcon className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button onClick={() => setReplyingTo(note.id)} className="text-xs font-semibold text-indigo-600 hover:underline">Responder</button>
                                </div>
                            )}
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