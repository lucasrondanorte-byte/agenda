import React, { useMemo } from 'react';
import type { Subject, Exam, Semester } from '../types';

interface AcademicSummaryProps {
  subjects: Subject[];
  exams: Exam[];
  semesters: Semester[];
  onNavigate: () => void;
}

const AcademicCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path d="M12 14.25c-2.43 0-4.68.62-6.53 1.69.58 1.13 1.34 2.14 2.26 3.06 1.32.96 2.82 1.5 4.38 1.5s3.06-.54 4.38-1.5c.92-.92 1.68-1.93 2.26-3.06C16.68 14.87 14.43 14.25 12 14.25Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25A5.25 5.25 0 0 0 17.25 9V6.75a5.25 5.25 0 0 0-5.25-5.25A5.25 5.25 0 0 0 6.75 6.75V9a5.25 5.25 0 0 0 5.25 5.25Z" />
    </svg>
);

export const AcademicSummary: React.FC<AcademicSummaryProps> = ({ subjects, exams, semesters, onNavigate }) => {
    
    const { subjectsInCurrentSemester, currentSemesterLabel } = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11
        
        // Lógica simple: Ene-Jun es 1er cuatri, Jul-Dic es 2do.
        const currentTerm = currentMonth < 6 ? 'Primer Cuatrimestre' : 'Segundo Cuatrimestre';

        const currentSemester = semesters.find(s => s.year === currentYear && s.term === currentTerm);
        
        const label = currentSemester ? `${currentSemester.term} ${currentSemester.year}` : "Cuatrimestre Actual";

        if (!currentSemester) {
            return { subjectsInCurrentSemester: [], currentSemesterLabel: label };
        }

        const subjectMap = new Map(subjects.map(s => [s.id, s]));
        const semesterSubjects = currentSemester.subjectIds
            .map(id => subjectMap.get(id))
            .filter((s): s is Subject => !!s);
        
        return { subjectsInCurrentSemester: semesterSubjects, currentSemesterLabel: label };

    }, [semesters, subjects]);

    const upcomingExams = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalizar a la medianoche para comparar
        
        const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

        return exams
            .filter(exam => {
                const examDate = new Date(exam.date + 'T00:00:00Z'); // Comparar como fecha UTC
                return examDate >= today && exam.grade === null;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3) // Mostrar los próximos 3 exámenes
            .map(exam => ({
                ...exam,
                subjectName: subjectMap.get(exam.subjectId) || 'Materia desconocida'
            }));
    }, [exams, subjects]);


    return (
        <div 
            className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={onNavigate}
        >
            <div className="flex items-center gap-3 mb-4">
              <AcademicCapIcon className="w-6 h-6 text-teal-500"/>
              <h3 className="text-xl font-semibold text-zinc-700">Resumen Académico</h3>
            </div>

            <div className="mb-4">
                <h4 className="text-sm font-semibold text-zinc-600 mb-2">{currentSemesterLabel}</h4>
                {subjectsInCurrentSemester.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {subjectsInCurrentSemester.map(subject => (
                            <div key={subject.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {subject.name}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-sm text-zinc-500">No hay materias definidas para este cuatrimestre.</p>
                    </div>
                )}
            </div>
            
            <div>
                <h4 className="text-sm font-semibold text-zinc-600 mb-2">Próximos Exámenes</h4>
                {upcomingExams.length > 0 ? (
                    <div className="space-y-2">
                        {upcomingExams.map(exam => (
                             <div key={exam.id} className="p-2 bg-stone-50 rounded-md text-sm">
                                <div className="flex justify-between font-medium text-zinc-800">
                                    <span className="truncate pr-2">{exam.subjectName}</span>
                                    <span className="text-teal-600 capitalize flex-shrink-0">{exam.type}</span>
                                </div>
                                <div className="text-xs text-zinc-500 mt-0.5">
                                    {new Date(exam.date + 'T00:00:00Z').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                                </div>
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm text-zinc-500">No hay próximos exámenes programados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};