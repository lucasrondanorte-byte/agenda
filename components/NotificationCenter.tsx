import React from 'react';
import type { Notification } from '../types';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.455.09-.934.09-1.425v-2.552c0-3.542 2.67-6.443 6-6.443h2.25c2.519 0 4.716 1.632 5.49 3.868.17.44.258.913.258 1.396Z" />
  </svg>
);

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm.008-3h.008v.008H12.008V9.75Zm-3 3h.008v.008H9v-.008Zm0-3h.008v.008H9V9.75Zm3 0h.008v.008H12V9.75Zm-3 0h.008v.008H9V9.75Zm6 3h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008V9.75Zm-3 3h.008v.008h-.008v-.008Zm-3-3h.008v.008H9v-.008Z" />
  </svg>
);

const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);


const notificationIcons: Record<Notification['type'], React.ReactElement> = {
  pairing_request: <UserGroupIcon className="w-6 h-6 text-indigo-500" />,
  pairing_accepted: <UserGroupIcon className="w-6 h-6 text-green-500" />,
  new_partner_note: <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-yellow-500" />,
  new_qa_question: <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-cyan-500" />,
  new_shared_emotion: <UserGroupIcon className="w-6 h-6 text-pink-500" />,
  new_shared_reflection: <BookOpenIcon className="w-6 h-6 text-purple-500" />,
  new_shared_trip: <UserGroupIcon className="w-6 h-6 text-blue-500" />,
  event_reminder: <CalendarDaysIcon className="w-6 h-6 text-teal-500" />,
  daily_reflection_prompt: <BookOpenIcon className="w-6 h-6 text-amber-500" />,
  goal_checkin: <UserGroupIcon className="w-6 h-6 text-lime-500" />,
  generic: <UserGroupIcon className="w-6 h-6 text-slate-500" />,
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "ahora";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
};


export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  isMuted,
  onToggleMute,
  onClose,
}) => {
    return (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-zinc-200 z-50 flex flex-col overflow-hidden animate-fade-in">
            <style>{`
                @keyframes fade-in {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
            <div className="p-3 border-b border-zinc-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-zinc-800 text-lg">Notificaciones</h3>
                    <div className="flex items-center space-x-2">
                        <button onClick={onToggleMute} title={isMuted ? "Activar notificaciones" : "Silenciar notificaciones"}
                          className={`p-1.5 rounded-full ${isMuted ? 'text-red-500 bg-red-100' : 'text-zinc-500 hover:bg-zinc-100'}`}>
                            <BellSnoozeIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
                {notifications.some(n => !n.read) && (
                    <button onClick={onMarkAllAsRead} className="text-xs font-medium text-teal-600 hover:underline mt-1">
                        Marcar todo como leído
                    </button>
                )}
            </div>

            <div className="flex-grow overflow-y-auto max-h-96">
                {notifications.length > 0 ? (
                    <ul>
                        {notifications.map(n => (
                            <li key={n.id} onClick={() => { onNotificationClick(n); onClose(); }}
                                className={`flex items-start p-3 space-x-3 cursor-pointer transition-colors ${ n.read ? 'hover:bg-zinc-50' : 'bg-teal-50 hover:bg-teal-100'}`}>
                                <div className="flex-shrink-0 mt-0.5">
                                    {notificationIcons[n.type] || notificationIcons.generic}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-zinc-800">{n.title}</p>
                                    <p className="text-sm text-zinc-600">{n.message}</p>
                                    <p className="text-xs text-zinc-400 mt-1">{formatTimeAgo(n.timestamp)}</p>
                                </div>
                                {!n.read && (
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center p-12 text-zinc-500">
                        <p className="font-semibold">Todo al día</p>
                        <p className="text-sm mt-1">No tienes notificaciones nuevas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
