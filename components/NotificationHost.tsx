import React, { useEffect } from 'react';
import type { Notification } from '../types';

interface NotificationHostProps {
  toastNotifications: Notification[];
  setToastNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);


const NotificationCard: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
    
  useEffect(() => {
    // No auto-dismiss for notifications with actions
    if (notification.action) return;

    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 8000); // Auto-dismiss after 8 seconds

    return () => clearTimeout(timer);
  }, [notification.id, notification.action, onDismiss]);

  return (
    <div className="bg-white rounded-lg shadow-2xl p-4 w-full max-w-sm pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-fade-in-up">
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
      <div className="flex items-start">
        <div className="flex-shrink-0">
         <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
         </div>
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
          <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
          {notification.action && (
            <div className="mt-3 flex space-x-3">
              <button
                onClick={() => {
                  notification.action?.callback();
                  onDismiss(notification.id);
                }}
                className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button onClick={() => onDismiss(notification.id)} className="inline-flex text-slate-400 hover:text-slate-600">
            <span className="sr-only">Cerrar</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};


export const NotificationHost: React.FC<NotificationHostProps> = ({ toastNotifications, setToastNotifications }) => {
  const handleDismiss = (id: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toastNotifications.map(notification => (
          <NotificationCard key={notification.id} notification={notification} onDismiss={handleDismiss} />
        ))}
      </div>
    </div>
  );
};