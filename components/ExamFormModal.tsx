import React, { useState, useEffect } from 'react';
import type { Exam } from '../types';

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: Omit<Exam, 'id'>, id?: string) => void;
  examToEdit: Exam | null;
  subjectId: string;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export const ExamFormModal: React.FC<ExamFormModalProps> = ({ isOpen, onClose, onSave, examToEdit, subjectId }) => {
  const [type, setType] = useState<Exam['type']>('parcial');
  const [title, setTitle] = useState('');
  const [topics, setTopics] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [grade, setGrade] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (examToEdit) {
            setType(examToEdit.type);
            setTitle(examToEdit.title);
            setTopics(examToEdit.topics || '');
            setDate(examToEdit.date);
            setTime(examToEdit.time);
            setGrade(examToEdit.grade);
        } else {
            setType('parcial');
            setTitle('');
            setTopics('');
            setDate(new Date().toISOString().split('T')[0]);
            setTime('09:00');
            setGrade(null);
        }
        setError('');
    }
  }, [isOpen, examToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    setError('');
    onSave({ subjectId, type, title, date, time, grade, topics }, examToEdit?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-800">{examToEdit ? 'Editar Examen' : 'Nuevo Examen'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100">
                <XMarkIcon className="w-6 h-6 text-zinc-500" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Tipo de Examen</label>
              <div className="flex gap-4">
                  <label className="flex items-center">
                      <input type="radio" value="parcial" checked={type === 'parcial'} onChange={() => setType('parcial')} className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-zinc-300"/>
                      <span className="ml-2 text-sm text-zinc-600">Parcial</span>
                  </label>
                  <label className="flex items-center">
                      <input type="radio" value="final" checked={type === 'final'} onChange={() => setType('final')} className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-zinc-300"/>
                      <span className="ml-2 text-sm text-zinc-600">Final</span>
                  </label>
              </div>
           </div>
          <div>
            <label htmlFor="exam-title" className="block text-sm font-medium text-zinc-700 mb-1">Título</label>
            <input type="text" id="exam-title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g., Primer Parcial, Recuperatorio" />
          </div>
          <div>
            <label htmlFor="exam-topics" className="block text-sm font-medium text-zinc-700 mb-1">Temas (Opcional)</label>
            <textarea id="exam-topics" value={topics} onChange={(e) => setTopics(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              placeholder="e.g., Tema 1: Variables Complejas&#10;Tema 2: Ecuaciones Diferenciales" />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="exam-date" className="block text-sm font-medium text-zinc-700 mb-1">Fecha</label>
                <input type="date" id="exam-date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label htmlFor="exam-time" className="block text-sm font-medium text-zinc-700 mb-1">Hora</label>
                <input type="time" id="exam-time" value={time} onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
          </div>
          <div>
            <label htmlFor="exam-grade" className="block text-sm font-medium text-zinc-700 mb-1">Nota (Opcional)</label>
            <input type="number" id="exam-grade" value={grade ?? ''} onChange={(e) => setGrade(e.target.value ? parseFloat(e.target.value) : null)}
              step="0.01" min="1" max="10"
              className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 bg-violet-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-violet-700">
              {examToEdit ? 'Guardar Cambios' : 'Guardar Examen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};