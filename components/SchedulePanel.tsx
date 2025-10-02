import React, { useState } from 'react';
import type { Event, EventCategory } from '../types';

interface SchedulePanelProps {
  selectedDate: Date;
  events: Event[];
  onAddEvent: () => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onManageRoutines: () => void;
  onToggleEventCompletion: (eventId: string) => void;
}

const categoryColors: Record<EventCategory, string> = {
    personal: '#3B82F6', // blue-500
    pareja: '#EC4899', // pink-500
    trabajo: '#22C55E', // green-500
    otro: '#64748B',   // slate-500
};

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const RepeatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-3.181-4.991v4.99" />
  </svg>
);

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);


export const SchedulePanel: React.FC<SchedulePanelProps> = ({ selectedDate, events, onAddEvent, onEditEvent, onDeleteEvent, onManageRoutines, onToggleEventCompletion }) => {
  const [expandedEventIds, setExpandedEventIds] = useState<string[]>([]);
  const dateString = selectedDate.toISOString().split('T')[0];

  const todaysEvents = events
    .filter(event => event.date === dateString)
    .sort((a, b) => a.time.localeCompare(b.time));

  const toggleExpand = (eventId: string) => {
    setExpandedEventIds(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold text-zinc-800">Agenda del Día</h2>
        <p className="text-md text-zinc-500 mt-1">
          {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      <div className="mt-6">
        <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-zinc-800">Eventos de Hoy</h3>
              <div className="flex items-center space-x-4">
                 <button onClick={onManageRoutines} className="flex items-center space-x-2 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors">
                    <RepeatIcon className="w-5 h-5"/>
                    <span>Rutinas</span>
                </button>
                <button onClick={onAddEvent} className="flex items-center space-x-2 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors">
                  <PlusIcon className="w-5 h-5"/>
                  <span>Añadir Evento</span>
                </button>
              </div>
            </div>
            {todaysEvents.length > 0 ? (
              <ul className="space-y-3">
                {todaysEvents.map(event => {
                    const isExpanded = expandedEventIds.includes(event.id);
                    return (
                        <li 
                            key={event.id} 
                            className={`p-3 rounded-lg flex flex-col group transition-all duration-300 ease-in-out border-l-4 ${
                            event.completed
                                ? 'bg-green-50 border-green-400'
                                : 'bg-stone-50'
                            }`}
                            style={!event.completed ? { borderColor: event.color || categoryColors[event.category] || categoryColors.otro } : {}}
                        >
                            <div className="flex justify-between items-start w-full">
                                <div className="flex items-start space-x-3 flex-grow min-w-0" onClick={() => event.description && toggleExpand(event.id)}>
                                    <input 
                                    type="checkbox" 
                                    checked={!!event.completed}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        onToggleEventCompletion(event.id);
                                    }}
                                    className="mt-1 h-5 w-5 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 cursor-pointer flex-shrink-0"
                                    aria-label={`Marcar ${event.title} como completado`}
                                    />
                                    <div className={`flex-grow ${event.description ? 'cursor-pointer' : ''}`}>
                                        <div className="flex items-center space-x-2">
                                            {event.completed && <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 transition-opacity" />}
                                            <p className={`font-semibold text-zinc-800 truncate transition-colors ${event.completed ? 'line-through text-zinc-500' : ''}`}>{event.title}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 text-sm transition-colors ${event.completed ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                            <span>{event.time}</span>
                                            {event.reminder && (
                                                <div title="Recordatorio en la app activado">
                                                    <BellIcon className={`w-4 h-4 transition-colors ${event.completed ? 'text-zinc-400' : 'text-teal-500'}`} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                    {event.description && (
                                        <button onClick={() => toggleExpand(event.id)} className="p-1.5 text-zinc-500 rounded-md">
                                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                    )}
                                    <button onClick={() => onEditEvent(event)} className="p-1.5 text-zinc-500 hover:text-teal-600 rounded-md hover:bg-zinc-200" title={event.routineId ? 'Edita la rutina para cambiar este evento' : 'Editar evento'}>
                                        <PencilIcon className={`w-4 h-4 ${event.routineId ? 'text-zinc-300 cursor-not-allowed' : ''}`}/>
                                    </button>
                                    <button onClick={() => onDeleteEvent(event.id)} className="p-1.5 text-zinc-500 hover:text-red-600 rounded-md hover:bg-zinc-200" title={event.routineId ? 'Elimina la rutina para borrar este evento' : 'Eliminar evento'}>
                                        <TrashIcon className={`w-4 h-4 ${event.routineId ? 'text-zinc-300 cursor-not-allowed' : ''}`}/>
                                    </button>
                                </div>
                            </div>
                            {isExpanded && event.description && (
                                <div className="pl-8 pt-2">
                                    <p className={`text-sm whitespace-pre-wrap transition-colors ${event.completed ? 'text-zinc-500' : 'text-zinc-600'}`}>{event.description}</p>
                                </div>
                            )}
                        </li>
                    )
                })}
              </ul>
            ) : (
              <p className="text-center text-zinc-500 py-8">No hay eventos programados para hoy.</p>
            )}
          </div>
      </div>
    </div>
  );
};