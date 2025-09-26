// This is the main application component. It manages state and renders all other components.
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Calendar } from './components/Calendar';
import { SchedulePanel } from './components/SchedulePanel';
import { EventFormModal } from './components/EventFormModal';
import { RoutineFormModal } from './components/RoutineFormModal';
import { NotificationHost } from './components/NotificationHost';
import { Header } from './components/Header';
import { UserAuth } from './components/UserAuth';
import { PairingManager } from './components/PairingManager';
import { CoupleSpace } from './components/CoupleSpace';
import { PartnerNotes } from './components/PartnerNotes';
import { DailyReflection } from './components/DailyReflection';
import { TravelLog } from './components/TravelLog'; // Import new component
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Event, Notification, User, PairingRequest, SharedMessage, EmotionLog, JournalEntry, Routine, Goal, Trip } from './types';
import { v4 as uuidv4 } from 'uuid';
import { EmotionLogModal } from './components/EmotionLogModal';
import { ReflectionLogModal } from './components/ReflectionLogModal';
import { RoutineManagerModal } from './components/RoutineManagerModal';
import { PrintableView } from './components/PrintableView';
import { GoalsPanel } from './components/GoalsPanel';

const EXAMPLE_USERS: User[] = [
  { id: 'user-1', name: 'Vicki', pairedWith: null, password: 'password123' },
  { id: 'user-2', name: 'Lucas', pairedWith: null, password: 'password456' },
];

const getNextDayOfWeek = (dayOfWeek: number, fromDate: Date = new Date()): string => {
    const date = new Date(fromDate);
    // Adjust fromDate to the next day to avoid finding the same day if fromDate is the target dayOfWeek
    date.setDate(date.getDate() + 1);
    const currentDay = date.getDay();
    let diff = dayOfWeek - currentDay;
    if (diff < 0) {
        diff += 7;
    }
    date.setDate(date.getDate() + diff);
    return date.toISOString().split('T')[0];
};

const EXAMPLE_ROUTINES_DATA: Routine[] = [
  {
    id: 'routine-gym-1',
    title: 'Gimnasio',
    time: '07:00',
    description: 'Entrenamiento de fuerza.',
    category: 'personal',
    frequency: 'weekly',
    daysOfWeek: [1, 3, 5], // Lunes, Miércoles, Viernes
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString().split('T')[0],
    reminder: true,
    whatsappReminder: false,
    color: '#3B82F6', // blue-500
  },
  {
    id: 'routine-meeting-2',
    title: 'Reunión de Equipo',
    time: '09:30',
    description: 'Revisión semanal de proyectos.',
    category: 'trabajo',
    frequency: 'weekly',
    daysOfWeek: [2], // Martes
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString().split('T')[0],
    reminder: true,
    whatsappReminder: false,
    color: '#22C55E', // green-500
  },
];

const EXAMPLE_EVENTS_DATA: Event[] = [
    // Standalone Events
    {
        id: 'event-dinner-1',
        title: 'Cena con amigos',
        date: getNextDayOfWeek(5), // Next Friday
        time: '20:30',
        category: 'personal',
        reminder: true,
        color: '#EC4899', // pink-500
    },
    {
        id: 'event-dentist-2',
        title: 'Cita con el dentista',
        date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0], // 10 days from now
        time: '15:00',
        category: 'otro',
        reminder: true,
        color: '#64748B', // slate-500
    },
    // Events from Gym Routine
    {
        id: uuidv4(),
        routineId: 'routine-gym-1',
        title: 'Gimnasio',
        date: getNextDayOfWeek(1), // Next Monday
        time: '07:00',
        category: 'personal',
        reminder: true,
        color: '#3B82F6',
    },
    {
        id: uuidv4(),
        routineId: 'routine-gym-1',
        title: 'Gimnasio',
        date: getNextDayOfWeek(3), // Next Wednesday
        time: '07:00',
        category: 'personal',
        reminder: true,
        color: '#3B82F6',
    },
    {
        id: uuidv4(),
        routineId: 'routine-gym-1',
        title: 'Gimnasio',
        date: getNextDayOfWeek(5), // Next Friday
        time: '07:00',
        category: 'personal',
        reminder: true,
        color: '#3B82F6',
    },
    // Events from Meeting Routine
    {
        id: uuidv4(),
        routineId: 'routine-meeting-2',
        title: 'Reunión de Equipo',
        date: getNextDayOfWeek(2), // Next Tuesday
        time: '09:30',
        category: 'trabajo',
        reminder: true,
        color: '#22C55E',
    },
    {
        id: uuidv4(),
        routineId: 'routine-meeting-2',
        title: 'Reunión de Equipo',
        date: getNextDayOfWeek(2, new Date(getNextDayOfWeek(2))), // The Tuesday after next Tuesday
        time: '09:30',
        category: 'trabajo',
        reminder: true,
        color: '#22C55E',
    }
];

const EXAMPLE_TRIPS_DATA: Trip[] = [
    {
        id: 'trip-1',
        title: 'Aventura en la Montaña',
        destination: 'Bariloche, Argentina',
        startDate: '2024-01-15',
        endDate: '2024-01-22',
        notes: 'Un viaje increíble lleno de trekking y paisajes espectaculares. El chocolate caliente fue el mejor.',
        highlights: [
            { id: 'h-1-1', date: '2024-01-16', title: 'Cerro Campanario', description: 'Vistas panorámicas de 360 grados de los lagos y montañas. Impresionante.' },
            { id: 'h-1-2', date: '2024-01-18', title: 'Circuito Chico', description: 'Recorrido en coche por los lugares más icónicos, con paradas en miradores.' },
            { id: 'h-1-3', date: '2024-01-20', title: 'Caminata a Refugio Frey', description: 'Un trekking desafiante pero con una recompensa increíble al llegar a la laguna y el refugio.' },
        ],
    },
    {
        id: 'trip-2',
        title: 'Explorando la Historia',
        destination: 'Roma, Italia',
        startDate: '2024-05-10',
        endDate: '2024-05-17',
        notes: 'Cada esquina cuenta una historia. La comida es simplemente de otro nivel.',
        highlights: [
             { id: 'h-2-1', date: '2024-05-11', title: 'El Coliseo', description: 'Visita al amanecer para evitar las multitudes. Se sentía la historia en el aire.' },
             { id: 'h-2-2', date: '2024-05-13', title: 'El Vaticano', description: 'La Basílica de San Pedro y los Museos Vaticanos. La Capilla Sixtina es indescriptible.' },
        ],
    }
];

enum MainView {
  Personal = 'Personal',
  Couple = 'Pareja',
}

function App() {
  const [users, setUsers] = useLocalStorage<User[]>('users', EXAMPLE_USERS);
  const [pairingRequests, setPairingRequests] = useLocalStorage<PairingRequest[]>('pairingRequests', []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State for the main planner
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const userEventsKey = `events_${currentUser?.id}`;
  const userRoutinesKey = `routines_${currentUser?.id}`;
  const userJournalsKey = `journal_entries_${currentUser?.id}`;
  const userNotificationsKey = `notifications_${currentUser?.id}`;
  const userWeeklyGoalsKey = `weekly_goals_${currentUser?.id}`;
  const userMonthlyGoalsKey = `monthly_goals_${currentUser?.id}`;
  const userAnnualGoalsKey = `annual_goals_${currentUser?.id}`;
  const userTripsKey = `trips_${currentUser?.id}`;


  const [events, setEvents] = useLocalStorage<Event[]>(userEventsKey, EXAMPLE_EVENTS_DATA);
  const [routines, setRoutines] = useLocalStorage<Routine[]>(userRoutinesKey, EXAMPLE_ROUTINES_DATA);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>(userJournalsKey, []);
  const [weeklyGoals, setWeeklyGoals] = useLocalStorage<Goal[]>(userWeeklyGoalsKey, []);
  const [monthlyGoals, setMonthlyGoals] = useLocalStorage<Goal[]>(userMonthlyGoalsKey, []);
  const [annualGoals, setAnnualGoals] = useLocalStorage<Goal[]>(userAnnualGoalsKey, []);
  const [trips, setTrips] = useLocalStorage<Trip[]>(userTripsKey, EXAMPLE_TRIPS_DATA);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isRoutineManagerOpen, setIsRoutineManagerOpen] = useState(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [isEmotionLogModalOpen, setIsEmotionLogModalOpen] = useState(false);
  const [isReflectionLogModalOpen, setIsReflectionLogModalOpen] = useState(false);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  // Notification states
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>(userNotificationsKey, []);
  const [isNotificationsMuted, setIsNotificationsMuted] = useLocalStorage<boolean>('notifications_muted', false);

  const [notifiedWhatsappEvents, setNotifiedWhatsappEvents] = useLocalStorage<string[]>(`notified_whatsapp_${currentUser?.id}`, []);
  
  // Navigation states
  const [activeSection, setActiveSection] = useState<'planner' | 'travel'>('planner');
  const [mainView, setMainView] = useState<MainView>(MainView.Personal);

  const pairedUser = useMemo(() => {
    if (currentUser?.pairedWith) {
      return users.find(u => u.id === currentUser.pairedWith) || null;
    }
    return null;
  }, [currentUser, users]);

  const coupleId = useMemo(() => {
    if (!currentUser || !pairedUser) return null;
    return [currentUser.id, pairedUser.id].sort().join('_');
  }, [currentUser, pairedUser]);

  const [sharedMessages, setSharedMessages] = useLocalStorage<SharedMessage[]>(`messages_${coupleId}`, []);
  const [emotionLogs, setEmotionLogs] = useLocalStorage<EmotionLog[]>(`emotions_${coupleId}`, []);

  // Find the latest message and emotion from the partner
  const latestPartnerMessage = useMemo(() => {
    if (!pairedUser) return null;
    return [...sharedMessages]
      .filter(m => m.userId === pairedUser.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || null;
  }, [sharedMessages, pairedUser]);
  
  const latestPartnerEmotion = useMemo(() => {
    if (!pairedUser) return null;
    return [...emotionLogs]
      .filter(e => e.userId === pairedUser.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || null;
  }, [emotionLogs, pairedUser]);


  // Reset planner state on user change
  useEffect(() => {
    if (!currentUser) {
      setEvents([]);
      setRoutines([]);
      setJournalEntries([]);
      setNotifications([]);
      setToastNotifications([]);
      setNotifiedWhatsappEvents([]);
      setWeeklyGoals([]);
      setMonthlyGoals([]);
      setAnnualGoals([]);
      setTrips([]);
    } else {
        // This ensures that when a user logs in, their data is loaded.
        // The useLocalStorage hook handles the initial load, but this effect
        // helps ensure re-renders when the user ID changes.
        const newEventsKey = `events_${currentUser.id}`;
        const storedEvents = localStorage.getItem(newEventsKey);
        setEvents(storedEvents ? JSON.parse(storedEvents) : EXAMPLE_EVENTS_DATA);

        const newRoutinesKey = `routines_${currentUser.id}`;
        const storedRoutines = localStorage.getItem(newRoutinesKey);
        setRoutines(storedRoutines ? JSON.parse(storedRoutines) : EXAMPLE_ROUTINES_DATA);

        const newTripsKey = `trips_${currentUser.id}`;
        const storedTrips = localStorage.getItem(newTripsKey);
        setTrips(storedTrips ? JSON.parse(storedTrips) : EXAMPLE_TRIPS_DATA);
    }
  }, [currentUser, setEvents, setRoutines, setJournalEntries, setNotifications, setNotifiedWhatsappEvents, setWeeklyGoals, setMonthlyGoals, setAnnualGoals, setTrips]);

  const generateId = () => uuidv4();

  // User and Pairing Logic
  const handleLogin = (userId: string, password: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;

    // Allow login if user has no password set (legacy users)
    if (!user.password) {
      setCurrentUser(user);
      return true;
    }

    // Check password if it exists
    if (user.password === password) {
      setCurrentUser(user);
      return true;
    }

    return false; // Password incorrect
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const handleCreateUser = (name: string, password: string) => {
    const newUser: User = { id: generateId(), name, pairedWith: null, password };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };
  
  const handleSendRequest = (toUserId: string) => {
    if (!currentUser) return;
    const existingRequest = pairingRequests.find(
      r => (r.fromUserId === currentUser.id && r.toUserId === toUserId) || 
           (r.fromUserId === toUserId && r.toUserId === currentUser.id)
    );
    if (!existingRequest) {
      const newRequest: PairingRequest = { id: generateId(), fromUserId: currentUser.id, toUserId, status: 'pending' };
      setPairingRequests([...pairingRequests, newRequest]);
    }
  };

  const handleRespondToRequest = (requestId: string, status: 'accepted' | 'declined') => {
    const request = pairingRequests.find(r => r.id === requestId);
    if (!request) return;
    
    if (status === 'accepted') {
      // Update users
      const fromUser = users.find(u => u.id === request.fromUserId);
      const toUser = users.find(u => u.id === request.toUserId);
      if (fromUser && toUser) {
        fromUser.pairedWith = toUser.id;
        toUser.pairedWith = fromUser.id;
        
        const updatedUsers = users.map(u => {
          if (u.id === fromUser.id) return fromUser;
          if (u.id === toUser.id) return toUser;
          return u;
        });
        setUsers(updatedUsers);

        // Update current user state if they are involved
        if(currentUser && (currentUser.id === fromUser.id || currentUser.id === toUser.id)) {
            setCurrentUser(users.find(u => u.id === currentUser.id)!);
        }
      }
      // Remove all requests involving these two users
      setPairingRequests(pairingRequests.filter(r => 
          !(r.fromUserId === fromUser?.id && r.toUserId === toUser?.id) &&
          !(r.fromUserId === toUser?.id && r.toUserId === fromUser?.id)
      ));
    } else {
      // Just remove this one request
      setPairingRequests(pairingRequests.filter(r => r.id !== requestId));
    }
    setIsPairingModalOpen(false);
  };

  const handleUnpair = () => {
      if (!currentUser || !currentUser.pairedWith) return;
      const partnerId = currentUser.pairedWith;
      const updatedUsers = users.map(u => {
          if (u.id === currentUser.id || u.id === partnerId) {
              return { ...u, pairedWith: null };
          }
          return u;
      });
      setUsers(updatedUsers);
      setCurrentUser(updatedUsers.find(u => u.id === currentUser.id)!);
      setIsPairingModalOpen(false);
  };

  // Event & Routine Logic
  const handleAddEventClick = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEventClick = (event: Event) => {
    if (event.routineId) {
        addNotification({
            type: 'generic',
            title: 'Evento de Rutina',
            message: 'Para editar, gestiona la rutina que creó este evento.',
        })
        return;
    }
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };
  
  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...eventData, id: editingEvent.id } : e));
    } else {
      setEvents([...events, { ...eventData, id: generateId() }]);
    }
    handleCloseEventModal();
  };
  
  const handleDeleteEvent = (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if(eventToDelete?.routineId) {
        addNotification({
            type: 'generic',
            title: 'No se puede eliminar',
            message: 'Para eliminar este evento, elimina o edita la rutina asociada.',
        });
        return;
    }
    setEvents(events.filter(e => e.id !== eventId));
  };

  const handleOpenRoutineCreator = () => {
    setEditingRoutine(null);
    setIsRoutineManagerOpen(false);
    setIsRoutineModalOpen(true);
  };

  const handleOpenRoutineEditor = (routine: Routine) => {
    setEditingRoutine(routine);
    setIsRoutineManagerOpen(false);
    setIsRoutineModalOpen(true);
  };

  const handleSaveRoutine = (routineData: Omit<Routine, 'id'>, id?: string) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    let routineToSave: Routine;
    
    // Update logic
    if (id) {
        routineToSave = { ...routineData, id };
        setEvents(prevEvents => {
            // Remove future events associated with this routine before regenerating
            return prevEvents.filter(event => {
                if (event.routineId === id) {
                    const eventDate = new Date(event.date + 'T00:00:00Z');
                    return eventDate < today;
                }
                return true;
            });
        });
        setRoutines(prev => prev.map(r => r.id === id ? routineToSave : r));
    } else { // Create logic
        routineToSave = { ...routineData, id: generateId() };
        setRoutines(prev => [...prev, routineToSave]);
    }
    
    // Generate events
    const newEvents: Event[] = [];
    const startDate = new Date(routineToSave.startDate + 'T00:00:00Z');
    const endDate = new Date(routineToSave.endDate + 'T00:00:00Z');
    
    // For updates, only generate events from today onwards
    let loopStartDate = id ? (startDate > today ? startDate : today) : startDate;

    for (let d = new Date(loopStartDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
        let shouldCreateEvent = false;
        if (routineToSave.frequency === 'weekly') {
            if (routineToSave.daysOfWeek?.includes(d.getUTCDay())) {
                shouldCreateEvent = true;
            }
        } else if (routineToSave.frequency === 'monthly') {
            if (routineToSave.dayOfMonth === d.getUTCDate()) {
                shouldCreateEvent = true;
            }
        }

        if (shouldCreateEvent) {
            newEvents.push({
                id: generateId(),
                routineId: routineToSave.id,
                title: routineToSave.title,
                date: d.toISOString().split('T')[0],
                time: routineToSave.time,
                description: routineToSave.description,
                category: routineToSave.category,
                reminder: routineToSave.reminder,
                whatsappReminder: routineToSave.whatsappReminder,
                whatsappNumber: routineToSave.whatsappNumber,
                whatsappMessage: routineToSave.whatsappMessage,
                color: routineToSave.color,
            });
        }
    }

    setEvents(prevEvents => [...prevEvents, ...newEvents]);
    
    setIsRoutineModalOpen(false);
    setEditingRoutine(null);
  };

  const handleDeleteRoutine = (routineId: string) => {
    if (window.confirm('¿Estás seguro? Se eliminará la rutina y todos sus eventos futuros.')) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        setRoutines(prev => prev.filter(r => r.id !== routineId));
        setEvents(prev => prev.filter(e => {
            if (e.routineId === routineId) {
                const eventDate = new Date(e.date + 'T00:00:00Z');
                return eventDate < today;
            }
            return true;
        }));
    }
  };


  const handleSaveJournal = (entryToSave: JournalEntry) => {
    setJournalEntries(prev => {
        const entryIndex = prev.findIndex(e => e.date === entryToSave.date);
        if (entryIndex > -1) {
            const updatedEntries = [...prev];
            updatedEntries[entryIndex] = entryToSave;
            return updatedEntries;
        } else {
            return [...prev, entryToSave];
        }
    });
  };

  // Goal Logic
  const handleAddGoal = (text: string, period: 'weekly' | 'monthly' | 'annual') => {
    const newGoal: Goal = { id: generateId(), text, completed: false };
    if (period === 'weekly') {
      setWeeklyGoals(prev => [...prev, newGoal]);
    } else if (period === 'monthly') {
      setMonthlyGoals(prev => [...prev, newGoal]);
    } else {
      setAnnualGoals(prev => [...prev, newGoal]);
    }
  };

  const handleToggleGoal = (id: string, period: 'weekly' | 'monthly' | 'annual') => {
    const updater = (goals: Goal[]) => goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    if (period === 'weekly') {
      setWeeklyGoals(updater);
    } else if (period === 'monthly') {
      setMonthlyGoals(updater);
    } else {
      setAnnualGoals(updater);
    }
  };

  const handleDeleteGoal = (id: string, period: 'weekly' | 'monthly' | 'annual') => {
    const updater = (goals: Goal[]) => goals.filter(g => g.id !== id);
    if (period === 'weekly') {
      setWeeklyGoals(updater);
    } else if (period === 'monthly') {
      setMonthlyGoals(updater);
    } else {
      setAnnualGoals(updater);
    }
  };

   // Trip Logic
    const handleSaveTrip = (tripToSave: Trip) => {
        setTrips(prev => {
            const tripIndex = prev.findIndex(t => t.id === tripToSave.id);
            if (tripIndex > -1) {
                const updatedTrips = [...prev];
                updatedTrips[tripIndex] = tripToSave;
                return updatedTrips;
            } else {
                return [...prev, { ...tripToSave, id: generateId() }];
            }
        });
    };

    const handleDeleteTrip = (tripId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este viaje y todos sus recuerdos?')) {
            setTrips(prev => prev.filter(t => t.id !== tripId));
        }
    };


  // Notification Logic
  const addNotification = useCallback((data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (isNotificationsMuted && data.type !== 'generic') return;

    const newNotification: Notification = {
      ...data,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    // Add to persistent notifications list
    if(data.type !== 'generic') {
        setNotifications(prev => [newNotification, ...prev]);
    }

    // Add to temporary toast notifications list
    setToastNotifications(prev => [...prev, newNotification]);

  }, [isNotificationsMuted, setNotifications]);

  const handleMarkAsRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const handleMarkAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Effect for event reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const todayString = now.toISOString().split('T')[0];
      const currentTimeString = now.toTimeString().substring(0, 5); // HH:MM

      events.forEach(event => {
        if (event.date === todayString && event.time === currentTimeString) {
          const reminderAlreadySent = notifications.some(n => n.relatedId === event.id && n.type === 'event_reminder');
          if (reminderAlreadySent) return;

          // In-app notification
          if (event.reminder) {
            addNotification({
              type: 'event_reminder',
              title: `Recordatorio: ${event.title}`, 
              message: `Tu evento "${event.title}" está programado para ahora.`,
              relatedId: event.id
            });
          }

          // WhatsApp notification
          if (event.whatsappReminder && event.whatsappNumber && !notifiedWhatsappEvents.includes(event.id)) {
            const message = event.whatsappMessage || `¡Recordatorio para tu evento: ${event.title}!`;
            const encodedMessage = encodeURIComponent(message);
            const phoneNumber = event.whatsappNumber.replace(/\D/g, ''); // Remove non-numeric characters
            const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            
             const toast: Notification = {
                id: generateId(),
                type: 'generic',
                title: 'Recordatorio de WhatsApp',
                message: `Es hora de enviar el recordatorio para tu evento "${event.title}".`,
                timestamp: new Date().toISOString(),
                read: false,
                action: {
                    label: 'Enviar por WhatsApp',
                    callback: () => window.open(url, '_blank'),
                }
            };
            setToastNotifications(prev => [...prev, toast]);
            setNotifiedWhatsappEvents(prev => [...prev, event.id]);
          }
        }
      });
    };
    const intervalId = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, [events, notifications, notifiedWhatsappEvents, setNotifiedWhatsappEvents, addNotification]);
  
  // Effect for incoming pairing requests
  useEffect(() => {
      if (!currentUser) return;
      const incoming = pairingRequests.filter(r => r.toUserId === currentUser.id && r.status === 'pending');
      incoming.forEach(req => {
          const alreadyNotified = notifications.some(n => n.relatedId === req.id && n.type === 'pairing_request');
          if (!alreadyNotified) {
              const fromUser = users.find(u => u.id === req.fromUserId);
              addNotification({
                  type: 'pairing_request',
                  title: 'Nueva Solicitud de Conexión',
                  message: `${fromUser?.name || 'Alguien'} quiere conectar contigo.`,
                  relatedId: req.id,
              });
          }
      });
  }, [pairingRequests, currentUser, users, notifications, addNotification]);

  // Effects for partner activity
  const lastSeenPartnerMessageTimestamp = useRef<string | null>(null);
  const lastSeenPartnerEmotionTimestamp = useRef<string | null>(null);

  useEffect(() => {
    if (pairedUser) {
        const latestMessage = [...sharedMessages].filter(m => m.userId === pairedUser.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        lastSeenPartnerMessageTimestamp.current = latestMessage?.timestamp || null;
        const latestEmotion = [...emotionLogs].filter(e => e.userId === pairedUser.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        lastSeenPartnerEmotionTimestamp.current = latestEmotion?.timestamp || null;
    }
  }, [pairedUser, sharedMessages, emotionLogs]);

  useEffect(() => {
    if (!pairedUser) return;
    const latestPartnerMessage = [...sharedMessages].filter(m => m.userId === pairedUser.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if (latestPartnerMessage && latestPartnerMessage.timestamp !== lastSeenPartnerMessageTimestamp.current) {
        if (lastSeenPartnerMessageTimestamp.current !== null) { // Don't notify on initial load
            addNotification({ type: 'new_message', title: 'Nuevo Mensaje', message: `Has recibido un mensaje de ${latestPartnerMessage.userName}.` });
        }
        lastSeenPartnerMessageTimestamp.current = latestPartnerMessage.timestamp;
    }
  }, [sharedMessages, pairedUser, addNotification]);

  useEffect(() => {
    if (!pairedUser) return;
    const latestPartnerEmotion = [...emotionLogs].filter(e => e.userId === pairedUser.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if (latestPartnerEmotion && latestPartnerEmotion.timestamp !== lastSeenPartnerEmotionTimestamp.current) {
        if (lastSeenPartnerEmotionTimestamp.current !== null) { // Don't notify on initial load
            addNotification({ type: 'new_emotion', title: 'Nueva Emoción Compartida', message: `${latestPartnerEmotion.userName} ha compartido cómo se siente.` });
        }
        lastSeenPartnerEmotionTimestamp.current = latestPartnerEmotion.timestamp;
    }
  }, [emotionLogs, pairedUser, addNotification]);


  if (!currentUser) {
    return <UserAuth users={users} onLogin={handleLogin} onCreateUser={handleCreateUser} />;
  }

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const currentJournalEntry = journalEntries.find(e => e.date === selectedDateString);

  return (
    <>
      <NotificationHost toastNotifications={toastNotifications} setToastNotifications={setToastNotifications} />
      <div className="bg-slate-50 min-h-screen font-sans">
        <div>
            <Header 
              user={currentUser}
              onLogout={handleLogout}
              onManagePairing={() => setIsPairingModalOpen(true)}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              isMuted={isNotificationsMuted}
              onToggleMute={() => setIsNotificationsMuted(prev => !prev)}
              onNavigateToPlanner={() => setActiveSection('planner')}
              onNavigateToTravelLog={() => setActiveSection('travel')}
              activeSection={activeSection}
            />
        </div>
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {activeSection === 'planner' && (
                <>
                    {pairedUser && (
                        <div className="mb-6 border-b border-slate-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setMainView(MainView.Personal)}
                                className={`${
                                mainView === MainView.Personal
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Planificador Personal
                            </button>
                            <button
                                onClick={() => setMainView(MainView.Couple)}
                                className={`${
                                mainView === MainView.Couple
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Espacio de Conexiones
                            </button>
                            </nav>
                        </div>
                    )}
                
                    {mainView === MainView.Personal || !pairedUser ? (
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                            {/* Columna Principal */}
                            <div className="xl:col-span-3 space-y-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <SchedulePanel
                                    selectedDate={selectedDate}
                                    events={events}
                                    onAddEvent={handleAddEventClick}
                                    onEditEvent={handleEditEventClick}
                                    onDeleteEvent={handleDeleteEvent}
                                    onManageRoutines={() => setIsRoutineManagerOpen(true)}
                                    />
                                </div>
                                <DailyReflection 
                                    journalEntries={journalEntries}
                                    currentJournalEntry={currentJournalEntry}
                                    selectedDate={selectedDate}
                                    onSave={handleSaveJournal}
                                    onOpenHistory={() => setIsReflectionLogModalOpen(true)}
                                />
                                {pairedUser && (
                                    <PartnerNotes 
                                    partner={pairedUser} 
                                    emotion={latestPartnerEmotion} 
                                    message={latestPartnerMessage} 
                                    />
                                )}
                            </div>

                            {/* Columna Lateral */}
                            <div className="xl:col-span-2 space-y-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <Calendar
                                    currentDate={currentDate}
                                    setCurrentDate={setCurrentDate}
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                    events={events}
                                    onOpenPrintView={() => setIsPrintViewOpen(true)}
                                    />
                                </div>
                                <GoalsPanel 
                                    weeklyGoals={weeklyGoals}
                                    monthlyGoals={monthlyGoals}
                                    annualGoals={annualGoals}
                                    onAddGoal={handleAddGoal}
                                    onToggleGoal={handleToggleGoal}
                                    onDeleteGoal={handleDeleteGoal}
                                />
                            </div>
                        </div>
                    ) : null}

                    {mainView === MainView.Couple && pairedUser && coupleId && (
                        <CoupleSpace 
                            currentUser={currentUser} 
                            partner={pairedUser} 
                            coupleId={coupleId}
                            messages={sharedMessages}
                            setMessages={setSharedMessages}
                            emotions={emotionLogs}
                            setEmotions={setEmotionLogs}
                            onOpenEmotionHistory={() => setIsEmotionLogModalOpen(true)}
                        />
                    )}
                </>
            )}

            {activeSection === 'travel' && (
              <TravelLog
                trips={trips}
                onSaveTrip={handleSaveTrip}
                onDeleteTrip={handleDeleteTrip}
              />
           )}
        </main>
      </div>

      <PrintableView 
        isOpen={isPrintViewOpen}
        onClose={() => setIsPrintViewOpen(false)}
        events={events}
        initialDate={currentDate}
      />

      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={handleCloseEventModal}
        onSave={handleSaveEvent}
        event={editingEvent}
        selectedDate={selectedDate}
      />
      <RoutineFormModal
          isOpen={isRoutineModalOpen}
          onClose={() => {
            setIsRoutineModalOpen(false);
            setEditingRoutine(null);
          }}
          onSave={handleSaveRoutine}
          routineToEdit={editingRoutine}
      />
       <RoutineManagerModal
        isOpen={isRoutineManagerOpen}
        onClose={() => setIsRoutineManagerOpen(false)}
        routines={routines}
        onCreate={handleOpenRoutineCreator}
        onEdit={handleOpenRoutineEditor}
        onDelete={handleDeleteRoutine}
      />
      <PairingManager 
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
        currentUser={currentUser}
        pairedUser={pairedUser}
        users={users}
        requests={pairingRequests}
        onSendRequest={handleSendRequest}
        onRespondToRequest={handleRespondToRequest}
        onUnpair={handleUnpair}
      />
      <EmotionLogModal 
        isOpen={isEmotionLogModalOpen}
        onClose={() => setIsEmotionLogModalOpen(false)}
        emotions={emotionLogs}
      />
      <ReflectionLogModal 
        isOpen={isReflectionLogModalOpen}
        onClose={() => setIsReflectionLogModalOpen(false)}
        journalEntries={journalEntries}
      />
    </>
  );
}

export default App;