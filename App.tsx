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
import { ShareReflectionModal } from './components/ShareReflectionModal';
import { ShareTripModal } from './components/ShareTripModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Event, Notification, User, PairingRequest, SharedEmotionState, JournalEntry, Routine, Project, Task, Trip, EmotionMoji, QASession, PartnerNote, TaskStatus, ShoppingList, ShoppingListItem } from './types';
import { v4 as uuidv4 } from 'uuid';
import { ReflectionLogModal } from './components/ReflectionLogModal';
import { EmotionLogModal } from './components/EmotionLogModal';
import { RoutineManagerModal } from './components/RoutineManagerModal';
import { PrintableView } from './components/PrintableView';
import { GoalsPanel } from './components/GoalsPanel';
import { useSystemNotifications } from './hooks/useSystemNotifications';
import { ProjectFormModal } from './components/AmbitionFormModal';
import { GoalsSummary } from './components/GoalsSummary';
import { HomePanel } from './components/HomePanel';
import { HomeSummary } from './components/HomeSummary';
import { SplashScreen } from './components/SplashScreen';

const EXAMPLE_USERS: User[] = [
  { id: 'user-1', name: 'Vicki', pairedWith: null },
  { id: 'user-2', name: 'Lucas', pairedWith: null },
];

// Reusable PIN Input component, also used in PinManagementModal
const PinInput: React.FC<{ length: number; value: string; onChange: (pin: string) => void; error?: boolean; }> = ({ length, value, onChange, error }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pinArray = value.split('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value;
    if (/^[0-9]$/.test(inputValue) || inputValue === '') {
      const newPinArray = [...pinArray];
      while (newPinArray.length < length) newPinArray.push('');
      
      newPinArray[index] = inputValue;
      const newPin = newPinArray.slice(0, length).join('');
      onChange(newPin);

      if (inputValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pinArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  return (
    <div className={`flex justify-center gap-2 sm:gap-3 ${error ? 'animate-shake' : ''}`}>
        <style>{`
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
            .animate-shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both; }
        `}</style>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          // FIX: Changed ref callback to use a block body `{}` instead of a concise body `()`. The ref callback should not return a value, but an assignment expression returns the assigned value. Using a block body ensures an implicit `undefined` return.
          ref={(el) => {inputRefs.current[index] = el;}}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={pinArray[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold border-2 border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
        />
      ))}
    </div>
  );
};


const PinManagementModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (newPin: string) => void;
    currentUser: User;
}> = ({ isOpen, onClose, onSave, currentUser }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [error, setError] = useState('');

  const resetState = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmNewPin('');
    setError('');
  };
  
  const handleClose = () => {
      resetState();
      onClose();
  }

  const handleSubmit = () => {
      setError('');
      if (currentUser.pin && currentPin !== currentUser.pin) {
          setError('El PIN actual es incorrecto.');
          return;
      }
      if (newPin.length !== 4) {
          setError('El nuevo PIN debe tener 4 dígitos.');
          return;
      }
      if (newPin !== confirmNewPin) {
          setError('Los nuevos PIN no coinciden.');
          return;
      }
      onSave(newPin);
      resetState();
  }
  
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-zinc-800 mb-6 text-center">Cambiar PIN</h2>
        <div className="space-y-6">
            {currentUser.pin && (
                <div>
                    <label className="block text-center text-sm font-medium text-zinc-700 mb-2">PIN Actual</label>
                    <PinInput length={4} value={currentPin} onChange={setCurrentPin} />
                </div>
            )}
            <div>
                <label className="block text-center text-sm font-medium text-zinc-700 mb-2">Nuevo PIN</label>
                <PinInput length={4} value={newPin} onChange={setNewPin} />
            </div>
             <div>
                <label className="block text-center text-sm font-medium text-zinc-700 mb-2">Confirmar Nuevo PIN</label>
                <PinInput length={4} value={confirmNewPin} onChange={setConfirmNewPin} />
            </div>
        </div>
        {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}
        <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-zinc-200">
            <button type="button" onClick={handleClose}
                className="px-4 py-2 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                Cancelar
            </button>
            <button type="button" onClick={handleSubmit}
                className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-teal-700">
                Guardar Cambios
            </button>
        </div>
      </div>
    </div>
  );
};


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
        completed: false,
    },
    {
        id: 'event-dentist-2',
        title: 'Cita con el dentista',
        date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0], // 10 days from now
        time: '15:00',
        category: 'otro',
        reminder: true,
        color: '#64748B', // slate-500
        completed: false,
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
        completed: false,
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
        completed: false,
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
        completed: false,
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
        completed: false,
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
        completed: false,
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
            { id: 'h-1-1', date: '2024-01-16', title: 'Cerro Campanario', description: 'Vistas panorámicas de 360 grados de los lagos y montañas. Impresionante.', emotion: '🤩' },
            { id: 'h-1-2', date: '2024-01-18', title: 'Circuito Chico', description: 'Recorrido en coche por los lugares más icónicos, con paradas en miradores.', emotion: '😊' },
            { id: 'h-1-3', date: '2024-01-20', title: 'Caminata a Refugio Frey', description: 'Un trekking desafiante pero con una recompensa increíble al llegar a la laguna y el refugio.', emotion: '😌' },
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
             { id: 'h-2-1', date: '2024-05-11', title: 'El Coliseo', description: 'Visita al amanecer para evitar las multitudes. Se sentía la historia en el aire.', emotion: '🤩' },
             { id: 'h-2-2', date: '2024-05-13', title: 'El Vaticano', description: 'La Basílica de San Pedro y los Museos Vaticanos. La Capilla Sixtina es indescriptible.', emotion: '❤️' },
        ],
    }
];

const EXAMPLE_JOURNAL_ENTRIES_DATA: JournalEntry[] = [
    {
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        positiveThought: 'Hoy doy gracias por la conversación que tuve con un viejo amigo. Me hizo darme cuenta de lo importante que es mantener esas conexiones.',
        lessonLearned: 'Aprendí que a veces, tomarse un descanso de 5 minutos puede cambiar completamente mi productividad por la tarde.',
        dayTitle: 'Una llamada que alegra el alma',
        emotionEmoji: '😊'
    },
    {
        date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], // 3 days ago
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        positiveThought: 'Logré terminar un proyecto en el que estaba atascado. La sensación de logro es increíble.',
        lessonLearned: 'La perseverancia realmente vale la pena. No rendirse ante el primer obstáculo es clave.',
        dayTitle: 'Día de romper barreras',
        emotionEmoji: '💪'
    },
     {
        date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], // A week ago
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
        positiveThought: 'Disfruté de una simple taza de café por la mañana, viendo el sol salir. Los pequeños momentos son los mejores.',
        lessonLearned: 'No necesito grandes eventos para sentirme feliz. La paz se encuentra en las pequeñas cosas cotidianas.',
        dayTitle: 'Calma matutina',
        emotionEmoji: '😌'
    }
];

const EXAMPLE_PROJECTS_DATA: Project[] = [
  { id: 'proj-1', title: 'Aprender a tocar la guitarra', description: 'Ser capaz de tocar mis 5 canciones favoritas para fin de año.', icon: '🎸', category: 'Creatividad' },
  { id: 'proj-2', title: 'Operación Maratón', description: 'Correr una maratón completa en menos de 4 horas.', icon: '🏃‍♂️', category: 'Salud', targetDate: '2024-11-25' },
];

const EXAMPLE_TASKS_DATA: Task[] = [
  // Guitar Project
  { id: 'task-1-1', projectId: 'proj-1', text: 'Comprar una guitarra acústica', status: 'done' },
  { id: 'task-1-2', projectId: 'proj-1', text: 'Aprender los 4 acordes básicos (G, C, D, Em)', status: 'inProgress' },
  { id: 'task-1-3', projectId: 'proj-1', text: 'Practicar cambios de acordes durante 15 min al día', status: 'todo' },
  // Marathon Project
  { id: 'task-2-1', projectId: 'proj-2', text: 'Investigar planes de entrenamiento', status: 'done' },
  { id: 'task-2-2', projectId: 'proj-2', text: 'Comprar zapatillas para correr adecuadas', status: 'done' },
  { id: 'task-2-3', projectId: 'proj-2', text: 'Correr 10km sin parar', status: 'inProgress' },
  { id: 'task-2-4', projectId: 'proj-2', text: 'Inscribirme a una media maratón', status: 'todo' },
];

const EXAMPLE_SHOPPING_LISTS_DATA: ShoppingList[] = [
    {
        id: 'list-supermercado-1',
        title: 'Supermercado',
        icon: '🛒',
        items: [
            { id: 'item-1-1', text: 'Leche', completed: false },
            { id: 'item-1-2', text: 'Huevos', completed: true },
            { id: 'item-1-3', text: 'Pan', completed: false },
            { id: 'item-1-4', text: 'Pollo', completed: false },
        ]
    },
    {
        id: 'list-cuentas-2',
        title: 'Cuentas por Pagar',
        icon: '🧾',
        items: [
            { id: 'item-2-1', text: 'Pagar factura de luz', completed: false },
            { id: 'item-2-2', text: 'Pagar internet', completed: false },
            { id: 'item-2-3', text: 'Suscripción de música', completed: true },
        ]
    },
];


enum MainView {
  Personal = 'Personal',
  Couple = 'Pareja',
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
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
  const userProjectsKey = `projects_${currentUser?.id}`;
  const userTasksKey = `tasks_${currentUser?.id}`;
  const userTripsKey = `trips_${currentUser?.id}`;
  const userShoppingListsKey = `shopping_lists_${currentUser?.id}`;


  const [events, setEvents] = useLocalStorage<Event[]>(userEventsKey, EXAMPLE_EVENTS_DATA);
  const [routines, setRoutines] = useLocalStorage<Routine[]>(userRoutinesKey, EXAMPLE_ROUTINES_DATA);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>(userJournalsKey, EXAMPLE_JOURNAL_ENTRIES_DATA);
  const [projects, setProjects] = useLocalStorage<Project[]>(userProjectsKey, EXAMPLE_PROJECTS_DATA);
  const [tasks, setTasks] = useLocalStorage<Task[]>(userTasksKey, EXAMPLE_TASKS_DATA);
  const [trips, setTrips] = useLocalStorage<Trip[]>(userTripsKey, EXAMPLE_TRIPS_DATA);
  const [shoppingLists, setShoppingLists] = useLocalStorage<ShoppingList[]>(userShoppingListsKey, EXAMPLE_SHOPPING_LISTS_DATA);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isRoutineManagerOpen, setIsRoutineManagerOpen] = useState(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [isReflectionLogModalOpen, setIsReflectionLogModalOpen] = useState(false);
  const [isEmotionLogModalOpen, setIsEmotionLogModalOpen] = useState(false);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isShareReflectionModalOpen, setIsShareReflectionModalOpen] = useState(false);
  const [isShareTripModalOpen, setIsShareTripModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [reflectionToShare, setReflectionToShare] = useState<JournalEntry | null>(null);
  const [tripToShare, setTripToShare] = useState<Trip | null>(null);


  // Notification states
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>(userNotificationsKey, []);
  const [isNotificationsMuted, setIsNotificationsMuted] = useLocalStorage<boolean>('notifications_muted', false);
  const { sendSystemNotification } = useSystemNotifications();

  const [notifiedEvents, setNotifiedEvents] = useLocalStorage<string[]>(`notified_events_${currentUser?.id}`, []);
  const [lastReflectionPromptDate, setLastReflectionPromptDate] = useLocalStorage<string>(`last_reflection_prompt_${currentUser?.id}`, '');
  
  // Navigation states
  const [activeSection, setActiveSection] = useState<'planner' | 'travel' | 'goals' | 'home'>('planner');
  const [mainView, setMainView] = useState<MainView>(MainView.Personal);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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

  const [qaSessions, setQaSessions] = useLocalStorage<QASession[]>(`qa_sessions_${coupleId}`, []);
  const [partnerNotes, setPartnerNotes] = useLocalStorage<PartnerNote[]>(`partner_notes_${coupleId}`, []);
  const [sharedEmotionStates, setSharedEmotionStates] = useLocalStorage<SharedEmotionState[]>(`shared_emotions_${coupleId}`, []);
  

  // Reset planner state on user change
  useEffect(() => {
    if (!currentUser) {
      setEvents([]);
      setRoutines([]);
      setJournalEntries([]);
      setNotifications([]);
      setToastNotifications([]);
      setNotifiedEvents([]);
      setProjects([]);
      setTasks([]);
      setTrips([]);
      setShoppingLists([]);
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
        
        const newJournalEntriesKey = `journal_entries_${currentUser.id}`;
        const storedJournalEntries = localStorage.getItem(newJournalEntriesKey);
        setJournalEntries(storedJournalEntries ? JSON.parse(storedJournalEntries) : EXAMPLE_JOURNAL_ENTRIES_DATA);

        const newTripsKey = `trips_${currentUser.id}`;
        const storedTrips = localStorage.getItem(newTripsKey);
        setTrips(storedTrips ? JSON.parse(storedTrips) : EXAMPLE_TRIPS_DATA);
        
        const newProjectsKey = `projects_${currentUser.id}`;
        const storedProjects = localStorage.getItem(newProjectsKey);
        setProjects(storedProjects ? JSON.parse(storedProjects) : EXAMPLE_PROJECTS_DATA);
        
        const newTasksKey = `tasks_${currentUser.id}`;
        const storedTasks = localStorage.getItem(newTasksKey);
        setTasks(storedTasks ? JSON.parse(storedTasks) : EXAMPLE_TASKS_DATA);

        const newShoppingListsKey = `shopping_lists_${currentUser.id}`;
        const storedShoppingLists = localStorage.getItem(newShoppingListsKey);
        setShoppingLists(storedShoppingLists ? JSON.parse(storedShoppingLists) : EXAMPLE_SHOPPING_LISTS_DATA);
    }
  }, [currentUser, setEvents, setRoutines, setJournalEntries, setNotifications, setNotifiedEvents, setProjects, setTasks, setTrips, setShoppingLists]);

  const generateId = () => uuidv4();

  // User and Pairing Logic
  const handleLogin = (userId: string, pin: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;

    // If user has no pin, this is the first login, set the pin
    if (!user.pin) {
        const updatedUsers = users.map(u => u.id === userId ? { ...u, pin } : u);
        setUsers(updatedUsers);
        setCurrentUser({ ...user, pin });
        return true;
    }

    // Check pin if it exists
    if (user.pin === pin) {
      setCurrentUser(user);
      return true;
    }

    return false; // Pin incorrect
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const handleCreateUser = (name: string): User => {
    const newUser: User = { id: generateId(), name, pairedWith: null };
    setUsers(prevUsers => [...prevUsers, newUser]);
    // Do not log in here. Let UserAuth handle the transition to PIN setup.
    return newUser;
  };

  const handleSavePin = (newPin: string) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, pin: newPin } : u);
    setUsers(updatedUsers);
    setCurrentUser(prev => prev ? { ...prev, pin: newPin } : null);
    setIsPinModalOpen(false);
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
      setEvents([...events, { ...eventData, id: generateId(), completed: false }]);
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
  
  const handleToggleEventCompletion = (eventId: string) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, completed: !e.completed } : e
    ));
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
                color: routineToSave.color,
                completed: false,
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

  // Reflection & Sharing Logic
  const handleSaveJournal = (entryToSave: Omit<JournalEntry, 'timestamp'>) => {
    const entryWithTimestamp: JournalEntry = {
        ...entryToSave,
        timestamp: new Date().toISOString(),
    };
    setJournalEntries(prev => {
        const entryIndex = prev.findIndex(e => e.date === entryToSave.date);
        if (entryIndex > -1) {
            const updatedEntries = [...prev];
            updatedEntries[entryIndex] = entryWithTimestamp;
            return updatedEntries;
        } else {
            return [...prev, entryWithTimestamp];
        }
    });
  };

  const handleOpenShareModal = (entry: JournalEntry) => {
    setReflectionToShare(entry);
    setIsShareReflectionModalOpen(true);
  };
  
  const handleShareReflection = () => {
    if (!reflectionToShare || !currentUser) return;
    
    const { timestamp, ...reflectionContent } = reflectionToShare;
    
    const note: PartnerNote = {
      id: generateId(),
      authorId: currentUser.id,
      text: `${currentUser.name} ha compartido su reflexión.`,
      timestamp: new Date().toISOString(),
      type: 'reflection',
      reflectionContent: reflectionContent,
    };
    
    setPartnerNotes(prev => [...prev, note]);
    setIsShareReflectionModalOpen(false);
  };

  const handleOpenShareTripModal = (trip: Trip) => {
    setTripToShare(trip);
    setIsShareTripModalOpen(true);
  };
  
  const handleShareTrip = () => {
    if (!tripToShare || !currentUser) return;
    
    const { id, ...tripContent } = tripToShare;
    
    const note: PartnerNote = {
      id: generateId(),
      authorId: currentUser.id,
      text: `${currentUser.name} ha compartido un viaje.`,
      timestamp: new Date().toISOString(),
      type: 'trip',
      tripContent: tripContent,
    };
    
    setPartnerNotes(prev => [...prev, note]);
    setIsShareTripModalOpen(false);
  };

  // Project & Task Logic
  const handleOpenProjectCreator = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenProjectEditor = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (projectData: Omit<Project, 'id'>, id?: string) => {
    if (id) {
        setProjects(prev => prev.map(p => p.id === id ? { ...projectData, id } : p));
    } else {
        setProjects(prev => [...prev, { ...projectData, id: generateId() }]);
    }
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };
  
  const handleDeleteProject = (projectId: string) => {
      if (window.confirm('¿Estás seguro? Esto eliminará el proyecto y todas sus tareas.')) {
          setProjects(prev => prev.filter(p => p.id !== projectId));
          setTasks(prev => prev.filter(t => t.projectId !== projectId));
      }
  };

  const handleAddTask = (projectId: string, text: string) => {
      const newTask: Task = {
          id: generateId(),
          projectId,
          text,
          status: 'todo',
      };
      setTasks(prev => [...prev, newTask]);
  };
  
  const handleUpdateTask = (taskId: string, newStatus: TaskStatus, newText?: string) => {
      setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
              return { ...t, status: newStatus, text: newText ?? t.text };
          }
          return t;
      }));
  };
  
  const handleDeleteTask = (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
  };
  
  const handleAddMultipleTasks = (projectId: string, taskTexts: string[]) => {
    const newTasks: Task[] = taskTexts.map(text => ({
        id: generateId(),
        projectId,
        text,
        status: 'todo',
    }));
    setTasks(prev => [...prev, ...newTasks]);
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

    // Home / Shopping List Logic
    const handleSaveShoppingList = (title: string, icon: string, id?: string) => {
        if (id) {
            setShoppingLists(prev => prev.map(list => list.id === id ? { ...list, title, icon } : list));
        } else {
            const newList: ShoppingList = { id: generateId(), title, icon, items: [] };
            setShoppingLists(prev => [...prev, newList]);
        }
    };

    const handleDeleteShoppingList = (listId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta lista y todos sus elementos?')) {
            setShoppingLists(prev => prev.filter(list => list.id !== listId));
        }
    };

    const handleAddShoppingListItem = (listId: string, text: string) => {
        const newItem: ShoppingListItem = { id: generateId(), text, completed: false };
        setShoppingLists(prev => prev.map(list => 
            list.id === listId ? { ...list, items: [...list.items, newItem] } : list
        ));
    };

    const handleUpdateShoppingListItem = (listId: string, itemId: string, newText: string, newCompleted: boolean) => {
        setShoppingLists(prev => prev.map(list => {
            if (list.id === listId) {
                return {
                    ...list,
                    items: list.items.map(item => 
                        item.id === itemId ? { ...item, text: newText, completed: newCompleted } : item
                    )
                };
            }
            return list;
        }));
    };
    
    const handleDeleteShoppingListItem = (listId: string, itemId: string) => {
        setShoppingLists(prev => prev.map(list => 
            list.id === listId ? { ...list, items: list.items.filter(item => item.id !== itemId) } : list
        ));
    };


  // Notification Logic
  const handleMarkAsRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const handleMarkAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = useCallback((notification: Notification) => {
    window.focus(); // Bring window to front
    
    switch (notification.type) {
      case 'event_reminder':
        if (notification.relatedId) {
          const event = events.find(e => e.id === notification.relatedId);
          if (event) {
            setActiveSection('planner');
            setMainView(MainView.Personal);
            // Use UTC to prevent timezone issues with date selection
            setSelectedDate(new Date(event.date + 'T00:00:00Z'));
          }
        }
        break;
      case 'daily_reflection_prompt':
        setActiveSection('planner');
        setMainView(MainView.Personal);
        setSelectedDate(new Date()); // Today
        break;
      case 'pairing_request':
      case 'new_partner_note':
      case 'new_shared_reflection':
      case 'new_shared_emotion':
      case 'new_shared_trip':
         if (pairedUser) {
           setActiveSection('planner');
           setMainView(MainView.Couple);
         } else {
           setIsPairingModalOpen(true);
         }
         break;
       case 'new_qa_question':
         setActiveSection('planner');
         setMainView(MainView.Couple);
         break;
    }
    
    handleMarkAsRead(notification.id);
    // Close modals if any are open to show the target view
    setIsNotificationsMuted(false); // Assume interaction means user wants notifications
  }, [events, pairedUser]);

  const addNotification = useCallback((data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (isNotificationsMuted && data.type !== 'generic') return;

    const newNotification: Notification = {
      ...data,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    if(data.type !== 'generic') {
        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    }

    setToastNotifications(prev => [...prev, newNotification]);
    
    // Send system notification with navigation capabilities
    if (data.type !== 'generic') {
      sendSystemNotification(newNotification.title, {
        body: newNotification.message,
        tag: newNotification.relatedId || newNotification.id,
      }, () => handleNotificationClick(newNotification));
    }

  }, [isNotificationsMuted, setNotifications, sendSystemNotification, handleNotificationClick]);


  // Effect for event reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);

      events.forEach(event => {
        if (event.reminder && !notifiedEvents.includes(event.id)) {
          const eventTime = new Date(`${event.date}T${event.time}:00`);
          
          if (eventTime <= fifteenMinutesFromNow && eventTime > now) {
            const minutesUntil = Math.round((eventTime.getTime() - now.getTime()) / 60000);
            addNotification({
                type: 'event_reminder',
                title: `Recordatorio: ${event.title}`,
                message: `Tu evento ${event.routineId ? '(de rutina) ' : ''}empieza en ${minutesUntil} minutos.`,
                relatedId: event.id,
                data: { date: event.date }
            });
            setNotifiedEvents(prev => [...prev, event.id]);
          }
        }
      });
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [events, notifiedEvents, addNotification, setNotifiedEvents]);
  
  // Effect for Daily Reflection Prompt
  useEffect(() => {
      const checkReflection = () => {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          
          if (now.getHours() === 20 && lastReflectionPromptDate !== todayStr) {
              const hasReflected = journalEntries.some(e => e.date === todayStr);
              if (!hasReflected) {
                  addNotification({
                      type: 'daily_reflection_prompt',
                      title: '¿Cómo fue tu día?',
                      message: 'Tómate un momento para tu reflexión diaria. Ayuda a despejar la mente.',
                      data: { date: todayStr }
                  });
                  setLastReflectionPromptDate(todayStr);
              }
          }
      };
      const intervalId = setInterval(checkReflection, 1000 * 60 * 30); // Check every 30 mins
      return () => clearInterval(intervalId);
  }, [journalEntries, lastReflectionPromptDate, addNotification, setLastReflectionPromptDate]);
  
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
  const lastSeenPartnerNoteTimestamp = useRef<string | null>(null);
  const lastSeenPartnerEmotionDate = useRef<string | null>(null);
  const lastSeenQASessionId = useRef<string | null>(null);

  useEffect(() => {
    if (pairedUser) {
        const latestNote = [...partnerNotes].filter(n => n.authorId === pairedUser.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        lastSeenPartnerNoteTimestamp.current = latestNote?.timestamp || null;
        
        const latestEmotion = [...sharedEmotionStates].filter(s => s.emotions[pairedUser.id]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        lastSeenPartnerEmotionDate.current = latestEmotion?.date || null;
        
        const latestQA = [...qaSessions].filter(s => s.askerId === pairedUser.id).sort((a,b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime())[0];
        lastSeenQASessionId.current = latestQA?.id || null;
    }
  }, [pairedUser, partnerNotes, sharedEmotionStates, qaSessions]);

  useEffect(() => {
    if (!pairedUser) return;
    const latestPartnerNote = [...partnerNotes].filter(n => n.authorId === pairedUser.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if (latestPartnerNote && latestPartnerNote.timestamp !== lastSeenPartnerNoteTimestamp.current) {
        if (lastSeenPartnerNoteTimestamp.current !== null) { // Don't notify on initial load
            if (latestPartnerNote.type === 'reflection') {
                 addNotification({ type: 'new_shared_reflection', title: 'Nueva Reflexión', message: `${pairedUser.name} ha compartido una reflexión.` });
            } else if (latestPartnerNote.type === 'trip') {
                 addNotification({ type: 'new_shared_trip', title: 'Nuevo Viaje Compartido', message: `${pairedUser.name} ha compartido un viaje.` });
            } else {
                 addNotification({ type: 'new_partner_note', title: 'Nueva Nota', message: `${pairedUser.name} te ha dejado una nota.` });
            }
        }
        lastSeenPartnerNoteTimestamp.current = latestPartnerNote.timestamp;
    }
  }, [partnerNotes, pairedUser, addNotification]);

  useEffect(() => {
    if (!pairedUser) return;
    const latestPartnerEmotion = [...sharedEmotionStates].filter(s => s.emotions[pairedUser.id]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (latestPartnerEmotion && latestPartnerEmotion.date !== lastSeenPartnerEmotionDate.current) {
        if (lastSeenPartnerEmotionDate.current !== null) { // Don't notify on initial load
            addNotification({ type: 'new_shared_emotion', title: 'Nuevo Estado Emocional', message: `${pairedUser.name} ha compartido cómo se siente.` });
        }
        lastSeenPartnerEmotionDate.current = latestPartnerEmotion.date;
    }
  }, [sharedEmotionStates, pairedUser, addNotification]);
  
  useEffect(() => {
    if (!pairedUser) return;
    const latestPartnerQuestion = [...qaSessions].filter(s => s.askerId === pairedUser.id && !s.answer).sort((a,b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime())[0];
    if (latestPartnerQuestion && latestPartnerQuestion.id !== lastSeenQASessionId.current) {
        if (lastSeenQASessionId.current !== null) {
             addNotification({ type: 'new_qa_question', title: 'Nueva Pregunta', message: `${pairedUser.name} te ha hecho una pregunta.` });
        }
        lastSeenQASessionId.current = latestPartnerQuestion.id;
    }
  }, [qaSessions, pairedUser, addNotification]);

  const handleNavigateToCoupleSpace = () => {
    setActiveSection('planner');
    setMainView(MainView.Couple);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!currentUser) {
    return <UserAuth users={users} onLogin={handleLogin} onCreateUser={handleCreateUser} />;
  }

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const currentJournalEntry = journalEntries.find(e => e.date === selectedDateString);

  return (
    <>
      <NotificationHost toastNotifications={toastNotifications} setToastNotifications={setToastNotifications} />
      <div className="min-h-screen font-sans">
        <div>
            <Header 
              user={currentUser}
              onLogout={handleLogout}
              onManagePairing={() => setIsPairingModalOpen(true)}
              onManagePin={() => setIsPinModalOpen(true)}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onNotificationClick={handleNotificationClick}
              isMuted={isNotificationsMuted}
              onToggleMute={() => setIsNotificationsMuted(prev => !prev)}
              onNavigateToPlanner={() => setActiveSection('planner')}
              onNavigateToTravelLog={() => setActiveSection('travel')}
              onNavigateToGoals={() => setActiveSection('goals')}
              onNavigateToHome={() => setActiveSection('home')}
              activeSection={activeSection}
            />
        </div>
        <main className="max-w-7xl mx-auto p-2 sm:p-6 lg:p-8">
            {activeSection === 'planner' && (
                <>
                    {pairedUser && (
                        <div className="mb-6 border-b border-zinc-200">
                            <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setMainView(MainView.Personal)}
                                className={`${
                                mainView === MainView.Personal
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Planificador Personal
                            </button>
                            <button
                                onClick={() => setMainView(MainView.Couple)}
                                className={`${
                                mainView === MainView.Couple
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
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
                                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                                    <SchedulePanel
                                    selectedDate={selectedDate}
                                    events={events}
                                    onAddEvent={handleAddEventClick}
                                    onEditEvent={handleEditEventClick}
                                    onDeleteEvent={handleDeleteEvent}
                                    onManageRoutines={() => setIsRoutineManagerOpen(true)}
                                    onToggleEventCompletion={handleToggleEventCompletion}
                                    />
                                </div>
                                <DailyReflection 
                                    journalEntries={journalEntries}
                                    currentJournalEntry={currentJournalEntry}
                                    selectedDate={selectedDate}
                                    onSave={handleSaveJournal}
                                    onOpenHistory={() => setIsReflectionLogModalOpen(true)}
                                    onOpenShareModal={handleOpenShareModal}
                                    partner={pairedUser}
                                />
                                {pairedUser && (
                                    <PartnerNotes
                                        partner={pairedUser}
                                        partnerNotes={partnerNotes}
                                        sharedEmotionStates={sharedEmotionStates}
                                        onNavigate={handleNavigateToCoupleSpace}
                                    />
                                )}
                            </div>

                            {/* Columna Lateral */}
                            <div className="xl:col-span-2 space-y-8">
                                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                                    <Calendar
                                    currentDate={currentDate}
                                    setCurrentDate={setCurrentDate}
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                    events={events}
                                    onOpenPrintView={() => setIsPrintViewOpen(true)}
                                    />
                                </div>
                                 <HomeSummary
                                    shoppingLists={shoppingLists}
                                    onNavigate={() => setActiveSection('home')}
                                />
                                <GoalsSummary 
                                    projects={projects}
                                    tasks={tasks}
                                    onNavigate={() => setActiveSection('goals')}
                                />
                            </div>
                        </div>
                    ) : null}

                    {mainView === MainView.Couple && pairedUser && coupleId && (
                        <CoupleSpace 
                            currentUser={currentUser} 
                            partner={pairedUser} 
                            qaSessions={qaSessions}
                            setQaSessions={setQaSessions}
                            partnerNotes={partnerNotes}
                            setPartnerNotes={setPartnerNotes}
                            sharedEmotionStates={sharedEmotionStates}
                            setSharedEmotionStates={setSharedEmotionStates}
                            onOpenEmotionLog={() => setIsEmotionLogModalOpen(true)}
                        />
                    )}
                </>
            )}

            {activeSection === 'travel' && (
              <TravelLog
                trips={trips}
                onSaveTrip={handleSaveTrip}
                onDeleteTrip={handleDeleteTrip}
                pairedUser={pairedUser}
                onOpenShareModal={handleOpenShareTripModal}
              />
           )}

            {activeSection === 'goals' && (
              <GoalsPanel 
                projects={projects}
                tasks={tasks}
                onAddProject={handleOpenProjectCreator}
                onEditProject={handleOpenProjectEditor}
                onDeleteProject={handleDeleteProject}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddMultipleTasks={handleAddMultipleTasks}
              />
            )}
             {activeSection === 'home' && (
                <HomePanel
                    shoppingLists={shoppingLists}
                    onSaveList={handleSaveShoppingList}
                    onDeleteList={handleDeleteShoppingList}
                    onAddItem={handleAddShoppingListItem}
                    onUpdateItem={handleUpdateShoppingListItem}
                    onDeleteItem={handleDeleteShoppingListItem}
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
       <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        projectToEdit={editingProject}
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
      <ReflectionLogModal 
        isOpen={isReflectionLogModalOpen}
        onClose={() => setIsReflectionLogModalOpen(false)}
        journalEntries={journalEntries}
      />
      {pairedUser && (
        <EmotionLogModal
            isOpen={isEmotionLogModalOpen}
            onClose={() => setIsEmotionLogModalOpen(false)}
            sharedEmotionStates={sharedEmotionStates}
            currentUser={currentUser}
            partner={pairedUser}
        />
      )}
      <PinManagementModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSave={handleSavePin}
        currentUser={currentUser}
      />
       <ShareReflectionModal
        isOpen={isShareReflectionModalOpen}
        onClose={() => setIsShareReflectionModalOpen(false)}
        reflection={reflectionToShare}
        onShareWithPartner={handleShareReflection}
        partnerName={pairedUser?.name}
      />
       <ShareTripModal
        isOpen={isShareTripModalOpen}
        onClose={() => setIsShareTripModalOpen(false)}
        trip={tripToShare}
        onShareWithPartner={handleShareTrip}
        partnerName={pairedUser?.name}
      />
    </>
  );
}

export default App;