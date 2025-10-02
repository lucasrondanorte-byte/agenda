import React, { useMemo } from 'react';
import type { Subject } from '../types';

const ProgressRing: React.FC<{
    percentage: number;
    stroke: string;
    label: string;
    subLabel: string;
}> = ({ percentage, stroke, label, subLabel }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    // Ensure percentage is within 0-100 range
    const safePercentage = Math.max(0, Math.min(100, percentage));
    const offset = circumference - (safePercentage / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center">
            <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
                <circle
                    className="text-zinc-200"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                />
                <circle
                    className={stroke}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                 <span className="text-3xl font-bold text-zinc-700">{label}</span>
                 <p className="text-sm text-zinc-500 mt-1">{subLabel}</p>
            </div>
        </div>
    );
};


export const AcademicProgressChart: React.FC<{ subjects: Subject[] }> = ({ subjects }) => {

    const { gpa, progressPercentage, approvedCount, totalCount } = useMemo(() => {
        const approvedSubjects = subjects.filter(s => s.status === 'aprobada');
        const approvedWithGrade = approvedSubjects.filter(s => s.finalGrade !== null && s.finalGrade >= 1);
        
        const totalSubjects = subjects.length;
        const approvedSubjectsCount = approvedSubjects.length;

        const calculatedGpa = approvedWithGrade.length > 0
            ? (approvedWithGrade.reduce((acc, s) => acc + s.finalGrade!, 0) / approvedWithGrade.length)
            : 0;
            
        const calculatedProgress = totalSubjects > 0 ? (approvedSubjectsCount / totalSubjects) * 100 : 0;

        return {
            gpa: calculatedGpa,
            progressPercentage: calculatedProgress,
            approvedCount: approvedSubjectsCount,
            totalCount: totalSubjects,
        };
    }, [subjects]);
    
    if (subjects.length === 0) {
        return (
             <div className="text-center text-zinc-500 py-8">
                <h4 className="text-lg font-semibold text-zinc-800 mb-2">Progreso Académico</h4>
                <p>Añade materias a tu Plan de Estudios para ver tu progreso.</p>
             </div>
        );
    }

    return (
        <div>
            <h4 className="text-lg font-semibold text-zinc-800 mb-4 text-center">Progreso Académico</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
                
                {/* GPA */}
                <div className="flex flex-col items-center p-4">
                    <div className="w-[160px] h-[160px]">
                         <ProgressRing
                            percentage={gpa > 0 ? (gpa / 10) * 100 : 0}
                            stroke="text-teal-500"
                            label={gpa > 0 ? gpa.toFixed(2) : 'N/A'}
                            subLabel="Promedio General"
                        />
                    </div>
                    <p className="text-center text-sm text-zinc-600 mt-3 max-w-xs">Basado en la nota final de las materias aprobadas.</p>
                </div>
                
                {/* Career Progress */}
                <div className="flex flex-col items-center p-4">
                     <div className="w-[160px] h-[160px]">
                         <ProgressRing
                            percentage={progressPercentage}
                            stroke="text-violet-500"
                            label={`${Math.round(progressPercentage)}%`}
                            subLabel="Avance de Carrera"
                        />
                    </div>
                    <p className="text-center text-sm text-zinc-600 mt-3 max-w-xs">
                        {approvedCount} de {totalCount} materias aprobadas.
                    </p>
                </div>
            </div>
        </div>
    );
};