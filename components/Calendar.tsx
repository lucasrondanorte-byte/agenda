import React from 'react';
import type { Event, EventCategory } from '../types';

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events: Event[];
  onOpenPrintView: () => void;
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

const categoryColors: Record<EventCategory, string> = {
    personal: '#3B82F6', // blue-500
    pareja: '#EC4899', // pink-500
    trabajo: '#22C55E', // green-500
    otro: '#64748B',   // slate-500
};

export const Calendar: React.FC<CalendarProps> = ({ currentDate, setCurrentDate, selectedDate, onDateSelect, events, onOpenPrintView }) => {
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
  
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const today = new Date();

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
    // Padding for days before the start of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-start-${i}`} className="border-r border-b border-slate-100"></div>);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      const dayEvents = (eventsByDate[dateString] || []).sort((a,b) => a.time.localeCompare(b.time));

      const isToday = isSameDay(date, today);
      const isSelected = isSameDay(date, selectedDate);

      let dayClass = 'relative p-2 h-24 border-r border-b border-slate-100 flex flex-col cursor-pointer transition-colors duration-200';
      if (isSelected) {
        dayClass += ' bg-indigo-100';
      } else if(isToday) {
        dayClass += ' bg-slate-50';
      } else {
        dayClass += ' hover:bg-slate-50';
      }

      let dateNumberClass = 'text-sm font-medium';
       if (isSelected) {
        dateNumberClass += ' text-indigo-700';
      } else if (isToday) {
        dateNumberClass += ' text-indigo-600';
      } else {
         dateNumberClass += ' text-slate-500';
      }


      days.push(
        <div key={i} className={dayClass} onClick={() => onDateSelect(date)}>
          <span className={dateNumberClass}>{i}</span>
          {dayEvents.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
                {dayEvents.slice(0, 2).map(event => (
                <div 
                    key={event.id} 
                    className="w-full text-xs truncate px-1.5 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: event.color || categoryColors[event.category] || categoryColors.otro }}
                    >
                    {event.title}
                </div>
                ))}
                {dayEvents.length > 2 && (
                    <div className="text-xs text-slate-500 mt-1">+{dayEvents.length - 2} más</div>
                )}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-700">
          {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
            <button onClick={onOpenPrintView} title="Abrir vista de impresión" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <PrinterIcon className="w-5 h-5 text-slate-500" />
            </button>
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ChevronLeftIcon className="w-5 h-5 text-slate-500" />
          </button>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ChevronRightIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-t border-l border-slate-100 rounded-lg overflow-hidden">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center py-2 text-sm font-semibold text-slate-500 bg-slate-50 border-r border-b border-slate-100">{day}</div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};