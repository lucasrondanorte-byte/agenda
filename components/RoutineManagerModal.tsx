import React, { useState } from 'react';
import type { Routine } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface RoutineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  routines: Routine[];
  onEdit: (routine: Routine) => void;
  onDelete: (routineId: string) => void;
  onCreate: () => void;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
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


export const RoutineManagerModal: React.FC<RoutineManagerModalProps> = ({ isOpen, onClose, routines, onEdit, onDelete, onCreate }) => {
  const [confirmationState, setConfirmationState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; } | null>(null);
  
  if (!isOpen) return null;

  const requestDeletion = (routine: Routine) => {
    setConfirmationState({
      isOpen: true,
      title: 'Eliminar Rutina',
      message: `¿Estás seguro? Se eliminará la rutina "${routine.title}" y todos sus eventos futuros.`,
      onConfirm: () => onDelete(routine.id)
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-800">Gestionar Rutinas</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
                  <XMarkIcon className="w-6 h-6 text-slate-500" />
              </button>
          </div>

          <div className="mb-6">
              <button 
                  onClick={onCreate}
                  className="w-full px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                  Crear Nueva Rutina
              </button>
          </div>
          
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {routines.length > 0 ? routines.map(routine => (
                  <div key={routine.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center group">
                      <div className="flex items-center space-x-3">
                          <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: routine.color || '#64748B' }}></span>
                          <p className="font-semibold text-slate-800">{routine.title}</p>
                      </div>
                      <div className="flex items-center space-x-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEdit(routine)} className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-200">
                              <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => requestDeletion(routine)} className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-200">
                              <TrashIcon className="w-4 h-4"/>
                          </button>
                      </div>
                  </div>
              )) : (
                  <p className="text-center text-slate-500 py-8">No has creado ninguna rutina todavía.</p>
              )}
          </div>
        </div>
      </div>
      {confirmationState?.isOpen && (
          <ConfirmationModal 
              isOpen={confirmationState.isOpen}
              onClose={() => setConfirmationState(null)}
              onConfirm={() => {
                  confirmationState.onConfirm();
                  setConfirmationState(null);
              }}
              title={confirmationState.title}
              message={confirmationState.message}
          />
      )}
    </>
  );
};