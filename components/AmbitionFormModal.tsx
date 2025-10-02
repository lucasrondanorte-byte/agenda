import React, { useState, useEffect } from 'react';
import type { Project } from '../types';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'>, id?: string) => void;
  projectToEdit: Project | null;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const projectIcons = ['🎯', '🏃‍♂️', '🎸', '📚', '🎨', '💼', '✈️', '❤️', '💰', '✨'];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, onSave, projectToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [category, setCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (projectToEdit) {
            setTitle(projectToEdit.title);
            setDescription(projectToEdit.description || '');
            setIcon(projectToEdit.icon || '🎯');
            setCategory(projectToEdit.category || '');
            setTargetDate(projectToEdit.targetDate || '');
        } else {
            setTitle('');
            setDescription('');
            setIcon('🎯');
            setCategory('');
            setTargetDate('');
        }
        setError('');
    }
  }, [isOpen, projectToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título no puede estar vacío.');
      return;
    }
    setError('');
    onSave({ 
        title: title.trim(), 
        description: description.trim(),
        icon,
        category: category.trim(),
        targetDate: targetDate || undefined
    }, projectToEdit?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-800">{projectToEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100">
                <XMarkIcon className="w-6 h-6 text-zinc-500" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Icono del Proyecto</label>
            <div className="flex flex-wrap gap-2 bg-stone-50 p-3 rounded-lg">
                {projectIcons.map(i => (
                    <button 
                        key={i} 
                        type="button" 
                        onClick={() => setIcon(i)}
                        className={`w-10 h-10 text-xl rounded-full transition-all ${icon === i ? 'bg-teal-200 scale-110' : 'hover:bg-zinc-200'}`}
                    >{i}</button>
                ))}
            </div>
          </div>
          <div>
            <label htmlFor="project-title" className="block text-sm font-medium text-zinc-700 mb-1">Título</label>
            <input type="text" id="project-title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="p. ej., Ponerme en forma, Aprender un idioma"/>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
                <label htmlFor="project-category" className="block text-sm font-medium text-zinc-700 mb-1">Categoría (Opcional)</label>
                <input type="text" id="project-category" value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="p. ej., Salud, Carrera, Personal"/>
             </div>
             <div>
                <label htmlFor="project-date" className="block text-sm font-medium text-zinc-700 mb-1">Fecha Límite (Opcional)</label>
                <input type="date" id="project-date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
             </div>
           </div>
          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-zinc-700 mb-1">Descripción (Opcional)</label>
            <textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="¿Qué significa este proyecto para ti? ¿Cómo se ve el éxito?" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-teal-700">
              {projectToEdit ? 'Guardar Cambios' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};