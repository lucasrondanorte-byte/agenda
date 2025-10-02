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
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a2.25 2.25 0 0 0-2.25-2.25H9.75a2.25 2.25 0 0 0-2.25 2.25v3.75m6 0H7.5m9 0h-9m9 0v6m-9-6v6m0-6H5.25a2.25 2.25 0 0 0-2.25 2.25v4.5a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25v-4.5a2.25 2.25 0 0 0-2.25-2.25H18.75" />
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

  const renderDaysForView = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDay = firstDayOfMonth.getDay();

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

  const handlePrint = () => {
    const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDay = firstDayOfMonth.getDay();

    let daysHtml = '';
    for (let i = 0; i < startDay; i++) {
      daysHtml += `<div class="day-cell empty-cell"></div>`;
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      const dayEvents = (eventsByDate[dateString] || []).sort((a,b) => a.time.localeCompare(b.time));
      
      const eventsHtml = dayEvents.map(event => `
        <div class="event" style="background-color: ${event.color || categoryColors[event.category] || categoryColors.otro};">
          <strong>${event.time}</strong> ${event.title}
        </div>
      `).join('');

      daysHtml += `
        <div class="day-cell">
          <div class="day-number">${i}</div>
          ${eventsHtml}
        </div>
      `;
    }

    const printContent = `
      <html>
        <head>
          <title>Calendario Mensual - ${monthName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            h1 { text-align: center; color: #1e40af; font-size: 1.8em; text-transform: capitalize; }
            .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1px solid #ccc; border-left: 1px solid #ccc; }
            .day-header { text-align: center; padding: 8px; font-weight: bold; background-color: #f1f5f9; border-right: 1px solid #ccc; border-bottom: 1px solid #ccc; font-size: 0.9em; }
            .day-cell { border-right: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 5px; height: 120px; vertical-align: top; }
            .day-number { font-weight: bold; font-size: 0.9em; color: #475569; margin-bottom: 4px; }
            .empty-cell { background-color: #f8fafc; }
            .event { font-size: 10px; padding: 3px; border-radius: 3px; color: white; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          </style>
        </head>
        <body>
          <h1>${monthName}</h1>
          <div class="calendar-grid">
            ${daysOfWeek.map(day => `<div class="day-header">${day}</div>`).join('')}
            ${daysHtml}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
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
                <button onClick={handlePrint} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
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
                {renderDaysForView()}
            </div>
        </div>
    </div>
  );
};