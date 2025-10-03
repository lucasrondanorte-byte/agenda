import React, { useState } from 'react';
import type { Semester, Subject, Exam, SubjectStatus } from '../types';
import { ExamFormModal } from './ExamFormModal';

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

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);


const statusStyles: Record<SubjectStatus, { bg: string, text: string, name: string }> = {
    pendiente: { bg: 'bg-zinc-100', text: 'text-zinc-800', name: 'Pendiente' },
    cursando: { bg: 'bg-blue-100', text: 'text-blue-800', name: 'Cursando' },
    aprobada: { bg: 'bg-green-100', text: 'text-green-800', name: 'Aprobada' },
    final_pendiente: { bg: 'bg-amber-100', text: 'text-amber-800', name: 'Final Pendiente' },
    recursar: { bg: 'bg-red-100', text: 'text-red-800', name: 'A Recursar' },
};
const statuses: { id: SubjectStatus, name: string }[] = Object.entries(statusStyles).map(([id, {name}]) => ({id: id as SubjectStatus, name}));

export const SemesterDetailModal: React.FC<SemesterDetailModalProps> = ({ isOpen, onClose, semester, subjects, exams, onUnassignSubject, onUpdateSubjectStatusAndGrade, onPromptForGrade, onSaveExam, onDeleteExam }) => {
    const [isExamFormOpen, setIsExamFormOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [subjectForExam, setSubjectForExam] = useState<Subject | null>(null);

    if (!isOpen) return null;

    const semesterSubjects = semester.subjectIds
        .map(id => subjects.find(s => s.id === id))
        .filter((s): s is Subject => !!s);
        
    const handleAddExam = (subject: Subject) => {
        setSubjectForExam(subject);
        setEditingExam(null);
        setIsExamFormOpen(true);
    };

    const handleEditExam = (exam: Exam, subject: Subject) => {
        setSubjectForExam(subject);
        setEditingExam(exam);
        setIsExamFormOpen(true);
    };

    const handleStatusChange = (subjectId: string, newStatus: SubjectStatus) => {
        if (newStatus === 'aprobada') {
            const subject = subjects.find(s => s.id === subjectId);
            if(subject) onPromptForGrade(subject);
        } else {
            onUpdateSubjectStatusAndGrade(subjectId, newStatus, null);
        }
    };

    const handleSaveExamForm = (examData: Omit<Exam, 'id'>, id?: string) => {
        onSaveExam(examData, id);
        setIsExamFormOpen(false);
    };

    return (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-800">{semester.term}</h2>
                        <p className="text-lg text-zinc-600">{semester.year}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100">
                        <XMarkIcon className="w-6 h-6 text-zinc-500" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto max-h-[70vh] pr-4 -mr-4 space-y-4">
                    {semesterSubjects.length > 0 ? semesterSubjects.map(subject => {
                        const subjectExams = exams.filter(e => e.subjectId === subject.id);
                        return (
                        <div key={subject.id} className="p-4 bg-stone-50 rounded-lg border border-zinc-200">
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="text-lg font-semibold text-zinc-800">{subject.name}</h3>
                                <button onClick={() => onUnassignSubject(subject.id, semester.id)} className="text-xs font-medium text-red-600 hover:text-red-800">Quitar</button>
                            </div>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-600 mb-1">Estado</label>
                                    <select value={subject.status} onChange={(e) => handleStatusChange(subject.id, e.target.value as SubjectStatus)}
                                    className="w-full px-3 py-1.5 border border-zinc-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white">
                                        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    {subject.status === 'aprobada' && subject.finalGrade !== null && (
                                        <p className="text-sm mt-2">Nota Final: <span className="font-bold text-green-700">{subject.finalGrade}</span></p>
                                    )}
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                         <label className="block text-sm font-medium text-zinc-600">Exámenes</label>
                                         <button onClick={() => handleAddExam(subject)} className="text-xs font-medium text-violet-600 hover:text-violet-800 flex items-center gap-1">
                                             <PlusIcon className="w-3 h-3"/> Añadir
                                         </button>
                                    </div>
                                    <div className="space-y-1">
                                        {subjectExams.length > 0 ? subjectExams.map(exam => (
                                            <div key={exam.id} className="flex justify-between items-center bg-white p-1.5 rounded border border-zinc-200 group text-sm">
                                                <p className="font-medium text-zinc-700">{exam.title}</p>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditExam(exam, subject)} className="p-1 text-zinc-400 hover:text-violet-600"><PencilIcon className="w-4 h-4"/></button>
                                                    <button onClick={() => onDeleteExam(exam.id)} className="p-1 text-zinc-400 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                        )) : <p className="text-xs text-zinc-500 text-center py-2">Sin exámenes</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}) : (
                        <div className="text-center text-zinc-500 py-12 border-2 border-dashed border-zinc-200 rounded-lg">
                            <p className="font-semibold">Sin Materias</p>
                            <p className="text-sm mt-1">Arrastra materias desde el banco para asignarlas a este cuatrimestre.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {subjectForExam && (
            <ExamFormModal 
                isOpen={isExamFormOpen}
                onClose={() => setIsExamFormOpen(false)}
                onSave={handleSaveExamForm}
                examToEdit={editingExam}
                subjectId={subjectForExam.id}
            />
        )}
        </>
    );
};
