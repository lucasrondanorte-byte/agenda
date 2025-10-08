import React, { useState, useEffect } from 'react';
import type { Semester } from '../types';

interface SemesterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (semester: Omit<Semester, 'id'>, id?: string) => void;
  semesterToEdit: Semester | null;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const terms: Semester['term'][] = ['Primer Cuatrimestre', 'Segundo Cuatrimestre', 'Anual', 'Verano'];

export const SemesterFormModal: React.FC<SemesterFormModalProps> = ({ isOpen, onClose, onSave, semesterToEdit }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState<Semester['term']>('Primer Cuatrimestre');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (semesterToEdit) {
            setYear(semesterToEdit.year);
            setTerm(semesterToEdit.term);
        } else {
            setYear(new Date().getFullYear());
            setTerm('Primer Cuatrimestre');
        }
        setError('');
    }
  }, [isOpen, semesterToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year) {
      setError('El año es obligatorio.');
      return;
    }
    setError('');
    // FIX: Add the `subjectIds` property to the saved object to satisfy the `Omit<Semester, 'id'>` type.
    // For new semesters, it will be an empty array. For edited semesters, this preserves the existing subject IDs.
    onSave({ year, term, subjectIds: semesterToEdit?.subjectIds || [] }, semesterToEdit?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-800">{semesterToEdit ? 'Editar Semestre' : 'Nuevo Semestre'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100">
                <XMarkIcon className="w-6 h-6 text-zinc-500" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="semester-year" className="block text-sm font-medium text-zinc-700 mb-1">Año</label>
            <input type="number" id="semester-year" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g., 2024" />
          </div>
          <div>
            <label htmlFor="semester-term" className="block text-sm font-medium text-zinc-700 mb-1">Período</label>
            <select id="semester-term" value={term} onChange={(e) => setTerm(e.target.value as Semester['term'])}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                {terms.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 bg-violet-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-violet-700">
              {semesterToEdit ? 'Guardar Cambios' : 'Crear Semestre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};