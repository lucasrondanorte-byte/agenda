import React, { useState } from 'react';
import type { Trip } from '../types';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  onShareWithPartner: () => void;
  partnerName?: string;
}

// Icons
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);
const DocumentDuplicateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.375 2.25c.621 0 1.125.504 1.125 1.125v3.375m-13.5 0V9.375c0-.621.504-1.125 1.125-1.125h3.375m-3.375 0c.621 0 1.125.504 1.125 1.125v3.375" />
  </svg>
);
const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);

const TripCard: React.FC<{ trip: Trip }> = ({ trip }) => {
    return (
        <div className="bg-white p-3 pb-4 shadow-lg rounded-sm border border-slate-200">
            <div className="h-40 bg-slate-200 flex items-center justify-center overflow-hidden">
               {trip.coverPhoto ? 
                <img src={trip.coverPhoto} alt={trip.title} className="w-full h-full object-cover"/> : 
                <CameraIcon className="w-12 h-12 text-slate-400"/>
               }
            </div>
            <div className="p-3 text-center">
                <h3 className="font-bold text-xl text-slate-800 font-handwriting truncate">{trip.title}</h3>
                <p className="text-md text-slate-500 truncate">{trip.destination}</p>
            </div>
        </div>
    );
};


export const ShareTripModal: React.FC<ShareTripModalProps> = ({ isOpen, onClose, trip, onShareWithPartner, partnerName }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    if (!isOpen || !trip) return null;
    
    const handleCopyText = () => {
        const textToCopy = `
¡Mira este viaje!
Título: ${trip.title}
Destino: ${trip.destination}
Fechas: ${new Date(trip.startDate + 'T00:00:00').toLocaleDateString()} - ${new Date(trip.endDate + 'T00:00:00').toLocaleDateString()}

${trip.notes ? `Notas: ${trip.notes}`: ''}
        `.trim();
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-slate-50 rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">Compartir Viaje</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200">
                        <XMarkIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {/* Preview */}
                    <div>
                        <p className="text-sm font-medium text-slate-600 mb-2 text-center">Vista Previa</p>
                        <TripCard trip={trip} />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center space-y-4 pt-4 border-t border-slate-200">
                        {partnerName && (
                            <button onClick={onShareWithPartner} className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                                <UserIcon className="w-5 h-5"/>
                                <span className="font-semibold">Enviar a {partnerName}</span>
                            </button>
                        )}
                         <button onClick={handleCopyText} className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-slate-600 text-white rounded-lg shadow-sm hover:bg-slate-700 transition-colors">
                            <DocumentDuplicateIcon className="w-5 h-5"/>
                            <span className="font-semibold">{copyStatus === 'copied' ? '¡Copiado!' : 'Copiar Texto'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};