import React, { useState, useMemo } from 'react';
import type { Semester, Subject, Exam, SubjectStatus, User } from '../types';
import { SemesterFormModal } from './SemesterFormModal';
import { SubjectFormModal } from './SubjectFormModal';
import { AcademicProgressChart } from './AcademicProgressChart';
import { DependencyViewModal } from './DependencyViewModal';
import { ConfirmationModal } from './ConfirmationModal';
import { SemesterDetailModal } from './SemesterDetailModal';

interface AcademicPanelProps {
  semesters: Semester[];
  subjects: Subject[];
  exams: Exam[];
  onSaveSemester: (semester: Omit<Semester, 'id'>, id?: string) => void;
  onDeleteSemester: (semesterId: string) => void;
  onSaveSubject: (subject: Omit<Subject, 'id'>, id?: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onSaveExam: (exam: Omit<Exam, 'id'>, id?: string) => void;
  onDeleteExam: (examId: string) => void;
  onAssignSubject: (subjectId: string, semesterId: string) => void;
  onUnassignSubject: (subjectId: string, semesterId: string) => void;
  onUpdateSubjectStatusAndGrade: (subjectId: string, newStatus: SubjectStatus, finalGrade?: number | null) => void;
  onPromptForGrade: (subject: Subject) => void;
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>);
const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>);
const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>);
const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.195.025.39.05.588.082a2.25 2.25 0 0 1 2.829 2.829.096.096 0 0 0 .082.082m0 0a2.25 2.25 0 1 0 2.186 0m-2.186 0a2.25 2.25 0 0 0-2.829-2.829.096.096 0 0 1-.082-.082m0 0a2.25 2.25 0 1 0 0-2.186m0 2.186c-.195-.025-.39-.05-.588-.082a2.25 2.25 0 0 1-2.829-2.829.096.096 0 0 0-.082-.082" /></svg>);
const EllipsisVerticalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>);
const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962A3.75 3.75 0 0 1 15 12a3.75 3.75 0 0 1-2.25-6.962m8.024 10.928A9 9 0 1 0 3 18.72m10.602 0A9.01 9.01 0 0 0 18 18.72m-7.5 0v-2.25m0 2.25a3.75 3.75 0 0 0 3.75 3.75M10.5 18.75a3.75 3.75 0 0 0-3.75 3.75m0 0a3.75 3.75 0 0 0 3.75-3.75M3 13.5A3.75 3.75 0 0 1 6.75 9.75a3.75 3.75 0 0 1 3.75 3.75m-3.75 0a3.75 3.75 0 0 0-3.75 3.75" />
  </svg>
);


const statusStyles: Record<SubjectStatus, { bg: string, text: string, name: string }> = {
    pendiente: { bg: 'bg-zinc-100', text: 'text-zinc-800', name: 'Pendiente' },
    cursando: { bg: 'bg-blue-100', text: 'text-blue-800', name: 'Cursando' },
    aprobada: { bg: 'bg-green-100', text: 'text-green-800', name: 'Aprobada' },
    final_pendiente: { bg: 'bg-amber-100', text: 'text-amber-800', name: 'Final Pendiente' },
    recursar: { bg: 'bg-red-100', text: 'text-red-800', name: 'A Recursar' },
};

export const AcademicPanel: React.FC<AcademicPanelProps> = ({ semesters, subjects, exams, ...handlers }) => {
    const [modals, setModals] = useState({ semester: false, subject: false });
    const [editing, setEditing] = useState<{ semester?: Semester, subject?: Subject }>({});
    const [isProgressVisible, setIsProgressVisible] = useState(false);
    const [viewingSubjectDeps, setViewingSubjectDeps] = useState<Subject | null>(null);
    const [viewingSemester, setViewingSemester] = useState<Semester | null>(null);
    const [dragOverSemester, setDragOverSemester] = useState<string | null>(null);

    const [confirmationState, setConfirmationState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; } | null>(null);
    
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
    const unassignedSubjects = useMemo(() => subjects.filter(s => !semesters.some(sem => sem.subjectIds.includes(s.id))), [subjects, semesters]);
    const sortedSemesters = useMemo(() => [...semesters].sort((a, b) => a.year - b.year || a.term.localeCompare(b.term)), [semesters]);
        
    const arePrerequisitesMet = (subject: Subject): boolean => {
        if (!subject.prerequisiteIds || subject.prerequisiteIds.length === 0) return true;
        return subject.prerequisiteIds.every(id => subjectMap.get(id)?.status === 'aprobada');
    };

    const requestSemesterDeletion = (semester: Semester) => {
        setConfirmationState({
            isOpen: true,
            title: `Eliminar Cuatrimestre`,
            message: `¿Estás seguro de que quieres eliminar "${semester.term} ${semester.year}"? Las materias asignadas volverán al banco de materias.`,
            onConfirm: () => handlers.onDeleteSemester(semester.id)
        });
    };

    const requestSubjectDeletion = (subject: Subject) => {
        setConfirmationState({
            isOpen: true,
            title: 'Eliminar Materia',
            message: `¿Estás seguro de que quieres eliminar la materia "${subject.name}"? Esta acción es permanente y la eliminará del plan de estudios y de cualquier cuatrimestre.`,
            onConfirm: () => handlers.onDeleteSubject(subject.id)
        });
    };
    
    const onDragStart = (e: React.DragEvent<HTMLDivElement>, subjectId: string) => {
        e.dataTransfer.setData("subjectId", subjectId);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>, semesterId: string) => {
        e.preventDefault();
        const subjectId = e.dataTransfer.getData("subjectId");
        const subject = subjectMap.get(subjectId);
        if (subject && arePrerequisitesMet(subject)) {
            handlers.onAssignSubject(subjectId, semesterId);
        }
        setDragOverSemester(null);
    };
    
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Subject Bank */}
                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col">
                     <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-xl font-semibold text-zinc-700">Banco de Materias</h3>
                        <button onClick={() => { setEditing({}); setModals({...modals, subject: true})}} className="flex items-center space-x-2 text-sm font-medium text-violet-600 hover:text-violet-800">
                            <PlusIcon className="w-5 h-5"/>
                            <span>Añadir Materia</span>
                        </button>
                    </div>
                    <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                        {unassignedSubjects.length > 0 ? unassignedSubjects.map(subject => {
                            const canAssign = arePrerequisitesMet(subject);
                            const statusStyle = statusStyles[subject.status] || statusStyles.pendiente;
                            return (
                                <div 
                                    key={subject.id} 
                                    draggable={canAssign}
                                    onDragStart={(e) => canAssign && onDragStart(e, subject.id)}
                                    className={`p-3 rounded-md flex justify-between items-center bg-stone-50 group relative transition-colors ${canAssign ? 'cursor-grab hover:bg-stone-100' : 'cursor-not-allowed opacity-70'}`}
                                    title={canAssign ? `Arrastra para asignar ${subject.name}`: `Requiere correlativas`}
                                >
                                    <div className="flex items-center gap-2">
                                        {!canAssign && <LockClosedIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />}
                                        <div>
                                            <p className="font-medium text-zinc-800">{subject.name}</p>
                                            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>{statusStyle.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 pr-3">
                                        <button onClick={() => setViewingSubjectDeps(subject)} className="p-1 text-zinc-400 hover:text-violet-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><ShareIcon className="w-4 h-4"/></button>
                                        <button onClick={() => requestSubjectDeletion(subject)} title="Eliminar materia" className="p-1 text-zinc-400 hover:text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            );
                        }) : (
                             <div className="text-center text-zinc-500 py-12 border-2 border-dashed border-zinc-200 rounded-lg">
                                <p className="font-semibold">¡Todo asignado!</p>
                                <p className="text-sm mt-1">Todas las materias de tu plan están en un cuatrimestre.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Timeline */}
                <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-xl shadow-md">
                     <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-zinc-700">Línea de Tiempo</h3>
                        <div className="flex items-center space-x-2">
                             <button onClick={() => setIsProgressVisible(!isProgressVisible)} className="flex items-center space-x-2 text-sm font-medium text-violet-600 hover:text-violet-800">
                                <ChartBarIcon className="w-5 h-5"/>
                                <span>Progreso</span>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isProgressVisible ? 'rotate-180' : ''}`} />
                            </button>
                            <button onClick={() => { setEditing({}); setModals({...modals, semester: true})}} className="flex items-center space-x-2 text-sm font-medium text-violet-600 hover:text-violet-800">
                                <PlusIcon className="w-5 h-5"/>
                                <span>Cuatrimestre</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isProgressVisible ? 'max-h-[500px] opacity-100 mb-6 border-b border-zinc-200 pb-6' : 'max-h-0 opacity-0'}`}>
                        <AcademicProgressChart subjects={subjects} />
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {sortedSemesters.map(semester => {
                            const semesterSubjects = semester.subjectIds.map(id => subjectMap.get(id)).filter((s): s is Subject => !!s);
                            const isDragOver = dragOverSemester === semester.id;
                            return (
                                <div 
                                    key={semester.id} 
                                    onDragOver={(e) => {e.preventDefault(); setDragOverSemester(semester.id);}}
                                    onDragLeave={() => setDragOverSemester(null)}
                                    onDrop={(e) => onDrop(e, semester.id)}
                                    className={`p-3 rounded-lg border-2 transition-all ${isDragOver ? 'border-violet-500 bg-violet-50 shadow-lg' : 'border-zinc-200 bg-stone-50'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <button onClick={() => setViewingSemester(semester)} className="text-left group">
                                            <h4 className="font-bold text-zinc-800 text-lg group-hover:text-violet-700">{semester.term} {semester.year}</h4>
                                            <span className="text-sm text-zinc-500 group-hover:text-violet-600">Ver detalles y exámenes</span>
                                        </button>
                                        <div className="relative group">
                                            <button className="p-1.5 text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-200"><EllipsisVerticalIcon className="w-5 h-5"/></button>
                                            <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-zinc-200 z-10 hidden group-focus-within:block group-hover:block">
                                                <button onClick={() => { setEditing({semester}); setModals(prev => ({...prev, semester: true}))}} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"><PencilIcon className="w-4 h-4"/> Editar</button>
                                                <button onClick={() => requestSemesterDeletion(semester)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><TrashIcon className="w-4 h-4"/> Eliminar</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 min-h-[3rem]">
                                        {semesterSubjects.map(subject => (
                                            <div key={subject.id} className="bg-white p-2 rounded flex justify-between items-center shadow-sm">
                                                <p className="text-sm font-medium text-zinc-700">{subject.name}</p>
                                                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${statusStyles[subject.status].bg} ${statusStyles[subject.status].text}`}>{statusStyles[subject.status].name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <SemesterFormModal 
                isOpen={modals.semester}
                onClose={() => setModals({...modals, semester: false})}
                onSave={handlers.onSaveSemester}
                semesterToEdit={editing.semester}
            />
             <SubjectFormModal 
                isOpen={modals.subject}
                onClose={() => setModals({...modals, subject: false})}
                onSave={handlers.onSaveSubject}
                subjectToEdit={editing.subject}
                allSubjects={subjects}
            />
             <DependencyViewModal
                isOpen={!!viewingSubjectDeps}
                onClose={() => setViewingSubjectDeps(null)}
                subject={viewingSubjectDeps}
                allSubjects={subjects}
            />
             {viewingSemester && (
                <SemesterDetailModal
                    isOpen={!!viewingSemester}
                    onClose={() => setViewingSemester(null)}
                    semester={viewingSemester}
                    subjects={subjects}
                    exams={exams}
                    onUnassignSubject={handlers.onUnassignSubject}
                    onUpdateSubjectStatusAndGrade={handlers.onUpdateSubjectStatusAndGrade}
                    onPromptForGrade={handlers.onPromptForGrade}
                    onSaveExam={handlers.onSaveExam}
                    onDeleteExam={handlers.onDeleteExam}
                />
             )}
            {confirmationState?.isOpen && (
                <ConfirmationModal 
                    isOpen={confirmationState.isOpen}
                    onClose={() => setConfirmationState(null)}
                    onConfirm={() => {
                        confirmationState.onConfirm();
                        setConfirmationState(null);
                    }}
                    title={confirmationState.title}
                    message={confirmationState.message}
                />
            )}
        </>
    );
};