import React, { useState } from 'react';
import type { JournalEntry } from '../types';

interface ShareReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reflection: JournalEntry | null;
  onShareWithPartner: () => void;
  partnerName?: string;
}

// Icons
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);
const DocumentDuplicateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.375 2.25c.621 0 1.125.504 1.125 1.125v3.375m-13.5 0V9.375c0-.621.504-1.125 1.125-1.125h3.375m-3.375 0c.621 0 1.125.504 1.125 1.125v3.375" />
  </svg>
);

const ReflectionCard: React.FC<{ reflection: JournalEntry }> = ({ reflection }) => {
    const formattedDate = new Date(reflection.date + 'T00:00:00').toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long'
    });
    return (
        <div className="p-8 bg-white rounded-lg shadow-lg border border-zinc-100 scrapbook-background">
            <div className="text-center mb-4">
                {reflection.emotionEmoji && <p className="text-6xl mb-2">{reflection.emotionEmoji}</p>}
                <h3 className="text-3xl font-bold text-zinc-800 font-handwriting">{reflection.dayTitle}</h3>
                <p className="text-sm text-zinc-500">{formattedDate}</p>
            </div>
            <div className="space-y-4">
                {reflection.positiveThought && (
                    <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-300">
                        <p className="text-sm font-semibold text-yellow-800">Pensamiento positivo:</p>
                        <blockquote className="text-zinc-700 mt-1 italic">"{reflection.positiveThought}"</blockquote>
                    </div>
                )}
                {reflection.lessonLearned && (
                     <div className="bg-sky-50 p-4 rounded-md border-l-4 border-sky-300">
                        <p className="text-sm font-semibold text-sky-800">Lección aprendida:</p>
                        <blockquote className="text-zinc-700 mt-1 italic">"{reflection.lessonLearned}"</blockquote>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ShareReflectionModal: React.FC<ShareReflectionModalProps> = ({ isOpen, onClose, reflection, onShareWithPartner, partnerName }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    if (!isOpen || !reflection) return null;
    
    const handleCopyText = () => {
        const textToCopy = `
Reflexión del ${new Date(reflection.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
${reflection.emotionEmoji} ${reflection.dayTitle} ${reflection.emotionEmoji}

Pensamiento positivo:
${reflection.positiveThought}

Lección aprendida:
${reflection.lessonLearned}
        `.trim();
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-stone-50 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-zinc-800">Compartir Reflexión</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-200">
                        <XMarkIcon className="w-6 h-6 text-zinc-500" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {/* Preview */}
                    <div>
                        <p className="text-sm font-medium text-zinc-600 mb-2 text-center">Vista Previa</p>
                        <ReflectionCard reflection={reflection} />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center space-y-4 pt-4 border-t border-zinc-200">
                        {partnerName && (
                            <button onClick={onShareWithPartner} className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 transition-colors">
                                <UserIcon className="w-5 h-5"/>
                                <span className="font-semibold">Enviar a {partnerName}</span>
                            </button>
                        )}
                         <button onClick={handleCopyText} className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-zinc-600 text-white rounded-lg shadow-sm hover:bg-zinc-700 transition-colors">
                            <DocumentDuplicateIcon className="w-5 h-5"/>
                            <span className="font-semibold">{copyStatus === 'copied' ? '¡Copiado!' : 'Copiar Texto'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};