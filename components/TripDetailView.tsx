import React from 'react';
import type { PartnerNote, Trip, User } from '../types';

// Icons for the modal
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);

const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return `${startDate.toLocaleDateString('es-ES', options)} - ${endDate.toLocaleDateString('es-ES', options)}`;
};

interface TripDetailViewProps {
  note: PartnerNote;
  onClose: () => void;
  author: User;
}

export const TripDetailView: React.FC<TripDetailViewProps> = ({ note, onClose, author }) => {
  if (!note.tripContent) return null;
  const trip = note.tripContent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col scrapbook-background" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-white/50 flex-shrink-0">
            <div>
                <h2 className="text-2xl font-bold text-zinc-800 font-handwriting">{trip.title}</h2>
                <p className="text-sm text-zinc-600">Compartido por {author.name}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100">
                <XMarkIcon className="w-6 h-6 text-zinc-500" />
            </button>
        </div>
        <div className="flex-grow overflow-y-auto max-h-[80vh] p-6">
            {trip.coverPhoto && (
                <div className="mb-4 shadow-lg rounded-sm p-2 bg-white transform -rotate-1">
                    <img src={trip.coverPhoto} alt={trip.title} className="w-full h-64 object-cover rounded-sm"/>
                </div>
            )}
            <div className="flex items-center text-zinc-600 mb-2">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span>{trip.destination}</span>
            </div>
            <p className="text-sm text-zinc-500 mb-4">{formatDateRange(trip.startDate, trip.endDate)}</p>
            {trip.notes && (
                <blockquote className="italic border-l-4 border-zinc-300 pl-4 py-2 my-4 bg-white/60 rounded-r-lg">
                    "{trip.notes}"
                </blockquote>
            )}

            <h3 className="text-xl font-semibold text-zinc-700 mt-6 mb-4 font-handwriting">Recuerdos del Viaje</h3>
            {trip.highlights.length > 0 ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {trip.highlights.map((h, index) => (
                        <div key={index} className={`flex flex-col sm:flex-row gap-4 items-start p-3 bg-white/80 shadow-md rounded-lg border border-zinc-200 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                            {h.photo && <img src={h.photo} alt={h.title} className="w-full sm:w-40 h-32 object-cover rounded-md flex-shrink-0" />}
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-1">
                                    {h.emotion && <span className="text-2xl">{h.emotion}</span>}
                                    <h4 className="font-bold text-zinc-800">{h.title}</h4>
                                </div>
                                <p className="text-xs text-zinc-500 mb-2">{new Date(h.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}</p>
                                <p className="text-sm text-zinc-600 whitespace-pre-wrap">{h.description}</p>
                            </div>
                        </div>
                    ))}
                 </div>
            ) : (
                <p className="text-center text-zinc-500 py-8">No se compartieron recuerdos específicos.</p>
            )}
        </div>
      </div>
    </div>
  );
};