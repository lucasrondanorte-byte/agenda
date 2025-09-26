// This component renders the main header for the application.
import React, { useState, useEffect, useRef } from 'react';
import type { User, Notification } from '../types';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onManagePairing: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onNavigateToPlanner: () => void;
  onNavigateToTravelLog: () => void;
  activeSection: 'planner' | 'travel';
}

const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962A3.75 3.75 0 0 1 15 12a3.75 3.75 0 0 1-2.25-6.962m8.024 10.928A9 9 0 1 0 3 18.72m10.602 0A9.01 9.01 0 0 0 18 18.72m-7.5 0v-2.25m0 2.25a3.75 3.75 0 0 0 3.75 3.75M10.5 18.75a3.75 3.75 0 0 0-3.75 3.75m0 0a3.75 3.75 0 0 0 3.75-3.75M3 13.5A3.75 3.75 0 0 1 6.75 9.75a3.75 3.75 0 0 1 3.75 3.75m-3.75 0a3.75 3.75 0 0 0-3.75 3.75" />
  </svg>
);

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-7.5 12h1.5m3 0h1.5m3 0h1.5m-7.5 4.5h1.5m3 0h1.5m3 0h1.5" />
  </svg>
);

const GlobeAltIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c.506 0 1.023-.045 1.531-.132M3.284 14.251 12 21m0 0 8.716-6.749M12 3c.506 0 1.023.045 1.531.132M20.716 9.749 12 3m0 0L3.284 9.749m17.432 0c.32.222.61.472.87.75M3.284 9.749c-.32.222-.61.472-.87.75m19.452-1.5c.343.52.627 1.074.846 1.658M2.308 11.157a15.2 15.2 0 0 1-.846-1.658m19.452 1.5 1.488-9.716a1.125 1.125 0 0 0-1.282-1.282L3.84 8.249m17.432 1.5-1.488 9.716a1.125 1.125 0 0 1-1.282 1.282L3.84 15.751" />
  </svg>
);

const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ 
    user, 
    onLogout, 
    onManagePairing, 
    notifications, 
    onMarkAsRead, 
    onMarkAllAsRead, 
    isMuted, 
    onToggleMute, 
    onNavigateToPlanner, 
    onNavigateToTravelLog,
    activeSection 
}) => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationCenterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={onNavigateToPlanner}
          title="Ir al planificador"
        >
          <div className="flex-shrink-0 p-2 bg-indigo-500 rounded-lg">
              <CalendarDaysIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ConectaMente</h1>
        </div>
        <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-600">Hola, {user.name}</span>
            <div ref={notificationRef} className="relative">
              <button 
                onClick={() => setIsNotificationCenterOpen(prev => !prev)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Ver notificaciones"
              >
                <BellIcon className="w-6 h-6"/>
                 {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                      {unreadCount}
                    </span>
                 )}
              </button>
               {isNotificationCenterOpen && (
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={onMarkAsRead}
                  onMarkAllAsRead={onMarkAllAsRead}
                  isMuted={isMuted}
                  onToggleMute={onToggleMute}
                  onClose={() => setIsNotificationCenterOpen(false)}
                />
              )}
            </div>
             <button 
              onClick={onNavigateToTravelLog}
              className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeSection === 'travel' 
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <GlobeAltIcon className="w-5 h-5 text-indigo-500"/>
              <span>Bitácora de Viaje</span>
            </button>
            <button 
              onClick={onManagePairing}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2"
            >
              <UserGroupIcon className="w-5 h-5 text-slate-500"/>
              <span>Conexiones</span>
            </button>
             <button 
                onClick={onLogout}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
             >
                Cerrar Sesión
            </button>
        </div>
      </div>
    </header>
  );
};