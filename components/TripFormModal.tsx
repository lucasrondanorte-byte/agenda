import React, { useState, useEffect } from 'react';
import type { Trip } from '../types';

interface TripFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trip: Omit<Trip, 'id' | 'highlights'>, id?: string) => void;
  trip: Trip | null;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export const TripFormModal: React.FC<TripFormModalProps> = ({ isOpen, onClose, onSave, trip }) => {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip) {
      setTitle(trip.title);
      setDestination(trip.destination);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setNotes(trip.notes || '');
      setCoverPhoto(trip.coverPhoto);
    } else {
      setTitle('');
      setDestination('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(() => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
      });
      setNotes('');
      setCoverPhoto(undefined);
    }
  }, [trip]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) {
      setError('El título y el destino son obligatorios.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio.');
        return;
    }
    setError('');
    onSave({
      title,
      destination,
      startDate,
      endDate,
      notes,
      coverPhoto,
    }, trip?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">{trip ? 'Editar Viaje' : 'Añadir Nuevo Viaje'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
                <XMarkIcon className="w-6 h-6 text-slate-500" />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 max-h-[80vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="trip-title" className="block text-sm font-medium text-slate-700 mb-1">Título del Viaje</label>
            <input type="text" id="trip-title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="p. ej., Aventura en la costa" />
          </div>
          <div>
            <label htmlFor="trip-destination" className="block text-sm font-medium text-slate-700 mb-1">Destino</label>
            <input type="text" id="trip-destination" value={destination} onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="p. ej., Oporto, Portugal"/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="trip-startDate" className="block text-sm font-medium text-slate-700 mb-1">Fecha de Inicio</label>
              <input type="date" id="trip-startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="trip-endDate" className="block text-sm font-medium text-slate-700 mb-1">Fecha de Fin</label>
              <input type="date" id="trip-endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label htmlFor="trip-notes" className="block text-sm font-medium text-slate-700 mb-1">Notas (Opcional)</label>
            <textarea id="trip-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Añade tus pensamientos generales sobre el viaje..." />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Foto de Portada (Opcional)</label>
             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    {coverPhoto ? 
                        <img src={coverPhoto} alt="Vista previa" className="mx-auto h-24 w-auto rounded-md"/> :
                        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    }
                    <div className="flex text-sm text-slate-600">
                        <label htmlFor="trip-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Sube una imagen</span>
                            <input id="trip-file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">o arrástrala aquí</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF hasta 10MB</p>
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
              Guardar Viaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};