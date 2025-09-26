import React, { useState } from 'react';
import type { Notification } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
}

const BellSnoozeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M8.25 9.75A2.625 2.625 0 0 0 5.625 7.125v-1.5a3.375 3.375 0 0 1 6.75 0v1.5c0 .418.053.824.152 1.218" />
  </svg>
);

const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962A3.75 3.75 0 0 1 15 12a3.75 3.75 0 0 1-2.25-6.962m8.024 10.928A9 9 0 1 0 3 18.72m10.602 0A9.01 9.01 0 0 0 18 18.72m-7.5 0v-2.25m0 2.25a3.75 3.75 0 0 0 3.75 3.75M10.5 18.75a3.75 3.75 0 0 0-3.75 3.75m0 0a3.75 3.75 0 0 0 3.75-3.75M3 13.5A3.75 3.75 0 0 1 6.75 9.75a3.75 3.75 0 0 1 3.75 3.75m-3.75 0a3.75 3.75 0 0 0-3.75 3.75" />
  </svg>
);

const ChatBubbleLeftEllipsisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.53-.388m-5.168-4.285A11.979 11.979 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
  </svg>
);

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-7.5 12h1.5m3 0h1.5m3 0h1.5m-7.5 4.5h1.5m3 0h1.5m3 0h1.5" />
  </svg>
);

const NoSymbolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);



const notificationIcons: Record<Notification['type'], React.ReactElement> = {
  pairing_request: <UserGroupIcon className="w-5 h-5 text-indigo-500" />,
  pairing_accepted: <UserGroupIcon className="w-5 h-5 text-green-500" />,
  new_message: <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-sky-500" />,
  new_emotion: <HeartIcon className="w-5 h-5 text-pink-500" />,
  event_reminder: <CalendarIcon className="w-5 h-5 text-amber-500" />,
  generic: <BellSnoozeIcon className="w-5 h-5 text-slate-500" />,
};

const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "ahora";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `hace ${diffInDays}d`;
};


export const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead, isMuted, onToggleMute, onClose }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
        <style>{`
            @keyframes fade-in {
                0% { opacity: 0; transform: translateY(-10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        `}</style>
        <div className="p-4 border-b border-slate-100">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Notificaciones</h3>
                {unreadCount > 0 && (
                    <button onClick={onMarkAllAsRead} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                        Marcar todo como leído
                    </button>
                )}
            </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
                <ul>
                    {notifications.map(n => (
                        <li key={n.id} onClick={() => onMarkAsRead(n.id)} className={`flex items-start gap-4 p-4 border-b border-slate-100 cursor-pointer transition-colors ${!n.read ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-50'}`}>
                            <div className="flex-shrink-0 mt-0.5">
                                {notificationIcons[n.type] || notificationIcons.generic}
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                                <p className="text-sm text-slate-600">{n.message}</p>
                                <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(n.timestamp)}</p>
                            </div>
                            {!n.read && (
                                <div className="flex-shrink-0 mt-0.5">
                                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full block"></span>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="p-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <NoSymbolIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-600">No tienes notificaciones</p>
                    <p className="mt-1 text-xs text-slate-500">Aquí aparecerán las nuevas alertas.</p>
                </div>
            )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100">
            <label htmlFor="mute-toggle" className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-slate-700">Silenciar notificaciones</span>
                <div className="relative">
                    <input type="checkbox" id="mute-toggle" className="sr-only" checked={isMuted} onChange={onToggleMute} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${isMuted ? 'bg-slate-300' : 'bg-indigo-500'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isMuted ? 'transform translate-x-0' : 'transform translate-x-4'}`}></div>
                </div>
            </label>
        </div>
    </div>
  );
};