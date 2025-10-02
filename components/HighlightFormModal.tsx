import React, { useState, useEffect } from 'react';
import type { TripHighlight } from '../types';

interface HighlightFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (highlight: Omit<TripHighlight, 'id'>, id?: string) => void;
  highlight: TripHighlight | null;
  tripStartDate: string;
  tripEndDate: string;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const travelEmotions = ['😊', '🤩', '😋', '😌', '😴', '❤️'];

export const HighlightFormModal: React.FC<HighlightFormModalProps> = ({ isOpen, onClose, onSave, highlight, tripStartDate, tripEndDate }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [emotion, setEmotion] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (highlight) {
      setTitle(highlight.title);
      setDate(highlight.date);
      setDescription(highlight.description);
      setPhoto(highlight.photo);
      setEmotion(highlight.emotion);
    } else {
      setTitle('');
      setDate(tripStartDate);
      setDescription('');
      setPhoto(undefined);
      setEmotion(undefined);
    }
  }, [highlight, tripStartDate]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('El título y la descripción son obligatorios.');
      return;
    }
    setError('');
    onSave({ title, date, description, photo, emotion }, highlight?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">{highlight ? 'Editar Recuerdo' : 'Añadir Nuevo Recuerdo'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
                <XMarkIcon className="w-6 h-6 text-slate-500" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="highlight-title" className="block text-sm font-medium text-slate-700 mb-1">Título del Recuerdo</label>
                    <input type="text" id="highlight-title" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="p. ej., Visita al museo" />
                </div>
                <div>
                    <label htmlFor="highlight-date" className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                    <input type="date" id="highlight-date" value={date} onChange={(e) => setDate(e.target.value)}
                        min={tripStartDate} max={tripEndDate}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>
            <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">¿Cómo te sentiste?</label>
                 <div className="flex justify-around bg-slate-50 p-3 rounded-lg">
                    {travelEmotions.map(emoji => (
                        <button 
                        key={emoji}
                        type="button"
                        onClick={() => setEmotion(emoji)}
                        className={`text-3xl p-1 rounded-full transition-all duration-200 ${emotion === emoji ? 'bg-indigo-200 scale-125' : 'hover:bg-slate-200'}`}
                        aria-label={`Seleccionar emoción: ${emoji}`}
                        >
                            {emoji}
                        </button>
                    ))}
                 </div>
            </div>
            <div>
                <label htmlFor="highlight-description" className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea id="highlight-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Describe este momento especial..." />
            </div>
            <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Foto (Opcional)</label>
             <div className="mt-1 flex items-center space-x-4">
                {photo && <img src={photo} alt="Vista previa" className="h-16 w-16 object-cover rounded-md"/>}
                <div className="flex-grow flex justify-center px-6 py-4 border-2 border-slate-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <div className="flex text-sm text-slate-600">
                            <label htmlFor="highlight-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                <span>{photo ? 'Cambiar imagen' : 'Subir una imagen'}</span>
                                <input id="highlight-file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                </div>
             </div>
          </div>
          {error && <p className="text-red-600 text-sm font-medium text-center bg-red-50 p-2 rounded-md">{error}</p>}
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
              Guardar Recuerdo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};