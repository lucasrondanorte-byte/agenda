import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Idea, Project } from '../types';

interface IdeaBoardProps {
    ideas: Idea[];
    onSaveIdea: (idea: Idea) => void;
    onDeleteIdea: (ideaId: string) => void;
    onConvertToProject: (idea: Idea) => void;
    onStartTour: () => void;
}

// Icons
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);
const BullseyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </svg>
);
const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
  </svg>
);


const noteColors = ['#FFFACD', '#FFDDC1', '#D4F0F0', '#E2F0D4', '#F4C2C2'];

const StickyNote: React.FC<{
    idea: Idea,
    onSave: (idea: Idea) => void,
    onDelete: (ideaId: string) => void,
    onConvertToProject: (idea: Idea) => void,
    boardRef: React.RefObject<HTMLDivElement>
}> = ({ idea, onSave, onDelete, onConvertToProject, boardRef }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(idea.content);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const noteRef = useRef<HTMLDivElement>(null);

    const handleSave = () => {
        if (content.trim()) {
            onSave({ ...idea, content: content.trim() });
        } else {
            // If content is empty, delete the note
            onDelete(idea.id);
        }
        setIsEditing(false);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isEditing) return;
        setIsDragging(true);
        const noteRect = noteRef.current!.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - noteRect.left,
            y: e.clientY - noteRect.top,
        };
        e.preventDefault();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !boardRef.current || !noteRef.current) return;
        
        const boardRect = boardRef.current.getBoundingClientRect();
        
        let newX = e.clientX - boardRect.left - dragOffset.current.x;
        let newY = e.clientY - boardRect.top - dragOffset.current.y;

        // Constrain within board
        newX = Math.max(0, Math.min(newX, boardRect.width - noteRef.current.offsetWidth));
        newY = Math.max(0, Math.min(newY, boardRect.height - noteRef.current.offsetHeight));

        noteRef.current.style.transform = `translate(${newX - idea.position.x}px, ${newY - idea.position.y}px)`;

    }, [isDragging, boardRef, idea.position.x, idea.position.y]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (!isDragging || !boardRef.current || !noteRef.current) return;

        setIsDragging(false);
        
        const boardRect = boardRef.current.getBoundingClientRect();
        let newX = e.clientX - boardRect.left - dragOffset.current.x;
        let newY = e.clientY - boardRect.top - dragOffset.current.y;

        newX = Math.max(0, Math.min(newX, boardRect.width - noteRef.current.offsetWidth));
        newY = Math.max(0, Math.min(newY, boardRect.height - noteRef.current.offsetHeight));

        noteRef.current.style.transform = '';
        onSave({ ...idea, position: { x: newX, y: newY } });

    }, [isDragging, onSave, idea, boardRef]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            ref={noteRef}
            className="absolute w-60 h-60 p-4 font-handwriting text-zinc-800 shadow-lg group cursor-grab"
            style={{ 
                backgroundColor: idea.color, 
                top: `${idea.position.y}px`, 
                left: `${idea.position.x}px`,
                transform: `rotate(${((idea.id.charCodeAt(0) % 10) - 5)}deg)`, // Stable random rotation
            }}
            onMouseDown={handleMouseDown}
        >
            {isEditing ? (
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleSave}
                    autoFocus
                    className="w-full h-full bg-transparent border-none outline-none resize-none text-lg"
                />
            ) : (
                <p onDoubleClick={() => setIsEditing(true)} className="w-full h-full text-lg whitespace-pre-wrap overflow-hidden">
                    {idea.content}
                </p>
            )}

            <div className="absolute -top-3 -right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onConvertToProject(idea)} title="Convertir en Proyecto" className="p-2 bg-white rounded-full shadow-md hover:bg-teal-100"><BullseyeIcon className="w-4 h-4 text-teal-600"/></button>
                <button onClick={() => onDelete(idea.id)} title="Eliminar Idea" className="p-2 bg-white rounded-full shadow-md hover:bg-red-100"><TrashIcon className="w-4 h-4 text-red-600"/></button>
            </div>
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/70 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                {noteColors.map(color => (
                    <button key={color} onClick={() => onSave({...idea, color})} className={`w-5 h-5 rounded-full border-2 ${idea.color === color ? 'border-zinc-600' : 'border-transparent hover:border-zinc-400'}`} style={{backgroundColor: color}} />
                ))}
            </div>
        </div>
    );
};

export const IdeaBoard: React.FC<IdeaBoardProps> = ({ ideas, onSaveIdea, onDeleteIdea, onConvertToProject, onStartTour }) => {
    const boardRef = useRef<HTMLDivElement>(null);

    const handleAddNewIdea = () => {
        const newIdea: Idea = {
            id: crypto.randomUUID(),
            content: 'Nueva idea...',
            color: noteColors[Math.floor(Math.random() * noteColors.length)],
            position: { x: 50, y: 50 },
            createdAt: new Date().toISOString()
        };
        onSaveIdea(newIdea);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
             <style>{`
                .idea-board-background {
                    background-color: #D2B48C;
                    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW3CwsKenp6mpqaBgYF9fX2wsLCjo6Orq6urq6vNzc3p6enFxcXj4+PW1tbT09Pb29vR0dHY2NjBwcG4uLi8vLza2try8vI2tQsfAAAAGklEQVRIx+3Qyw0AIAgE0f//p725Q0yAiQoAGgmMIr1r3hQhY2BgeP8PBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBASsy5e489cBEBAQEHABQbb0VwAAAA96VFh0cmRraXRQS0cgU0hvd2NBTlLgIhgAAAAASUVORK5CYII=');
                }
             `}</style>
            <div id="ideas-panel-header" className="flex-shrink-0 flex justify-between items-center mb-4 px-2">
                <h2 className="text-2xl font-bold text-zinc-800">Pizarrón de Ideas</h2>
                 <div className="flex items-center space-x-2">
                    <button onClick={onStartTour} title="Iniciar tour guiado" className="p-2 text-zinc-500 hover:text-yellow-700 rounded-full hover:bg-yellow-100/50 transition-colors">
                        <QuestionMarkCircleIcon className="w-6 h-6"/>
                    </button>
                    <button onClick={handleAddNewIdea} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-md font-semibold shadow-sm hover:bg-yellow-500 transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        Añadir Idea
                    </button>
                </div>
            </div>

            <div ref={boardRef} className="relative flex-grow rounded-lg overflow-hidden idea-board-background border-8 border-[#6b4f3a] shadow-inner">
                {ideas.map(idea => (
                    <StickyNote 
                        key={idea.id}
                        idea={idea}
                        onSave={onSaveIdea}
                        onDelete={onDeleteIdea}
                        onConvertToProject={onConvertToProject}
                        boardRef={boardRef}
                    />
                ))}
            </div>
        </div>
    );
};
