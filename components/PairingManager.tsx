import React, { useState } from 'react';
import type { User, PairingRequest } from '../types';

interface PairingManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  pairedUser: User | null;
  users: User[];
  requests: PairingRequest[];
  onSendRequest: (email: string) => Promise<{ success: boolean; message: string }>;
  onRespondToRequest: (requestId: string, status: 'accepted' | 'declined') => void;
  onUnpair: () => void;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);


export const PairingManager: React.FC<PairingManagerProps> = ({ 
    isOpen, onClose, currentUser, pairedUser, users, requests, 
    onSendRequest, onRespondToRequest, onUnpair 
}) => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendStatus, setSendStatus] = useState('');

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
        setSendError('Por favor, introduce un correo electrónico válido.');
        return;
    }
    setIsSending(true);
    setSendError('');
    setSendStatus('');
    const result = await onSendRequest(email);
    setIsSending(false);
    if (result.success) {
        setEmail('');
        setSendStatus(result.message);
    } else {
        setSendError(result.message);
    }
  };

  const incomingRequests = requests.filter(r => r.toUserId === currentUser.id && r.status === 'pending');
  const outgoingRequests = requests.filter(r => r.fromUserId === currentUser.id && r.status === 'pending');
  
  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Usuario desconocido';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Gestionar Conexiones</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
                <XMarkIcon className="w-6 h-6 text-slate-500" />
            </button>
        </div>
        
        {/* Current Status */}
        <div className="p-4 bg-slate-50 rounded-lg mb-6">
            <h3 className="font-semibold text-slate-700">Tu estado actual</h3>
            {pairedUser ? (
                 <div className="flex justify-between items-center mt-2">
                    <p className="text-slate-600">Vinculado/a con <span className="font-bold text-indigo-600">{pairedUser.name}</span>.</p>
                    <button onClick={onUnpair} className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200">
                        Desvincular
                    </button>
                </div>
            ) : (
                <p className="text-slate-600 mt-2">No estás vinculado/a con nadie.</p>
            )}
        </div>
        
        {/* Incoming Requests */}
        {incomingRequests.length > 0 && (
            <div className="mb-6">
                 <h3 className="font-semibold text-slate-700 mb-2">Solicitudes Entrantes</h3>
                 <ul className="space-y-2">
                    {incomingRequests.map(req => (
                        <li key={req.id} className="p-3 bg-indigo-50 rounded-md flex justify-between items-center">
                            <p className="text-slate-800">
                                <span className="font-bold text-indigo-700">{getUserName(req.fromUserId)}</span> quiere vincularse contigo.
                            </p>
                            <div className="flex space-x-2">
                                <button onClick={() => onRespondToRequest(req.id, 'accepted')} className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600">Aceptar</button>
                                <button onClick={() => onRespondToRequest(req.id, 'declined')} className="px-3 py-1 bg-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-300">Rechazar</button>
                            </div>
                        </li>
                    ))}
                 </ul>
            </div>
        )}

        {/* If not paired, show options to connect */}
        {!pairedUser && (
            <div>
                {outgoingRequests.length > 0 && (
                     <div className="mb-6">
                        <h3 className="font-semibold text-slate-700 mb-2">Solicitudes Enviadas</h3>
                        <ul className="space-y-2">
                        {outgoingRequests.map(req => (
                            <li key={req.id} className="p-3 bg-slate-100 rounded-md flex justify-between items-center">
                                <p className="text-slate-600">Esperando respuesta de <span className="font-bold">{getUserName(req.toUserId)}</span>.</p>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}

                <div>
                    <h3 className="font-semibold text-slate-700 mb-2">Vincular con un nuevo usuario por correo</h3>
                    <div className="flex items-start sm:items-center flex-col sm:flex-row gap-2">
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setSendError(''); setSendStatus(''); }}
                            placeholder="correo@ejemplo.com"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button onClick={handleSend} disabled={isSending} className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex-shrink-0">
                            {isSending ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    </div>
                    {sendError && <p className="text-red-600 text-sm mt-2">{sendError}</p>}
                    {sendStatus && <p className="text-green-600 text-sm mt-2">{sendStatus}</p>}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
