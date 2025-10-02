import React, { useState, useEffect, useMemo } from 'react';
import type { Subject, SubjectStatus } from '../types';

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Omit<Subject, 'id'>, id?: string) => void;
  subjectToEdit: Subject | null;
  allSubjects: Subject[];
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const statuses: { id: SubjectStatus, name: string }[] = [
    { id: 'pendiente', name: 'Pendiente' },
    { id: 'cursando', name: 'Cursando' },
    { id: 'aprobada', name: 'Aprobada' },
    { id: 'final_pendiente', name: 'Final Pendiente' },
    { id: 'recursar', name: 'A Recursar' },
];

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({ isOpen, onClose, onSave, subjectToEdit, allSubjects }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<SubjectStatus>('pendiente');
  const [finalGrade, setFinalGrade] = useState<number | null>(null);
  const [prerequisiteIds, setPrerequisiteIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen) {
        if (subjectToEdit) {
            setName(subjectToEdit.name);
            setStatus(subjectToEdit.status);
            setFinalGrade(subjectToEdit.finalGrade);
            setPrerequisiteIds(subjectToEdit.prerequisiteIds);
        } else {
            setName('');
            setStatus('pendiente');
            setFinalGrade(null);
            setPrerequisiteIds([]);
        }
        setError('');
    }
  }, [isOpen, subjectToEdit]);

  if (!isOpen) return null;

  const handleTogglePrerequisite = (id: string) => {
    setPrerequisiteIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la materia es obligatorio.');
      return;
    }
    setError('');
    onSave({ 
        name, 
        status, 
        finalGrade: status === 'aprobada' ? finalGrade : null,
        prerequisiteIds 
    }, subjectToEdit?.id);
  };

  const availablePrerequisites = allSubjects.filter(s => s.id !== subjectToEdit?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-800">{subjectToEdit ? 'Editar Materia' : 'Nueva Materia al Plan'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100">
                <XMarkIcon className="w-6 h-6 text-zinc-500" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="subject-name" className="block text-sm font-medium text-zinc-700 mb-1">Nombre de la Materia</label>
            <input type="text" id="subject-name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="p. ej., Análisis Matemático II" />
          </div>
           <div>
              <label htmlFor="subject-status" className="block text-sm font-medium text-zinc-700 mb-1">Estado</label>
              <select id="subject-status" value={status} onChange={(e) => setStatus(e.target.value as SubjectStatus)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                  {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
          </div>

            {status === 'aprobada' && (
                <div>
                    <label htmlFor="subject-grade" className="block text-sm font-medium text-zinc-700 mb-1">Nota Final</label>
                    <input type="number" id="subject-grade" value={finalGrade ?? ''} onChange={(e) => setFinalGrade(e.target.value ? parseFloat(e.target.value) : null)}
                    step="0.01" min="1" max="10"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
            )}
            
            {availablePrerequisites.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Correlativas (Materias requeridas)</label>
                    <div className="p-3 bg-stone-50 rounded-md border border-zinc-200 max-h-40 overflow-y-auto space-y-2">
                        {availablePrerequisites.map(s => (
                            <div key={s.id} className="flex items-center">
                                <input id={`prereq-${s.id}`} type="checkbox" checked={prerequisiteIds.includes(s.id)} onChange={() => handleTogglePrerequisite(s.id)}
                                className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"/>
                                <label htmlFor={`prereq-${s.id}`} className="ml-2 text-sm text-zinc-600">{s.name}</label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 bg-violet-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-violet-700">
              {subjectToEdit ? 'Guardar Cambios' : 'Guardar Materia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};