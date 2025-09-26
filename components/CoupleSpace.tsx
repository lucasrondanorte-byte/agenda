import React, { useState } from 'react';
import type { User, SharedMessage, EmotionLog } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface CoupleSpaceProps {
  currentUser: User;
  partner: User;
  coupleId: string;
  messages: SharedMessage[];
  setMessages: React.Dispatch<React.SetStateAction<SharedMessage[]>>;
  emotions: EmotionLog[];
  setEmotions: React.Dispatch<React.SetStateAction<EmotionLog[]>>;
  onOpenEmotionHistory: () => void;
}

const PaperAirplaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
);


export const CoupleSpace: React.FC<CoupleSpaceProps> = ({ currentUser, partner, messages, setMessages, emotions, setEmotions, onOpenEmotionHistory }) => {
  const [newMessage, setNewMessage] = useState('');
  const emotionsAvailable: EmotionLog['emotion'][] = ['😊', '😢', '😠', '😍', '🤔'];
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: SharedMessage = {
      id: uuidv4(),
      userId: currentUser.id,
      userName: currentUser.name,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleLogEmotion = (emotion: EmotionLog['emotion']) => {
    const log: EmotionLog = {
        id: uuidv4(),
        userId: currentUser.id,
        userName: currentUser.name,
        emotion,
        timestamp: new Date().toISOString(),
    };
    setEmotions([...emotions, log]);
  };

  const sortedMessages = [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const sortedEmotions = [...emotions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10); // Show last 10

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Messages Panel */}
      <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Mensajes para {partner.name}</h3>
        <div className="flex-grow bg-slate-50 rounded-lg p-4 space-y-4 overflow-y-auto h-96">
          {sortedMessages.length > 0 ? (
            sortedMessages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.userId === currentUser.id ? 'justify-end' : ''}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.userId === currentUser.id ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                  <p className="text-sm">{msg.text}</p>
                   <p className={`text-xs mt-1 ${msg.userId === currentUser.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {msg.userName}, {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-500 h-full flex items-center justify-center">
              <p>No hay mensajes todavía. ¡Deja el primero!</p>
            </div>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="w-full px-4 py-2 border border-slate-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button type="submit" className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm disabled:bg-indigo-300" disabled={!newMessage.trim()}>
            <PaperAirplaneIcon className="w-5 h-5"/>
          </button>
        </form>
      </div>

      {/* Emotions Panel */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">¿Cómo te sientes hoy?</h3>
        <p className="text-sm text-slate-500 mb-4">Comparte tu emoción con {partner.name}.</p>
        <div className="flex justify-around bg-slate-50 p-4 rounded-lg mb-6">
            {emotionsAvailable.map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => handleLogEmotion(emoji)}
                  className="text-4xl hover:scale-125 transition-transform"
                  aria-label={`Registrar emoción: ${emoji}`}
                >
                    {emoji}
                </button>
            ))}
        </div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Registro de emociones recientes</h3>
            <button
                onClick={onOpenEmotionHistory}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
                disabled={emotions.length === 0}
            >
                Ver historial completo
            </button>
        </div>
        <ul className="space-y-3">
            {sortedEmotions.length > 0 ? (
                sortedEmotions.map(log => (
                    <li key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center">
                            <span className="text-2xl mr-4">{log.emotion}</span>
                            <p className="font-medium text-slate-700">{log.userName}</p>
                        </div>
                        <p className="text-sm text-slate-500">
                            {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric'})}, {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </li>
                ))
            ) : (
                 <p className="text-center text-slate-500 py-4">Aún no se han registrado emociones.</p>
            )}
        </ul>
      </div>
    </div>
  );
};