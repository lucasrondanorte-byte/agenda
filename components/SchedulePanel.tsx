import React from 'react';
import type { Event, EventCategory } from '../types';

interface SchedulePanelProps {
  selectedDate: Date;
  events: Event[];
  onAddEvent: () => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onManageRoutines: () => void;
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

const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="currentColor" viewBox="0 0 16 16" {...props}>
        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.93 7.93 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.89 7.89 0 0 0 13.6 2.326zM7.994 14.521a6.57 6.57 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
    </svg>
);

const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
);

export const SchedulePanel: React.FC<SchedulePanelProps> = ({ selectedDate, events, onAddEvent, onEditEvent, onDeleteEvent, onManageRoutines }) => {
  const dateString = selectedDate.toISOString().split('T')[0];

  const todaysEvents = events
    .filter(event => event.date === dateString)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Agenda del Día</h2>
        <p className="text-md text-slate-500 mt-1">
          {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      <div className="mt-6">
        <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-800">Eventos de Hoy</h3>
              <div className="flex items-center space-x-4">
                 <button onClick={onManageRoutines} className="flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                    <RepeatIcon className="w-5 h-5"/>
                    <span>Rutinas</span>
                </button>
                <button onClick={onAddEvent} className="flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  <PlusIcon className="w-5 h-5"/>
                  <span>Añadir Evento</span>
                </button>
              </div>
            </div>
            {todaysEvents.length > 0 ? (
              <ul className="space-y-3">
                {todaysEvents.map(event => (
                  <li key={event.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-start group">
                    <div className="flex items-start space-x-3 flex-grow min-w-0">
                        <span 
                            className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: event.color || categoryColors[event.category] || categoryColors.otro }}
                        ></span>
                        <div className="flex-grow">
                             <div className="flex items-center space-x-2">
                                {event.whatsappReminder && (
                                    <div title="Recordatorio de WhatsApp activado">
                                        <WhatsAppIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    </div>
                                )}
                                <p className="font-semibold text-slate-800 truncate">{event.title}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>{event.time}</span>
                                {event.reminder && (
                                    <div title="Recordatorio en la app activado">
                                        <BellIcon className="w-4 h-4 text-indigo-500" />
                                    </div>
                                )}
                            </div>
                            {event.description && <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{event.description}</p>}
                        </div>
                    </div>
                     <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      <button onClick={() => onEditEvent(event)} className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-200" title={event.routineId ? 'Edita la rutina para cambiar este evento' : 'Editar evento'}>
                        <PencilIcon className={`w-4 h-4 ${event.routineId ? 'text-slate-300 cursor-not-allowed' : ''}`}/>
                      </button>
                      <button onClick={() => onDeleteEvent(event.id)} className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-200" title={event.routineId ? 'Elimina la rutina para borrar este evento' : 'Eliminar evento'}>
                        <TrashIcon className={`w-4 h-4 ${event.routineId ? 'text-slate-300 cursor-not-allowed' : ''}`}/>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-slate-500 py-8">No hay eventos programados para hoy.</p>
            )}
          </div>
      </div>
    </div>
  );
};