import React, { useState, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Project, Task, TaskStatus } from '../types';

// Props Interface
interface GoalsPanelProps {
    projects: Project[];
    tasks: Task[];
    onAddProject: () => void;
    onEditProject: (project: Project) => void;
    onDeleteProject: (projectId: string) => void;
    onAddTask: (projectId: string, text: string) => void;
    onUpdateTask: (taskId: string, newStatus: TaskStatus, newText?: string) => void;
    onDeleteTask: (taskId: string) => void;
    onAddMultipleTasks: (projectId: string, taskTexts: string[]) => void;
}

// Icons
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
);
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
);
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
);
const CircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg viewBox="0 0 16 16" fill="currentColor" {...props}><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/></svg>);
const CircleHalfIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg viewBox="0 0 16 16" fill="currentColor" {...props}><path d="M8 15V1a7 7 0 1 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/></svg>);
const CheckCircleFillIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg viewBox="0 0 16 16" fill="currentColor" {...props}><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>);
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);


const TaskItem: React.FC<{ task: Task; onUpdateTask: GoalsPanelProps['onUpdateTask']; onDeleteTask: GoalsPanelProps['onDeleteTask']; }> = ({ task, onUpdateTask, onDeleteTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(task.text);

    const handleSave = () => {
        if (editText.trim()) {
            onUpdateTask(task.id, task.status, editText.trim());
        } else {
            setEditText(task.text); // Revert if empty
        }
        setIsEditing(false);
    };
    
    return (
        <div className="flex items-center group w-full">
            {isEditing ? (
                 <input type="text" value={editText} onChange={e => setEditText(e.target.value)} onBlur={handleSave} onKeyDown={e => e.key === 'Enter' && handleSave()} autoFocus className="flex-grow bg-transparent p-1 -m-1 border-b border-indigo-500 outline-none"/>
            ) : (
                <p onDoubleClick={() => setIsEditing(true)} className="flex-grow cursor-pointer">{task.text}</p>
            )}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-indigo-600 rounded"><PencilIcon className="w-4 h-4"/></button>
                <button onClick={() => onDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-600 rounded"><TrashIcon className="w-4 h-4"/></button>
            </div>
        </div>
    );
};

const statusConfig: Record<TaskStatus, { icon: React.ReactElement, label: string, color: string }> = {
    todo: { icon: <CircleIcon className="w-4 h-4" />, label: "Por Hacer", color: "text-slate-500" },
    inProgress: { icon: <CircleHalfIcon className="w-4 h-4" />, label: "En Progreso", color: "text-blue-500" },
    done: { icon: <CheckCircleFillIcon className="w-4 h-4" />, label: "Hecho", color: "text-green-500" },
};

const ProjectDetails: React.FC<Omit<GoalsPanelProps, 'projects' | 'tasks' | 'onAddProject'> & { project: Project; projectTasks: Task[]; }> = ({ project, projectTasks, onAddTask, onUpdateTask, onDeleteTask, onAddMultipleTasks, onEditProject, onDeleteProject }) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [activeTab, setActiveTab] = useState<TaskStatus>('todo');
    const [isGenerating, setIsGenerating] = useState(false);
    const [geminiError, setGeminiError] = useState('');

    const tasksByStatus = useMemo(() => ({
        todo: projectTasks.filter(t => t.status === 'todo'),
        inProgress: projectTasks.filter(t => t.status === 'inProgress'),
        done: projectTasks.filter(t => t.status === 'done'),
    }), [projectTasks]);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            onAddTask(project.id, newTaskText.trim());
            setNewTaskText('');
        }
    };
    
    const getAiSuggestions = useCallback(async () => {
        if (!process.env.API_KEY) {
            setGeminiError("La clave API no está configurada para esta función.");
            return;
        }
        setIsGenerating(true);
        setGeminiError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    tasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING, description: "Una tarea accionable y concisa" }
                    }
                },
                required: ["tasks"]
            };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Basado en el siguiente proyecto, sugiere 5 tareas accionables para completarlo. Título del proyecto: "${project.title}". Descripción: "${project.description || 'Sin descripción'}".`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });

            const jsonStr = response.text.trim();
            const result = JSON.parse(jsonStr);
            if (result.tasks && Array.isArray(result.tasks) && result.tasks.length > 0) {
                onAddMultipleTasks(project.id, result.tasks);
            } else {
                 setGeminiError("La IA no devolvió tareas. Inténtalo con una descripción más detallada.");
            }
        } catch (e) {
            console.error(e);
            setGeminiError("No se pudieron generar tareas. Inténtalo de nuevo.");
        } finally {
            setIsGenerating(false);
        }
    }, [project.id, project.title, project.description, onAddMultipleTasks]);

    return (
        <div className="pl-10 pr-4 pb-4">
            {project.description && <p className="text-sm text-slate-600 mb-4">{project.description}</p>}

             {/* Tasks Section */}
            <div>
                {/* Tabs */}
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        {(['todo', 'inProgress', 'done'] as TaskStatus[]).map(status => (
                            <button key={status} onClick={() => setActiveTab(status)}
                                className={`${activeTab === status ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>
                                {statusConfig[status].label}
                                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === status ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {tasksByStatus[status].length}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>
                {/* Task List */}
                <div className="mt-3 space-y-2 min-h-[5rem]">
                    {tasksByStatus[activeTab].map(task => (
                        <div key={task.id} className="flex items-center gap-3 text-sm p-1 rounded hover:bg-slate-200/50">
                             <div className={`flex items-center ${statusConfig[task.status].color}`}>
                                {statusConfig[task.status].icon}
                             </div>
                             <div className="flex-grow">
                                <TaskItem task={task} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} />
                             </div>
                             <div className="flex items-center">
                                {(['todo', 'inProgress', 'done'] as TaskStatus[]).map(s => (
                                    <button key={s} onClick={() => onUpdateTask(task.id, s, task.text)}
                                        className={`p-1 rounded-full ${task.status === s ? statusConfig[s].color : 'text-slate-300 hover:text-slate-500'}`} title={`Marcar como '${statusConfig[s].label}'`}>
                                        {React.cloneElement(statusConfig[s].icon, { className: 'w-5 h-5' })}
                                    </button>
                                ))}
                             </div>
                        </div>
                    ))}
                </div>
                 {/* Add Task & AI */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                     <form onSubmit={handleAddTask} className="flex items-center space-x-2">
                        <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Añadir nueva tarea..."
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
                        <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">Añadir</button>
                     </form>
                     <div className="mt-3">
                        <button onClick={getAiSuggestions} disabled={isGenerating}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-100 disabled:opacity-60">
                           <SparklesIcon className="w-4 h-4"/>
                           <span>{isGenerating ? 'Generando tareas...' : 'Sugerir Tareas con IA'}</span>
                        </button>
                        {geminiError && <p className="text-xs text-red-600 mt-1 text-center">{geminiError}</p>}
                     </div>
                </div>
            </div>
            {/* Project Actions */}
            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-200">
                <button onClick={() => onEditProject(project)} className="text-xs font-medium text-slate-600 hover:text-indigo-600 p-2 rounded-md">Editar Proyecto</button>
                <button onClick={() => onDeleteProject(project.id)} className="text-xs font-medium text-slate-600 hover:text-red-600 p-2 rounded-md">Eliminar Proyecto</button>
            </div>
        </div>
    );
};


export const GoalsPanel: React.FC<GoalsPanelProps> = ({ projects, tasks, onAddProject, onEditProject, onDeleteProject, onAddTask, onUpdateTask, onDeleteTask, onAddMultipleTasks }) => {
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(projects[0]?.id || null);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Mis Proyectos y Metas</h3>
                <button onClick={onAddProject} className="flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                    <PlusIcon className="w-5 h-5"/>
                    <span>Nuevo Proyecto</span>
                </button>
            </div>
            <div className="space-y-2 overflow-y-auto pr-2">
                {projects.length > 0 ? projects.map(project => {
                    const projectTasks = tasks.filter(t => t.projectId === project.id);
                    const totalTasks = projectTasks.length;
                    const doneTasks = projectTasks.filter(t => t.status === 'done').length;
                    const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
                    const isExpanded = expandedProjectId === project.id;

                    return (
                        <div key={project.id} className="bg-slate-50/70 rounded-lg border border-slate-200 overflow-hidden">
                            <button 
                                onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                                className="w-full p-3 text-left group"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{project.icon || '🎯'}</span>
                                        <h4 className="text-md font-bold text-slate-800">{project.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold text-slate-500">{doneTasks}/{totalTasks}</span>
                                        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                <div className="mt-2 pl-10">
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            </button>
                            {isExpanded && (
                                <ProjectDetails
                                    project={project}
                                    projectTasks={projectTasks}
                                    onEditProject={onEditProject}
                                    onDeleteProject={onDeleteProject}
                                    onAddTask={onAddTask}
                                    onUpdateTask={onUpdateTask}
                                    onDeleteTask={onDeleteTask}
                                    onAddMultipleTasks={onAddMultipleTasks}
                                />
                            )}
                        </div>
                    )
                }) : (
                    <div className="text-center py-12">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-12a2.25 2.25 0 0 1-2.25-2.25V3M3.75 21v-4.125c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125V21M3.75 21h16.5M12 16.5v4.5" /></svg>
                        </div>
                        <h4 className="mt-4 text-lg font-semibold text-slate-700">Define tu próxima meta</h4>
                        <p className="mt-1 text-sm text-slate-500">Crea un proyecto para empezar a organizar tus tareas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};