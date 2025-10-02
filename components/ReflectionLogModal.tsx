import React, { useState, useMemo } from 'react';
import type { JournalEntry } from '../types';

interface ReflectionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: JournalEntry[];
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const ReflectionLogModal: React.FC<ReflectionLogModalProps> = ({ isOpen, onClose, journalEntries }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredEntries = useMemo(() => {
    return [...journalEntries]
      .filter(entry => {
        // The timestamp is the source of truth
        const entryDate = new Date(entry.timestamp);
        entryDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

        if (startDate) {
          const filterStartDate = new Date(startDate + 'T00:00:00');
          if (entryDate < filterStartDate) {
            return false;
          }
        }
        
        if (endDate) {
           const filterEndDate = new Date(endDate + 'T00:00:00');
           if (entryDate > filterEndDate) {
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [journalEntries, startDate, endDate]);
  
  if (!isOpen) return null;
  
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDownload = () => {
    const printContent = `
      <html>
        <head>
          <title>Historial de Reflexiones</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
            h1 { color: #1e40af; }
            h2 { font-size: 1.1em; color: #666; font-weight: normal; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 20px; }
            .entry { border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f9fafb; page-break-inside: avoid; }
            .entry-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; color: #6b7280; font-size: 0.9em; }
            .date { font-weight: bold; font-size: 1.1em; color: #1d4ed8; }
            .emoji { font-size: 1.5em; margin-right: 10px; }
            .day-title { font-style: italic; color: #4b5563; }
            .thought { border-left: 3px solid #60a5fa; padding-left: 10px; margin: 10px 0; }
            .lesson { border-left: 3px solid #9ca3af; padding-left: 10px; margin: 10px 0; }
            strong { color: #374151; }
          </style>
        </head>
        <body>
          <h1>Historial de Reflexiones</h1>
          <h2>${startDate || endDate ? `Filtrado desde ${startDate ? formatDate(startDate) : 'el inicio'} hasta ${endDate ? formatDate(endDate) : 'el final'}` : 'Historial Completo'}</h2>
          ${filteredEntries.map(entry => `
            <div class="entry">
              <div class="entry-header">
                <span class="date">${formatDate(entry.timestamp)}</span>
                <span>${formatTime(entry.timestamp)}</span>
              </div>
              ${entry.dayTitle || entry.emotionEmoji ? `
                <p>
                    ${entry.emotionEmoji ? `<span class="emoji">${entry.emotionEmoji}</span>` : ''}
                    ${entry.dayTitle ? `<strong>Título del día:</strong> <span class="day-title">${entry.dayTitle}</span>` : ''}
                </p>` : ''}
              ${entry.positiveThought ? `<div class="thought"><p><strong>Pensamiento positivo:</strong> ${entry.positiveThought}</p></div>` : ''}
              ${entry.lessonLearned ? `<div class="lesson"><p><strong>Lección aprendida:</strong> ${entry.lessonLearned}</p></div>` : ''}
            </div>
          `).join('')}
          ${filteredEntries.length === 0 ? '<p>No hay entradas para el período seleccionado.</p>' : ''}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Mi Línea de Tiempo de Reflexiones</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
                <XMarkIcon className="w-6 h-6 text-slate-500" />
            </button>
        </div>

        <div className="px-1 py-4 mb-4 border-t border-b border-slate-200 flex flex-wrap items-end gap-4">
            <div className="flex-grow">
                <label htmlFor="start-date" className="block text-sm font-medium text-slate-600 mb-1">Desde</label>
                <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} 
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
            </div>
             <div className="flex-grow">
                <label htmlFor="end-date" className="block text-sm font-medium text-slate-600 mb-1">Hasta</label>
                <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
            </div>
            <button onClick={handleClearFilters}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
                Limpiar Filtros
            </button>
        </div>
        
        <div className="flex-grow overflow-y-auto max-h-[60vh] pr-4">
            {filteredEntries.length > 0 ? (
                <div className="relative border-l-2 border-slate-200 pl-6 space-y-8">
                    {filteredEntries.map(entry => (
                        <div key={entry.timestamp} className="relative">
                            <div className="absolute -left-[33px] top-1 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full"></div>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-baseline mb-3">
                                    <p className="text-md font-semibold text-indigo-700">{formatDate(entry.timestamp)}</p>
                                    <p className="text-sm font-medium text-slate-500">{formatTime(entry.timestamp)}</p>
                                </div>
                                <div className="space-y-4 text-sm">
                                    {(entry.dayTitle || entry.emotionEmoji) && (
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-md">
                                            {entry.emotionEmoji && <span className="text-3xl">{entry.emotionEmoji}</span>}
                                            {entry.dayTitle && (
                                                <div>
                                                    <p className="font-semibold text-slate-600">El título de mi día:</p>
                                                    <p className="text-slate-800 mt-1 italic">"{entry.dayTitle}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {entry.positiveThought && (
                                        <div>
                                            <p className="font-semibold text-slate-600">Pensamiento positivo:</p>
                                            <blockquote className="text-slate-800 mt-1 pl-3 border-l-4 border-indigo-300">{entry.positiveThought}</blockquote>
                                        </div>
                                    )}
                                    {entry.lessonLearned && (
                                        <div>
                                            <p className="font-semibold text-slate-600">Lección aprendida:</p>
                                            <blockquote className="text-slate-800 mt-1 pl-3 border-l-4 border-slate-300">{entry.lessonLearned}</blockquote>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-center text-slate-500 py-12">No se han encontrado reflexiones para el período seleccionado.</p>
            )}
        </div>

        <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleDownload}
              disabled={filteredEntries.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DownloadIcon className="w-5 h-5"/>
              <span>Descargar Historial</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cerrar
            </button>
        </div>
      </div>
    </div>
  );
};