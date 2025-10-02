// This component renders the main header for the application.
import React, { useState, useEffect, useRef } from 'react';
import type { User, Notification } from '../types';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onManagePairing: () => void;
  onManagePin: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onNavigateToPlanner: () => void;
  onNavigateToTravelLog: () => void;
  onNavigateToGoals: () => void;
  onNavigateToHome: () => void;
  activeSection: 'planner' | 'travel' | 'goals' | 'home';
}

const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962A3.75 3.75 0 0 1 15 12a3.75 3.75 0 0 1-2.25-6.962m8.024 10.928A9 9 0 1 0 3 18.72m10.602 0A9.01 9.01 0 0 0 18 18.72m-7.5 0v-2.25m0 2.25a3.75 3.75 0 0 0 3.75 3.75M10.5 18.75a3.75 3.75 0 0 0-3.75 3.75m0 0a3.75 3.75 0 0 0 3.75-3.75M3 13.5A3.75 3.75 0 0 1 6.75 9.75a3.75 3.75 0 0 1 3.75 3.75m-3.75 0a3.75 3.75 0 0 0-3.75 3.75" />
  </svg>
);

const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);

const BullseyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </svg>
);

const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
);

const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);
const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
  </svg>
);
const ArrowLeftStartOnRectangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
);


export const Header: React.FC<HeaderProps> = ({ 
    user, 
    onLogout, 
    onManagePairing,
    onManagePin,
    notifications, 
    onMarkAsRead, 
    onMarkAllAsRead, 
    onNotificationClick,
    isMuted, 
    onToggleMute, 
    onNavigateToPlanner, 
    onNavigateToTravelLog,
    onNavigateToGoals,
    onNavigateToHome,
    activeSection 
}) => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationCenterOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-3 px-2 sm:px-6 lg:px-8 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          onClick={onNavigateToPlanner}
          title="Ir al planificador"
        >
          <img src="https://i.postimg.cc/YhvKDdRc/Logo-for-Conecta-Mente-Clean-Sans-Serif-Abstract-Design.png" alt="ConectaMente Logo" className="h-10 sm:h-12 transition-transform duration-300 group-hover:scale-105" />
          <h1 className="hidden sm:block text-xl sm:text-2xl font-bold text-zinc-800 tracking-tight">ConectaMente</h1>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
             <button 
              onClick={onNavigateToHome}
              className={`p-2 sm:px-3 sm:py-1.5 border rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeSection === 'home' 
                  ? 'bg-teal-100 text-teal-700 border-teal-200'
                  : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <HomeIcon className="w-5 h-5 text-teal-500"/>
              <span className="hidden sm:inline">Mi Hogar</span>
            </button>
             <button 
              onClick={onNavigateToGoals}
              className={`p-2 sm:px-3 sm:py-1.5 border rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeSection === 'goals' 
                  ? 'bg-teal-100 text-teal-700 border-teal-200'
                  : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <BullseyeIcon className="w-5 h-5 text-teal-500"/>
              <span className="hidden sm:inline">Metas</span>
            </button>
             <button 
              onClick={onNavigateToTravelLog}
              className={`p-2 sm:px-3 sm:py-1.5 border rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeSection === 'travel' 
                  ? 'bg-teal-100 text-teal-700 border-teal-200'
                  : 'border-zinc-300 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <BriefcaseIcon className="w-5 h-5 text-teal-500"/>
              <span className="hidden sm:inline">Viajes</span>
            </button>
            <div ref={notificationRef} className="relative">
              <button 
                onClick={() => setIsNotificationCenterOpen(prev => !prev)}
                className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
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
                  onNotificationClick={onNotificationClick}
                  isMuted={isMuted}
                  onToggleMute={onToggleMute}
                  onClose={() => setIsNotificationCenterOpen(false)}
                />
              )}
            </div>

            <div className="relative" ref={userMenuRef}>
                 <button 
                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                    className="flex items-center space-x-2 p-2 rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                 >
                    <UserCircleIcon className="w-6 h-6"/>
                    <span className="text-sm font-medium text-zinc-600 hidden sm:block">{user.name}</span>
                    <ChevronDownIcon className="w-4 h-4 text-zinc-400"/>
                </button>
                {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-zinc-200 z-50 overflow-hidden animate-fade-in">
                        <style>{`
                            @keyframes fade-in {
                                0% { opacity: 0; transform: translateY(-10px); }
                                100% { opacity: 1; transform: translateY(0); }
                            }
                            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                        `}</style>
                        <div className="p-2">
                           <button onClick={() => { onManagePairing(); setIsUserMenuOpen(false); }}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors">
                                <UserGroupIcon className="w-5 h-5 text-zinc-500"/>
                                <span>Conexiones</span>
                           </button>
                           <button onClick={() => { onManagePin(); setIsUserMenuOpen(false); }}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors">
                                <KeyIcon className="w-5 h-5 text-zinc-500"/>
                                <span>Cambiar PIN</span>
                           </button>
                           <div className="my-1 h-px bg-zinc-100"></div>
                           <button onClick={onLogout}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                <ArrowLeftStartOnRectangleIcon className="w-5 h-5"/>
                                <span>Cerrar Sesión</span>
                           </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};