import React from 'react';
import type { Subject, SubjectStatus } from '../types';

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const statusStyles: Record<SubjectStatus, { bg: string, text: string, name: string }> = {
    pendiente: { bg: 'bg-zinc-100', text: 'text-zinc-800', name: 'Pendiente' },
    cursando: { bg: 'bg-blue-100', text: 'text-blue-800', name: 'Cursando' },
    aprobada: { bg: 'bg-green-100', text: 'text-green-800', name: 'Aprobada' },
    final_pendiente: { bg: 'bg-amber-100', text: 'text-amber-800', name: 'Final Pendiente' },
    recursar: { bg: 'bg-red-100', text: 'text-red-800', name: 'A Recursar' },
};

const SubjectNode: React.FC<{ subject: Subject; isCentral?: boolean }> = ({ subject, isCentral = false }) => {
    const style = statusStyles[subject.status] || statusStyles.pendiente;
    return (
        <div className={`p-3 rounded-lg border-2 w-full ${isCentral ? 'bg-white border-violet-500 shadow-lg' : 'bg-stone-50 border-stone-200'}`}>
            <p className={`font-semibold ${isCentral ? 'text-violet-800' : 'text-zinc-800'}`}>{subject.name}</p>
            <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>{style.name}</span>
        </div>
    );
};

interface DependencyViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: Subject | null;
    allSubjects: Subject[];
}

export const DependencyViewModal: React.FC<DependencyViewModalProps> = ({ isOpen, onClose, subject, allSubjects }) => {
    if (!isOpen || !subject) return null;

    const prerequisites = subject.prerequisiteIds
        .map(id => allSubjects.find(s => s.id === id))
        .filter((s): s is Subject => !!s);

    const unlocks = allSubjects.filter(s => s.prerequisiteIds.includes(subject.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-stone-100 rounded-lg shadow-xl p-6 w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-zinc-800">Correlatividades de <span className="text-violet-600">{subject.name}</span></h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-200">
                        <XMarkIcon className="w-6 h-6 text-zinc-500" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center text-center">
                    {/* Prerequisites */}
                    <div className="flex flex-col items-center">
                        <h3 className="font-bold text-zinc-600 mb-3 text-sm tracking-widest uppercase">Requiere</h3>
                        <div className="space-y-3 w-full">
                            {prerequisites.length > 0 ? (
                                prerequisites.map(p => <SubjectNode key={p.id} subject={p} />)
                            ) : (
                                <div className="text-sm text-zinc-500 p-4 bg-stone-50/50 rounded-lg border border-dashed border-zinc-300 h-full flex items-center justify-center">
                                    <p>Sin requisitos</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Arrows & Central Node */}
                    <div className="flex md:flex-col items-center justify-around md:justify-center h-full px-4">
                        <div className="hidden md:block w-px h-full bg-zinc-300 relative">
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-100 px-1 text-2xl text-zinc-400">➔</div>
                        </div>
                         <div className="block md:hidden h-px w-full bg-zinc-300 relative">
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-100 px-1 text-2xl text-zinc-400">➔</div>
                        </div>
                    </div>
                    
                    {/* Unlocks */}
                    <div className="flex flex-col items-center">
                        <h3 className="font-bold text-zinc-600 mb-3 text-sm tracking-widest uppercase">Habilita</h3>
                         <div className="space-y-3 w-full">
                            {unlocks.length > 0 ? (
                                unlocks.map(u => <SubjectNode key={u.id} subject={u} />)
                            ) : (
                                <div className="text-sm text-zinc-500 p-4 bg-stone-50/50 rounded-lg border border-dashed border-zinc-300 h-full flex items-center justify-center">
                                    <p>No habilita materias</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                 <div className="mt-8 pt-4 border-t border-zinc-200">
                    <SubjectNode subject={subject} isCentral />
                </div>
            </div>
        </div>
    );
};