import React from 'react';
import type { StickyNote } from '../types';
import { StickyNoteComponent } from './StickyNote';

interface StickyNotesOverlayProps {
    notes: StickyNote[];
    onAddNote: () => void;
    onSaveNote: (note: StickyNote) => void;
    onDeleteNote: (noteId: string) => void;
    isVisible: boolean;
    onToggleVisibility: () => void;
    onSaveToIdeas: (note: StickyNote) => void;
    onConvertToGoal: (note: StickyNote) => void;
}

const PinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.437-6.528A4.043 4.043 0 0 1 9.998 4.5c1.192 0 2.31.446 3.134 1.258l4.437 6.528a1.012 1.012 0 0 1 0 .639l-4.437 6.528A4.043 4.043 0 0 1 9.998 19.5c-1.192 0-2.31-.446-3.134-1.258l-4.437-6.528Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243-4.243-4.243" />
    </svg>
);


export const StickyNotesOverlay: React.FC<StickyNotesOverlayProps> = ({ notes, onAddNote, onSaveNote, onDeleteNote, isVisible, onToggleVisibility, onSaveToIdeas, onConvertToGoal }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[1000]">
            {isVisible && notes.map(note => (
                <div key={note.id} className="pointer-events-auto">
                    <StickyNoteComponent
                        note={note}
                        onSave={onSaveNote}
                        onDelete={onDeleteNote}
                        onSaveToIdeas={onSaveToIdeas}
                        onConvertToGoal={onConvertToGoal}
                    />
                </div>
            ))}
            
            <button
                onClick={onToggleVisibility}
                title={isVisible ? 'Ocultar notas adhesivas' : 'Mostrar notas adhesivas'}
                className="pointer-events-auto fixed bottom-[100px] right-6 w-14 h-14 bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-full shadow-lg flex items-center justify-center text-zinc-600 hover:bg-white transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
                {isVisible ? <EyeSlashIcon className="w-7 h-7" /> : <EyeIcon className="w-7 h-7" />}
            </button>

            {isVisible && (
                <button
                    onClick={onAddNote}
                    title="Añadir una nota adhesiva"
                    className="pointer-events-auto fixed bottom-6 right-6 w-14 h-14 bg-yellow-300 rounded-full shadow-lg flex items-center justify-center text-yellow-900 hover:bg-yellow-400 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                    <PinIcon className="w-7 h-7" />
                </button>
            )}
        </div>
    );
};