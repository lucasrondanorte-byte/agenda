import React from 'react';
import type { Project, Task } from '../types';

interface GoalsSummaryProps {
  projects: Project[];
  tasks: Task[];
  onNavigate: () => void;
}

const BullseyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </svg>
);

export const GoalsSummary: React.FC<GoalsSummaryProps> = ({ projects, tasks, onNavigate }) => {
    const summaryProjects = projects.slice(0, 3); // Show top 3

    return (
        <div 
            className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={onNavigate}
        >
            <div className="flex items-center gap-3 mb-4">
              <BullseyeIcon className="w-6 h-6 text-teal-500"/>
              <h3 className="text-xl font-semibold text-zinc-700">Mis Metas Actuales</h3>
            </div>
            {summaryProjects.length > 0 ? (
                <div className="space-y-4">
                    {summaryProjects.map(project => {
                        const projectTasks = tasks.filter(t => t.projectId === project.id);
                        const totalTasks = projectTasks.length;
                        const doneTasks = projectTasks.filter(t => t.status === 'done').length;
                        const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

                        return (
                            <div key={project.id}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{project.icon || '🎯'}</span>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-zinc-800 truncate">{project.title}</p>
                                            <p className="text-xs font-medium text-zinc-500">{doneTasks}/{totalTasks}</p>
                                        </div>
                                        <div className="w-full bg-zinc-200 rounded-full h-2 mt-1">
                                            <div className="bg-teal-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {projects.length > 3 && (
                        <p className="text-center text-sm font-medium text-teal-600 mt-4">
                            y {projects.length - 3} más...
                        </p>
                    )}
                </div>
            ) : (
                 <div className="text-center py-8">
                    <p className="text-zinc-500">Aún no has definido ningún proyecto. ¡Haz clic aquí para empezar!</p>
                </div>
            )}
        </div>
    );
};