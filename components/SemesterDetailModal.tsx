import React, { useState } from 'react';
import type { Semester, Subject, Exam, SubjectStatus } from '../types';
import { ExamFormModal } from './ExamFormModal';
import { ConfirmationModal } from './ConfirmationModal';

interface SemesterDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    semester: Semester;
    subjects: Subject[];
    exams: Exam[];
    onUnassignSubject: (subjectId: string, semesterId: string) => void;
    onUpdateSubjectStatusAndGrade: (subjectId: string, newStatus: SubjectStatus, finalGrade?: number | null) => void;
    onPromptForGrade: (subject: Subject) => void;
    onSaveExam: (exam: Omit<Exam, 'id'>, id?: string) => void;
    onDeleteExam: (examId: string) => void;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>);
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);
const ArrowUturnLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>);
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>);


const statusStyles: Record<SubjectStatus, { bg: string, text: string }> = {
    pendiente: { bg: 'bg-zinc-100', text: 'text-zinc-800' },
    cursando: { bg: 'bg-blue-100', text: 'text-blue-800' },
    aprobada: { bg: 'bg-green-100', text: 'text-green-800' },
    final_pendiente: { bg: 'bg-amber-100', text: 'text-amber-800' },
    recursar: { bg: 'bg-red-100', text: 'text-red-800' },
};
const statusNames: Record<SubjectStatus, string> = {
    pendiente: 'Pendiente',
    cursando: 'Cursando',
    aprobada: 'Aprobada',
    final_pendiente: 'Final Pendiente',
    recursar: 'A Recursar',
};

export const SemesterDetailModal: React.FC<SemesterDetailModalProps> = ({ isOpen, onClose, semester, subjects, exams, onUnassignSubject, onUpdateSubjectStatusAndGrade, onPromptForGrade, onSaveExam, onDeleteExam }) => {
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [currentSubjectId, setCurrentSubjectId] = useState('');
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
    const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
    const [expandedExams, setExpandedExams] = useState<string[]>([]);

    if (!isOpen) return null;

    const semesterSubjects = semester.subjectIds.map(id => subjects.find(s => s.id === id)).filter((s): s is Subject => !!s);
    
    const openExamModal = (subjectId: string, exam: Exam | null = null) => {
        setCurrentSubjectId(subjectId);
        setEditingExam(exam);
        setIsExamModalOpen(true);
    };

    const requestExamDeletion = (exam: Exam, subjectName: string) => {
        setConfirmation({
            isOpen: true,
            title: 'Eliminar Examen',
            message: `¿Seguro que quieres eliminar "${exam.title}" de ${subjectName}?`,
            onConfirm: () => onDeleteExam(exam.id)
        });
    };

    const toggleSubjectExpansion = (subjectId: string) => {
        setExpandedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };
    
    const toggleExamExpansion = (examId: string) => {
        setExpandedExams(prev =>
            prev.includes(examId)
                ? prev.filter(id => id !== examId)
                : [...prev, examId]
        );
    };


    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4" onClick={onClose}>
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-zinc-200 flex justify-between items-center flex-shrink-0">
                        <h2 className="text-2xl font-bold text-zinc-800">{semester.term} {semester.year}</h2>
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100"><XMarkIcon className="w-6 h-6 text-zinc-500" /></button>
                    </div>
                    <div className="flex-grow overflow-y-auto max-h-[80vh] p-4 sm:p-6 space-y-3">
                        {semesterSubjects.length > 0 ? semesterSubjects.map(subject => {
                            const isExpanded = expandedSubjects.includes(subject.id);
                            const subjectExams = exams.filter(e => e.subjectId === subject.id).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                            const statusStyle = statusStyles[subject.status] || statusStyles.pendiente;
                            
                            return (
                                <div key={subject.id} className="bg-stone-50 rounded-lg border border-zinc-200 overflow-hidden transition-shadow duration-300">
                                    <div 
                                        onClick={() => toggleSubjectExpansion(subject.id)}
                                        className="p-3 cursor-pointer group hover:shadow-md transition-shadow"
                                        role="button"
                                        aria-expanded={isExpanded}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-zinc-800 text-lg">{subject.name}</p>
                                                <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                                                    <select
                                                        value={subject.status}
                                                        onChange={(e) => {
                                                            const newStatus = e.target.value as SubjectStatus;
                                                            if (newStatus === 'aprobada') onPromptForGrade(subject);
                                                            else onUpdateSubjectStatusAndGrade(subject.id, newStatus, null);
                                                        }}
                                                        className={`px-2 py-1 text-sm font-medium rounded-full appearance-none border-none focus:ring-2 focus:ring-violet-400 ${statusStyle.bg} ${statusStyle.text}`}
                                                    >
                                                        {Object.entries(statusNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                                                    </select>
                                                    {subject.status === 'aprobada' && subject.finalGrade !== null && <span className="font-bold text-xl text-green-600">{subject.finalGrade}</span>}
                                                </div>
                                            </div>
                                            <button title="Devolver al banco de materias" onClick={(e) => {e.stopPropagation(); onUnassignSubject(subject.id, semester.id)}} className="p-1.5 text-zinc-400 hover:text-blue-600 rounded-full"><ArrowUturnLeftIcon className="w-5 h-5"/></button>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-zinc-200 flex justify-between items-center">
                                            <h5 className="text-sm font-semibold text-zinc-600">Exámenes ({subjectExams.length})</h5>
                                            <ChevronDownIcon className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                    
                                    <div className={`transition-all duration-500 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <div className="px-3 pb-3">
                                                <div className="space-y-2">
                                                    {subjectExams.map(exam => {
                                                        const isExamExpanded = expandedExams.includes(exam.id);
                                                        return (
                                                        <div key={exam.id} className="bg-white rounded-md border border-zinc-200 overflow-hidden">
                                                            <div 
                                                                onClick={() => exam.topics && toggleExamExpansion(exam.id)}
                                                                className={`p-2 group flex justify-between items-center ${exam.topics ? 'cursor-pointer hover:bg-zinc-50' : ''}`}
                                                                role="button"
                                                                aria-expanded={isExamExpanded}
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-sm text-zinc-800">{exam.title} <span className="text-xs uppercase font-bold text-zinc-500">({exam.type})</span></p>
                                                                    <p className="text-xs text-zinc-500 mt-1">{new Date(exam.date + 'T00:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} - {exam.time}hs</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className={`text-lg font-bold ${exam.grade && exam.grade >= 4 ? 'text-green-600' : 'text-red-600'}`}>{exam.grade ?? 'S/N'}</p>
                                                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                                        <button onClick={() => openExamModal(subject.id, exam)} className="p-1 text-zinc-500 hover:text-violet-600 rounded-full hover:bg-zinc-100"><PencilIcon className="w-4 h-4"/></button>
                                                                        <button onClick={() => requestExamDeletion(exam, subject.name)} className="p-1 text-zinc-500 hover:text-red-600 rounded-full hover:bg-zinc-100"><TrashIcon className="w-4 h-4"/></button>
                                                                    </div>
                                                                    {exam.topics && (
                                                                        <ChevronDownIcon className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isExamExpanded ? 'rotate-180' : ''}`} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                             <div className={`transition-all duration-300 ease-in-out grid ${isExamExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                                <div className="overflow-hidden">
                                                                    <div className="px-3 pb-3 pt-1 border-t border-zinc-200">
                                                                        <h6 className="text-xs font-semibold text-zinc-600 mb-1">Temas a Evaluar:</h6>
                                                                        <p className="text-sm text-zinc-700 whitespace-pre-wrap">{exam.topics}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )})}
                                                    <button onClick={() => openExamModal(subject.id)} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-zinc-300 rounded-md text-zinc-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                                                        <PlusIcon className="w-4 h-4" />
                                                        <span className="text-xs font-medium">Añadir Examen</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }) : <p className="text-center text-zinc-500 py-8">No hay materias asignadas a este cuatrimestre.</p>}
                    </div>
                </div>
            </div>
            <ExamFormModal 
                isOpen={isExamModalOpen}
                onClose={() => setIsExamModalOpen(false)}
                onSave={(data, id) => { onSaveExam(data, id); setIsExamModalOpen(false); }}
                examToEdit={editingExam}
                subjectId={currentSubjectId}
            />
             {confirmation?.isOpen && (
                <ConfirmationModal 
                    isOpen={confirmation.isOpen}
                    onClose={() => setConfirmation(null)}
                    onConfirm={() => {
                        confirmation.onConfirm();
                        setConfirmation(null);
                    }}
                    title={confirmation.title}
                    message={confirmation.message}
                />
            )}
        </>
    );
};