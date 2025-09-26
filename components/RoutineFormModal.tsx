import React, { useState, useEffect } from 'react';
import type { Routine, EventCategory } from '../types';
import { ColorPicker } from './ColorPicker';

interface RoutineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (routine: Omit<Routine, 'id'>, id?: string) => void;
  routineToEdit: Routine | null;
}

const categories: { id: EventCategory; name: string; color: string; ring: string; }[] = [
    { id: 'personal', name: 'Personal', color: 'bg-blue-500', ring: 'ring-blue-500' },
    { id: 'pareja', name: 'Conexión', color: 'bg-pink-500', ring: 'ring-pink-500' },
    { id: 'trabajo', name: 'Trabajo', color: 'bg-green-500', ring: 'ring-green-500' },
    { id: 'otro', name: 'Otro', color: 'bg-slate-500', ring: 'ring-slate-500' },
];

const daysOfWeekMap = [
    { name: 'D', value: 0 }, { name: 'L', value: 1 }, { name: 'M', value: 2 },
    { name: 'X', value: 3 }, { name: 'J', value: 4 }, { name: 'V', value: 5 },
    { name: 'S', value: 6 }
];

export const RoutineFormModal: React.FC<RoutineFormModalProps> = ({ isOpen, onClose, onSave, routineToEdit }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('12:00');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('personal');
  const [color, setColor] = useState<string | undefined>(undefined);
  
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  });

  const [reminder, setReminder] = useState(false);
  const [whatsappReminder, setWhatsappReminder] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [error, setError] = useState('');
  
  const resetForm = () => {
      setTitle('');
      setTime('12:00');
      setDescription('');
      setCategory('personal');
      setColor(undefined);
      setFrequency('weekly');
      setDaysOfWeek([]);
      setDayOfMonth(1);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(() => {
          const date = new Date();
          date.setMonth(date.getMonth() + 1);
          return date.toISOString().split('T')[0];
      });
      setReminder(false);
      setWhatsappReminder(false);
      setWhatsappNumber('');
      setWhatsappMessage('');
      setError('');
  };

  useEffect(() => {
    if (isOpen) {
        if (routineToEdit) {
            setTitle(routineToEdit.title);
            setTime(routineToEdit.time);
            setDescription(routineToEdit.description || '');
            setCategory(routineToEdit.category);
            setColor(routineToEdit.color);
            setFrequency(routineToEdit.frequency);
            setDaysOfWeek(routineToEdit.daysOfWeek || []);
            setDayOfMonth(routineToEdit.dayOfMonth || 1);
            setStartDate(routineToEdit.startDate);
            setEndDate(routineToEdit.endDate);
            setReminder(routineToEdit.reminder);
            setWhatsappReminder(routineToEdit.whatsappReminder || false);
            setWhatsappNumber(routineToEdit.whatsappNumber || '');
            setWhatsappMessage(routineToEdit.whatsappMessage || `¡Hola! Te recuerdo tu evento recurrente: "${routineToEdit.title}" a las ${routineToEdit.time}.`);
        } else {
            resetForm();
        }
    }
  }, [isOpen, routineToEdit]);

  useEffect(() => {
    setWhatsappMessage(`¡Hola! Te recuerdo tu evento recurrente: "${title}" a las ${time}.`);
  }, [title, time]);

  if (!isOpen) return null;

  const toggleDayOfWeek = (dayValue: number) => {
    setDaysOfWeek(prev => 
        prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título no puede estar vacío.');
      return;
    }
    if (frequency === 'weekly' && daysOfWeek.length === 0) {
      setError('Debes seleccionar al menos un día de la semana.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha de fin debe ser posterior o igual a la fecha de inicio.');
      return;
    }
    if (whatsappReminder && !whatsappNumber.trim()) {
      setError('El número de WhatsApp es obligatorio para el recordatorio.');
      return;
    }

    onSave({
      title: title.trim(),
      time,
      description: description.trim(),
      category,
      color,
      frequency,
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      startDate,
      endDate,
      reminder,
      whatsappReminder,
      whatsappNumber: whatsappReminder ? whatsappNumber.trim() : '',
      whatsappMessage: whatsappReminder ? whatsappMessage.trim() : '',
    }, routineToEdit?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{routineToEdit ? 'Editar Rutina' : 'Crear Nueva Rutina'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="routine-title" className="block text-sm font-medium text-slate-700 mb-1">Título de la Rutina</label>
            <input type="text" id="routine-title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="routine-time" className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
              <input type="time" id="routine-time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frecuencia</label>
                <select value={frequency} onChange={e => setFrequency(e.target.value as 'weekly' | 'monthly')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                </select>
            </div>
          </div>
        
          {frequency === 'weekly' && (
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Repetir los días</label>
                <div className="flex justify-between gap-1">
                    {daysOfWeekMap.map(day => (
                        <button key={day.value} type="button" onClick={() => toggleDayOfWeek(day.value)}
                            className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                                daysOfWeek.includes(day.value) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}>
                            {day.name}
                        </button>
                    ))}
                </div>
            </div>
          )}

          {frequency === 'monthly' && (
             <div>
                <label htmlFor="dayOfMonth" className="block text-sm font-medium text-slate-700 mb-1">Repetir el día del mes</label>
                <input type="number" id="dayOfMonth" value={dayOfMonth} onChange={e => setDayOfMonth(Math.max(1, Math.min(31, parseInt(e.target.value, 10) || 1)))}
                    min="1" max="31"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Fecha de Inicio</label>
                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
             </div>
             <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">Fecha de Fin</label>
                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
             </div>
          </div>

          <div>
            <label htmlFor="routine-description" className="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
            <textarea id="routine-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

           <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                <button type="button" onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                    category === cat.id ? `${cat.color} text-white ring-2 ring-offset-2 ${cat.ring}` : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}>
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
                <legend className="text-sm font-medium text-slate-800">Recordatorios para cada evento</legend>
                 <div className="mt-2 space-y-3">
                    <div className="flex items-center">
                        <input id="routine-reminder" type="checkbox" checked={reminder} onChange={(e) => setReminder(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                        <label htmlFor="routine-reminder" className="ml-3 block text-sm text-slate-700">Notificación en la aplicación</label>
                    </div>
                    <div className="relative">
                        <div className="flex items-center">
                             <input id="routine-whatsappReminder" type="checkbox" checked={whatsappReminder} onChange={(e) => setWhatsappReminder(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"/>
                            <label htmlFor="routine-whatsappReminder" className="ml-3 block text-sm text-slate-700">Activar Recordatorio por WhatsApp</label>
                        </div>
                        {whatsappReminder && (
                            <div className="mt-3 pl-7 space-y-3">
                                <div>
                                    <label htmlFor="routine-whatsappNumber" className="block text-xs font-medium text-slate-600 mb-1">Número de WhatsApp</label>
                                    <input type="tel" id="routine-whatsappNumber" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="+1234567890 (con código de país)" />
                                </div>
                                <div>
                                    <label htmlFor="routine-whatsappMessage" className="block text-xs font-medium text-slate-600 mb-1">Mensaje</label>
                                     <textarea id="routine-whatsappMessage" value={whatsappMessage} onChange={(e) => setWhatsappMessage(e.target.value)} rows={2}
                                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
                                </div>
                            </div>
                        )}
                    </div>
                 </div>
            </fieldset>
             {error && <p className="text-red-600 text-sm font-medium text-center bg-red-50 p-2 rounded-md">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
              {routineToEdit ? 'Guardar Cambios' : 'Guardar Rutina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};