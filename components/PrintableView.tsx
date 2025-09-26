import React, { useState } from 'react';
import type { Event, EventCategory } from '../types';

interface PrintableViewProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  initialDate: Date;
}

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const PrinterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0M3.454 3.454a2.25 2.25 0 0 1 3.182 0L7.5 4.5m6 0 1.13-1.131a2.25 2.25 0 0 1 3.182 0l2.122 2.121a2.25 2.25 0 0 1 0 3.182L18.75 8.25m-1.5-1.5-3.879 3.88a2.25 2.25 0 0 1-3.182 0L6 9.75M12 15.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);


const categoryColors: Record<EventCategory, string> = {
    personal: '#3B82F6', // blue-500
    pareja: '#EC4899', // pink-500
    trabajo: '#22C55E', // green-500
    otro: '#64748B',   // slate-500
};

export const PrintableView: React.FC<PrintableViewProps> = ({ isOpen, onClose, events, initialDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date(initialDate));

  if (!isOpen) return null;

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const eventsByDate = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-start-${i}`} className="border-r border-b border-slate-300"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      const dayEvents = (eventsByDate[dateString] || []).sort((a,b) => a.time.localeCompare(b.time));

      days.push(
        <div key={i} className="relative p-2 h-40 border-r border-b border-slate-300 flex flex-col">
          <span className="font-semibold text-slate-700">{i}</span>
          {dayEvents.length > 0 && (
            <div className="mt-1 space-y-1 overflow-auto">
                {dayEvents.map(event => (
                    <div 
                    key={`print-${event.id}`} 
                    className="w-full text-[10px] p-1 rounded text-white whitespace-normal"
                    style={{ backgroundColor: event.color || categoryColors[event.category] || categoryColors.otro }}
                    >
                    <span className="font-bold">{event.time}</span> {event.title}
                    </div>
                ))}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div id="printable-view-container" className="fixed inset-0 bg-white z-50 p-8 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 no-print">
            <h1 className="text-3xl font-bold text-slate-800">
                Vista de Impresión
            </h1>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <ChevronLeftIcon className="w-6 h-6 text-slate-600" />
                    </button>
                    <h2 className="text-2xl font-semibold text-slate-700 w-48 text-center">
                        {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <ChevronRightIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </div>
                <button onClick={() => window.print()} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    <PrinterIcon className="w-5 h-5" />
                    <span>Imprimir</span>
                </button>
                 <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <XMarkIcon className="w-7 h-7 text-slate-600" />
                </button>
            </div>
        </header>

        {/* Calendar Grid */}
        <div className="flex-grow flex flex-col border-t border-l border-slate-300">
            <div className="grid grid-cols-7">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center py-2 text-sm font-bold text-slate-600 bg-slate-100 border-r border-b border-slate-300">{day}</div>
                ))}
            </div>
             <div className="grid grid-cols-7 flex-grow">
                {renderDays()}
            </div>
        </div>
    </div>
  );
};
