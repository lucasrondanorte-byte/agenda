import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { StickyNote } from '../types';

// Icons
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);
const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.478 7.478 0 0 1-7.5 0C4.58 19.64 3 17.534 3 14.797c0-2.326 1.236-4.445 3.15-5.694m11.7 0c1.914 1.249 3.15 3.368 3.15 5.694 0 2.737-1.58 4.843-3.75 5.981M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const BullseyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </svg>
);


interface StickyNoteProps {
    note: StickyNote;
    onSave: (note: StickyNote) => void;
    onDelete: (noteId: string) => void;
    onSaveToIdeas: (note: StickyNote) => void;
    onConvertToGoal: (note: StickyNote) => void;
}

const noteColors = ['#FFFACD', '#FFDDC1', '#D4F0F0', '#E2F0D4', '#F4C2C2'];


export const StickyNoteComponent: React.FC<StickyNoteProps> = ({ note, onSave, onDelete, onSaveToIdeas, onConvertToGoal }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(note.text);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    
    const noteRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const initialResizeInfo = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 });

    const handleSave = () => {
        if (text.trim()) {
            onSave({ ...note, text: text.trim() });
        } else {
            onDelete(note.id);
        }
        setIsEditing(false);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isEditing || isResizing) return;
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;

        setIsDragging(true);
        const noteRect = noteRef.current!.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - noteRect.left,
            y: e.clientY - noteRect.top,
        };
        noteRef.current?.classList.add('dragging');
        e.preventDefault();
    };
    
    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        noteRef.current?.classList.add('dragging');
        initialResizeInfo.current = {
            width: note.width,
            height: note.height,
            mouseX: e.clientX,
            mouseY: e.clientY,
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging && noteRef.current) {
            let newX = e.clientX - dragOffset.current.x;
            let newY = e.clientY - dragOffset.current.y;
            newX = Math.max(0, Math.min(newX, window.innerWidth - note.width));
            newY = Math.max(0, Math.min(newY, window.innerHeight - note.height));
            noteRef.current.style.left = `${newX}px`;
            noteRef.current.style.top = `${newY}px`;
        } else if (isResizing && noteRef.current) {
            const dx = e.clientX - initialResizeInfo.current.mouseX;
            const dy = e.clientY - initialResizeInfo.current.mouseY;
            const newWidth = Math.max(150, initialResizeInfo.current.width + dx);
            const newHeight = Math.max(150, initialResizeInfo.current.height + dy);
            noteRef.current.style.width = `${newWidth}px`;
            noteRef.current.style.height = `${newHeight}px`;
        }
    }, [isDragging, isResizing, note.width, note.height]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        noteRef.current?.classList.remove('dragging');
        if (isDragging) {
            setIsDragging(false);
            let newX = e.clientX - dragOffset.current.x;
            let newY = e.clientY - dragOffset.current.y;
            newX = Math.max(0, Math.min(newX, window.innerWidth - note.width));
            newY = Math.max(0, Math.min(newY, window.innerHeight - note.height));
            onSave({ ...note, position: { x: newX, y: newY } });
        } else if (isResizing) {
            setIsResizing(false);
            const dx = e.clientX - initialResizeInfo.current.mouseX;
            const dy = e.clientY - initialResizeInfo.current.mouseY;
            const newWidth = Math.max(150, initialResizeInfo.current.width + dx);
            const newHeight = Math.max(150, initialResizeInfo.current.height + dy);
            onSave({ ...note, width: newWidth, height: newHeight });
        }
    }, [isDragging, isResizing, onSave, note]);
    
    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp, { once: true });
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);
    
    return (
        <div
            ref={noteRef}
            className="absolute p-4 font-handwriting text-zinc-800 shadow-lg group cursor-grab"
            style={{
                backgroundColor: note.color,
                top: `${note.position.y}px`,
                left: `${note.position.x}px`,
                width: `${note.width}px`,
                height: `${note.height}px`,
                transform: `rotate(${note.rotation}deg)`,
                zIndex: isDragging || isResizing ? 1001 : 1000,
            }}
            onMouseDown={handleMouseDown}
        >
             <style>{`.dragging { z-index: 1001; cursor: grabbing; transform: scale(1.05) rotate(${note.rotation}deg) !important; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }`}</style>
            {isEditing ? (
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={handleSave}
                    autoFocus
                    className="w-full h-full bg-transparent border-none outline-none resize-none text-lg p-0"
                />
            ) : (
                <div onDoubleClick={() => setIsEditing(true)} className="w-full h-full text-lg whitespace-pre-wrap overflow-hidden break-words">
                    {note.text}
                </div>
            )}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-full shadow-md px-2 py-1">
                <button
                    onClick={() => onSaveToIdeas(note)}
                    title="Guardar en Pizarrón de Ideas"
                    className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded-full"
                >
                    <LightbulbIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onConvertToGoal(note)}
                    title="Convertir en Meta"
                    className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-full"
                >
                    <BullseyeIcon className="w-5 h-5" />
                </button>
                <div className="w-px h-5 bg-zinc-200"></div>
                <button
                    onClick={() => onDelete(note.id)}
                    title="Eliminar Nota"
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-full"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/70 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                {noteColors.map(color => (
                    <button
                        key={color}
                        onClick={() => onSave({...note, color})}
                        className={`w-5 h-5 rounded-full border-2 ${note.color === color ? 'border-zinc-600' : 'border-transparent hover:border-zinc-400'}`}
                        style={{backgroundColor: color}}
                        aria-label={`Change color to ${color}`}
                    />
                ))}
            </div>
            <div
                onMouseDown={handleResizeMouseDown}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                title="Redimensionar"
            >
                <svg width="100%" height="100%" viewBox="0 0 16 16" fill="rgba(0,0,0,0.3)">
                    <path d="M16 0 L0 16 H4 L16 4 Z M16 8 L8 16 H12 L16 12 Z M16 16 H16 V16Z"/>
                </svg>
            </div>
        </div>
    );
};