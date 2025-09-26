import React, { useState, useEffect } from 'react';
import type { Event, EventCategory } from '../types';
import { ColorPicker } from './ColorPicker';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  event: Event | null;
  selectedDate: Date;
}

const categories: { id: EventCategory; name: string; color: string; ring: string; }[] = [
    { id: 'personal', name: 'Personal', color: 'bg-blue-500', ring: 'ring-blue-500' },
    { id: 'pareja', name: 'Conexión', color: 'bg-pink-500', ring: 'ring-pink-500' },
    { id: 'trabajo', name: 'Trabajo', color: 'bg-green-500', ring: 'ring-green-500' },
    { id: 'otro', name: 'Otro', color: 'bg-slate-500', ring: 'ring-slate-500' },
];

export const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, event, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('12:00');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('personal');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [reminder, setReminder] = useState(false);
  const [whatsappReminder, setWhatsappReminder] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setTime(event.time);
      setDescription(event.description || '');
      setCategory(event.category || 'personal');
      setColor(event.color);
      setReminder(event.reminder);
      setWhatsappReminder(event.whatsappReminder || false);
      setWhatsappNumber(event.whatsappNumber || '');
      setWhatsappMessage(event.whatsappMessage || `¡Hola! Te recuerdo tu evento: "${event.title}" a las ${event.time}.`);
    } else {
      setTitle('');
      setTime('12:00');
      setDescription('');
      setCategory('personal');
      setColor(undefined);
      setReminder(false);
      setWhatsappReminder(false);
      setWhatsappNumber('');
      setWhatsappMessage(`¡Hola! Te recuerdo tu evento: "" a las 12:00.`);
    }
  }, [event]);
  
  // Update default message when title or time changes for new events
  useEffect(() => {
    if(!event) {
        setWhatsappMessage(`¡Hola! Te recuerdo tu evento: "${title}" a las ${time}.`);
    }
  }, [title, time, event]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título no puede estar vacío.');
      return;
    }
    if (whatsappReminder && !whatsappNumber.trim()) {
      setError('El número de WhatsApp es obligatorio para el recordatorio.');
      return;
    }
    setError('');
    onSave({
      title: title.trim(),
      date: selectedDate.toISOString().split('T')[0],
      time,
      description: description.trim(),
      category,
      color,
      reminder,
      whatsappReminder,
      whatsappNumber: whatsappReminder ? whatsappNumber.trim() : '',
      whatsappMessage: whatsappReminder ? whatsappMessage.trim() : '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{event ? 'Editar Evento' : 'Añadir Nuevo Evento'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="p. ej., Reunión de equipo"
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Añade más detalles sobre tu evento..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                    category === cat.id
                        ? `${cat.color} text-white ring-2 ring-offset-2 ${cat.ring}`
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    {cat.name}
                </button>
                ))}
            </div>
          </div>
          <div className="pt-2">
            <ColorPicker selectedColor={color} onChange={setColor} />
          </div>
          <div className="pt-2 space-y-4">
            <fieldset className="border-t border-slate-200 pt-4">
                <legend className="text-sm font-medium text-slate-800">Recordatorios</legend>
                 <div className="mt-2 space-y-3">
                    <div className="flex items-center">
                        <input
                            id="reminder"
                            type="checkbox"
                            checked={reminder}
                            onChange={(e) => setReminder(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="reminder" className="ml-3 block text-sm text-slate-700">
                           Notificación en la aplicación
                        </label>
                    </div>
                    {/* WhatsApp Reminder */}
                    <div className="relative">
                        <div className="flex items-center">
                             <input
                                id="whatsappReminder"
                                type="checkbox"
                                checked={whatsappReminder}
                                onChange={(e) => setWhatsappReminder(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="whatsappReminder" className="ml-3 block text-sm text-slate-700">
                                Activar Recordatorio por WhatsApp
                            </label>
                        </div>
                        {whatsappReminder && (
                            <div className="mt-3 pl-7 space-y-3">
                                <p className="text-xs text-slate-500 mb-2">
                                    Recibirás una notificación en la app para que confirmes y envíes el mensaje a la hora programada.
                                </p>
                                <div>
                                    <label htmlFor="whatsappNumber" className="block text-xs font-medium text-slate-600 mb-1">Número de WhatsApp</label>
                                    <input
                                        type="tel"
                                        id="whatsappNumber"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="+1234567890 (con código de país)"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="whatsappMessage" className="block text-xs font-medium text-slate-600 mb-1">Mensaje</label>
                                     <textarea
                                        id="whatsappMessage"
                                        value={whatsappMessage}
                                        onChange={(e) => setWhatsappMessage(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                 </div>
            </fieldset>
             {error && <p className="text-red-600 text-sm font-medium text-center bg-red-50 p-2 rounded-md">{error}</p>}
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Guardar Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};