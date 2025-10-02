import React, { useState, useEffect } from 'react';

interface GradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (grade: number) => void;
  subjectName: string;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export const GradeEntryModal: React.FC<GradeEntryModalProps> = ({ isOpen, onClose, onSave, subjectName }) => {
  const [grade, setGrade] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGrade('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 10) {
      setError('Por favor, introduce una nota válida entre 1 y 10.');
      return;
    }
    onSave(gradeNum);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-zinc-800">Añadir Nota Final</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100">
                <XMarkIcon className="w-6 h-6 text-zinc-500" />
            </button>
        </div>
        <p className="mb-4 text-zinc-600">Materia: <span className="font-semibold text-zinc-800">{subjectName}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="final-grade-input" className="block text-sm font-medium text-zinc-700 mb-1">Nota Final (1-10)</label>
            <input 
              type="number"
              id="final-grade-input"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              step="0.01" 
              min="1" 
              max="10"
              autoFocus
              className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Ej: 7.50"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 bg-violet-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-violet-700">
              Guardar Nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};