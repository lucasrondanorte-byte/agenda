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
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a2.25 2.25 0 0 0-2.25-2.25H9.75a2.25 2.25 0 0 0-2.25 2.25v3.75m6 0H7.5m9 0h-9m9 0v6m-9-6v6m0-6H5.25a2.25 2.25 0 0 0-2.25 2.25v4.5a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25v-4.5a2.25 2.25 0 0 0-2.25-2.25H18.75" />
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
      days.push(<div key={`empty-start-${i}`} className="border-r border-b border-zinc-100"></div>);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      const dayEvents = (eventsByDate[dateString] || []).sort((a,b) => a.time.localeCompare(b.time));

      const isToday = isSameDay(date, today);
      const isSelected = isSameDay(date, selectedDate);
      
      const now = new Date();
      const hasPendingPastEvents = dayEvents.some(event => {
          const eventDateTime = new Date(`${event.date}T${event.time}`);
          return eventDateTime < now && !event.completed;
      });

      let dayClass = 'relative p-2 h-24 border-r border-b border-zinc-100 flex flex-col cursor-pointer transition-colors duration-200';
      if (isSelected) {
        dayClass += ' bg-teal-100';
      } else if(isToday) {
        dayClass += ' bg-stone-50';
      } else {
        dayClass += ' hover:bg-stone-50';
      }

      let dateNumberClass = 'text-sm font-medium';
       if (isSelected) {
        dateNumberClass += ' text-teal-700';
      } else if (isToday) {
        dateNumberClass += ' text-teal-600';
      } else {
         dateNumberClass += ' text-zinc-500';
      }


      days.push(
        <div key={i} className={dayClass} onClick={() => onDateSelect(date)}>
           {hasPendingPastEvents && (
            <span
                title="Hay eventos pasados sin completar"
                className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"
            ></span>
          )}
          <span className={dateNumberClass}>{i}</span>
          {dayEvents.length > 0 && (
            <div className="mt-1 flex-grow overflow-hidden">
              {dayEvents.length > 2 ? (
                // Dot view for 3+ events
                <div className="flex flex-wrap gap-1" aria-label={`${dayEvents.length} events`}>
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      title={`${event.time} - ${event.title}`}
                      className={`w-2 h-2 rounded-full ${event.completed ? 'opacity-40' : ''}`}
                      style={{ backgroundColor: event.color || categoryColors[event.category] || categoryColors.otro }}
                    />
                  ))}
                </div>
              ) : (
                // Pill view for 1-2 events
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className={`w-full text-xs truncate px-1.5 py-0.5 rounded text-white ${event.completed ? 'opacity-50' : ''}`}
                      style={{ backgroundColor: event.color || categoryColors[event.category] || categoryColors.otro }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
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
        <h2 className="text-xl font-semibold text-zinc-700">
          {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
            <button onClick={onOpenPrintView} title="Abrir vista de impresión" className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                <PrinterIcon className="w-5 h-5 text-zinc-500" />
            </button>
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
            <ChevronLeftIcon className="w-5 h-5 text-zinc-500" />
          </button>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
            <ChevronRightIcon className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-t border-l border-zinc-100 rounded-lg overflow-hidden">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center py-2 text-sm font-semibold text-zinc-500 bg-stone-50 border-r border-b border-zinc-100">{day}</div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
};