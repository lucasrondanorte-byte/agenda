// This is the main application component. It manages state and renders all other components.
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { app, db, auth } from "./firebaseConfig";
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
import type { Event, Notification, User, PairingRequest, SharedEmotionState, JournalEntry, Routine, Project, Task, Trip, EmotionMoji, QASession, PartnerNote, TaskStatus, ShoppingList, ShoppingListItem, Semester, Subject, Exam, SubjectStatus, AcademicSummaryData, TourStep, Idea, StickyNote } from './types';
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
import { AcademicPanel } from './components/AcademicPanel';
import { AcademicSummary } from './components/AcademicSummary';
import { SemesterFormModal } from './components/SemesterFormModal';
import { SubjectFormModal } from './components/SubjectFormModal';
import { ExamFormModal } from './components/ExamFormModal';
import { GradeEntryModal } from './components/GradeEntryModal';
import { ExamGradeModal } from './components/ExamGradeModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Tour } from './components/Tour';
import { IdeaBoard } from './components/IdeaBoard';
import { StickyNotesOverlay } from './components/StickyNotesOverlay';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvL0_g_lUcQ-XAyz23wwUP_Pr2IEujiYgZ_tE2OwlhZlg9i17zZZ6KeMbxOookAC8TDQ/exec';

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
        ownerId: 'user-1',
        isShared: false,
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
        ownerId: 'user-1',
        isShared: false,
        items: [
            { id: 'item-2-1', text: 'Pagar factura de luz', completed: false },
            { id: 'item-2-2', text: 'Pagar internet', completed: false },
            { id: 'item-2-3', text: 'Suscripción de música', completed: true },
        ]
    },
];

const EXAMPLE_SEMESTERS_DATA: Semester[] = [
    { id: 'sem-1', year: 2024, term: 'Primer Cuatrimestre', subjectIds: ['sub-1'] },
    { id: 'sem-2', year: 2023, term: 'Segundo Cuatrimestre', subjectIds: ['sub-2', 'sub-3'] },
];
const EXAMPLE_SUBJECTS_DATA: Subject[] = [
    { id: 'sub-1', name: 'Análisis Matemático II', status: 'cursando', finalGrade: null, prerequisiteIds: ['sub-2'] },
    { id: 'sub-2', name: 'Análisis Matemático I', status: 'aprobada', finalGrade: 8, prerequisiteIds: [] },
    { id: 'sub-3', name: 'Álgebra y Geometría Analítica', status: 'aprobada', finalGrade: 7, prerequisiteIds: [] },
    { id: 'sub-4', name: 'Física I', status: 'pendiente', finalGrade: null, prerequisiteIds: ['sub-2', 'sub-3'] },
];
const EXAMPLE_EXAMS_DATA: Exam[] = [
    { id: 'exam-1', subjectId: 'sub-1', type: 'parcial', title: 'Primer Parcial', date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0], time: '09:00', grade: null, topics: 'Integrales Dobles\nSeries de Fourier\nTransformada de Laplace' },
    { id: 'exam-2', subjectId: 'sub-2', type: 'final', title: 'Final', date: '2023-12-15', time: '14:00', grade: 8, topics: 'Límites y Continuidad\nDerivadas y Aplicaciones\nIntegrales Simples' },
];

const EXAMPLE_IDEAS_DATA: Idea[] = [
    {
        id: 'idea-1',
        content: 'Una app para conectar a dueños de perros en el parque.',
        color: '#FFFACD', // light yellow
        position: { x: 100, y: 50 },
        createdAt: new Date().toISOString(),
    },
    {
        id: 'idea-2',
        content: 'Escribir un libro de ciencia ficción sobre viajes en el tiempo.',
        color: '#D4F0F0', // light blue
        position: { x: 400, y: 150 },
        createdAt: new Date().toISOString(),
    },
     {
        id: 'idea-3',
        content: 'Podcast sobre historia de la tecnología.',
        color: '#E2F0D4', // light green
        position: { x: 200, y: 300 },
        createdAt: new Date().toISOString(),
    },
];


enum MainView {
  Personal = 'Personal',
  Couple = 'Pareja',
}

const GripVerticalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5.25H9.75M9 8.25H9.75M9 11.25H9.75M9 14.25H9.75M9 17.25H9.75M15 5.25H15.75M15 8.25H15.75M15 11.25H15.75M15 14.25H15.75M15 17.25H15.75" />
  </svg>
);

// FIX: Export the 'App' component as a default export to make it available for import in 'index.tsx'.
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
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
  const userIdeasKey = `ideas_${currentUser?.id}`;
  const userStickyNotesKey = `sticky_notes_${currentUser?.id}`;
  const userStickyNotesVisibleKey = `sticky_notes_visible_${currentUser?.id}`;
  const userSemestersKey = `semesters_${currentUser?.id}`;
  const userSubjectsKey = `subjects_${currentUser?.id}`;
  const userExamsKey = `exams_${currentUser?.id}`;
  const userSummaryOrderKey = `summary_order_${currentUser?.id}`;
  const userMainPanelOrderKey = `main_panel_order_${currentUser?.id}`;
  const userProcessedPartnerNotesKey = `processed_partner_notes_${currentUser?.id}`;


  const [events, setEvents] = useLocalStorage<Event[]>(userEventsKey, EXAMPLE_EVENTS_DATA);
  const [routines, setRoutines] = useLocalStorage<Routine[]>(userRoutinesKey, EXAMPLE_ROUTINES_DATA);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>(userJournalsKey, EXAMPLE_JOURNAL_ENTRIES_DATA);
  const [projects, setProjects] = useLocalStorage<Project[]>(userProjectsKey, EXAMPLE_PROJECTS_DATA);
  const [tasks, setTasks] = useLocalStorage<Task[]>(userTasksKey, EXAMPLE_TASKS_DATA);
  const [trips, setTrips] = useLocalStorage<Trip[]>(userTripsKey, EXAMPLE_TRIPS_DATA);
  const [ideas, setIdeas] = useLocalStorage<Idea[]>(userIdeasKey, EXAMPLE_IDEAS_DATA);
  const [stickyNotes, setStickyNotes] = useLocalStorage<StickyNote[]>(userStickyNotesKey, []);
  const [areStickyNotesVisible, setAreStickyNotesVisible] = useLocalStorage<boolean>(userStickyNotesVisibleKey, true);
  const [allShoppingLists, setAllShoppingLists] = useLocalStorage<ShoppingList[]>('all_shopping_lists', EXAMPLE_SHOPPING_LISTS_DATA);
  const [semesters, setSemesters] = useLocalStorage<Semester[]>(userSemestersKey, EXAMPLE_SEMESTERS_DATA);
  const [subjects, setSubjects] = useLocalStorage<Subject[]>(userSubjectsKey, EXAMPLE_SUBJECTS_DATA);
  const [exams, setExams] = useLocalStorage<Exam[]>(userExamsKey, EXAMPLE_EXAMS_DATA);

  const [processedPartnerNoteIds, setProcessedPartnerNoteIds] = useLocalStorage<string[]>(userProcessedPartnerNotesKey, []);
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
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isExamGradeModalOpen, setIsExamGradeModalOpen] = useState(false);
  const [confirmationState, setConfirmationState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; confirmText?: string; cancelText?: string; } | null>(null);


  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [reflectionToShare, setReflectionToShare] = useState<JournalEntry | null>(null);
  const [tripToShare, setTripToShare] = useState<Trip | null>(null);
  const [subjectForGrade, setSubjectForGrade] = useState<Subject | null>(null);
  const [examForGrade, setExamForGrade] = useState<Exam | null>(null);


  // Notification states
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>(userNotificationsKey, []);
  const [isNotificationsMuted, setIsNotificationsMuted] = useLocalStorage<boolean>('notifications_muted', false);
  const { sendSystemNotification } = useSystemNotifications();

  const [notifiedEvents, setNotifiedEvents] = useLocalStorage<string[]>(`notified_events_${currentUser?.id}`, []);
  const [lastReflectionPromptDate, setLastReflectionPromptDate] = useLocalStorage<string>(`last_reflection_prompt_${currentUser?.id}`, '');
  
  // Navigation states
  const [activeSection, setActiveSection] = useState<'planner' | 'travel' | 'goals' | 'home' | 'academic' | 'ideas'>('planner');
  const [mainView, setMainView] = useState<MainView>(MainView.Personal);
  
  // Right Column (Summary) reordering state
  const DEFAULT_SUMMARY_ORDER = ['home', 'academic', 'goals'];
  const [summaryOrder, setSummaryOrder] = useLocalStorage<string[]>(userSummaryOrderKey, DEFAULT_SUMMARY_ORDER);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  // Left Column (Main Panel) reordering state
  const DEFAULT_MAIN_PANEL_ORDER = ['schedule', 'reflection', 'partnerNotes'];
  const [mainPanelOrder, setMainPanelOrder] = useLocalStorage<string[]>(userMainPanelOrderKey, DEFAULT_MAIN_PANEL_ORDER);
  const dragMainPanelItem = useRef<number | null>(null);
  const dragOverMainPanelItem = useRef<number | null>(null);

  // Main Tour State
  const tourCompletedKey = `tour_completed_main_${currentUser?.id}`;
  const [isTourCompleted, setIsTourCompleted] = useLocalStorage<boolean>(tourCompletedKey, false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  // Module Tour States
  const [isHomeTourCompleted, setIsHomeTourCompleted] = useLocalStorage<boolean>(`tour_completed_home_${currentUser?.id}`, false);
  const [isGoalsTourCompleted, setIsGoalsTourCompleted] = useLocalStorage<boolean>(`tour_completed_goals_${currentUser?.id}`, false);
  const [isAcademicTourCompleted, setIsAcademicTourCompleted] = useLocalStorage<boolean>(`tour_completed_academic_${currentUser?.id}`, false);
  const [isTravelTourCompleted, setIsTravelTourCompleted] = useLocalStorage<boolean>(`tour_completed_travel_${currentUser?.id}`, false);
  const [isIdeasTourCompleted, setIsIdeasTourCompleted] = useLocalStorage<boolean>(`tour_completed_ideas_${currentUser?.id}`, false);
  
  const [isHomeTourOpen, setIsHomeTourOpen] = useState(false);
  const [isGoalsTourOpen, setIsGoalsTourOpen] = useState(false);
  const [isAcademicTourOpen, setIsAcademicTourOpen] = useState(false);
  const [isTravelTourOpen, setIsTravelTourOpen] = useState(false);
  const [isIdeasTourOpen, setIsIdeasTourOpen] = useState(false);


  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newSummaryOrder = [...summaryOrder];
    const draggedItemContent = newSummaryOrder.splice(dragItem.current, 1)[0];
    newSummaryOrder.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setSummaryOrder(newSummaryOrder);
  };

  const handleMainPanelDragSort = () => {
    if (dragMainPanelItem.current === null || dragOverMainPanelItem.current === null) return;
    const newMainPanelOrder = [...mainPanelOrder];
    const draggedItemContent = newMainPanelOrder.splice(dragMainPanelItem.current, 1)[0];
    newMainPanelOrder.splice(dragOverMainPanelItem.current, 0, draggedItemContent);
    dragMainPanelItem.current = null;
    dragOverMainPanelItem.current = null;
    setMainPanelOrder(newMainPanelOrder);
  };


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

    const mainTourSteps = useMemo((): TourStep[] => {
    // FIX: Add 'as const' to all 'position' properties to prevent TypeScript from widening the string literal types to 'string'. This ensures they match the specific literal types required by the 'TourStep' interface.
    const steps: TourStep[] = [
      {
        element: 'body',
        title: '¡Bienvenido/a a ConectaMente!',
        content: 'Este tour te guiará por las funciones principales. Puedes usar los botones para navegar o hacer clic fuera para salir.',
        position: 'center' as const,
      },
      {
        element: '#header-nav',
        title: 'Navegación Principal',
        content: 'Desde aquí puedes navegar entre las secciones clave: tu Planificador (la vista actual), Hogar, Metas, Académico y Viajes.',
        position: 'bottom' as const,
      },
      {
        element: '#header-nav-home',
        title: 'Sección: Mi Hogar',
        content: 'Aquí puedes organizar tus listas de compras, tareas del hogar y más. Todo lo que necesitas para gestionar tu espacio personal y familiar.',
        position: 'bottom' as const,
      },
      {
        element: '#header-nav-goals',
        title: 'Sección: Metas',
        content: 'Define tus grandes proyectos y ambiciones. Desglósalos en tareas más pequeñas y sigue tu progreso para alcanzar tus sueños.',
        position: 'bottom' as const,
      },
      {
        element: '#header-nav-academic',
        title: 'Sección: Académico',
        content: 'Lleva un control completo de tu carrera. Gestiona materias, correlatividades, fechas de examen y tus calificaciones, todo en un solo lugar.',
        position: 'bottom' as const,
      },
       {
        element: '#header-nav-travel',
        title: 'Sección: Viajes',
        content: 'Crea una bitácora digital de tus aventuras. Guarda tus destinos, fechas y pega los mejores recuerdos y fotos de cada viaje.',
        position: 'bottom' as const,
      },
      {
        element: '#header-nav-ideas',
        title: 'Sección: Pizarrón de Ideas',
        content: 'Este es tu espacio creativo. Añade notas adhesivas con ideas que se te ocurran. ¡Puedes arrastrarlas, editarlas y convertirlas en proyectos!',
        position: 'bottom' as const,
      },
      {
        element: '#calendar-view',
        title: 'Tu Calendario',
        content: 'Este es tu calendario. Te da una vista general de tus eventos del mes. Haz clic en un día para ver o añadir eventos para esa fecha específica.',
        position: 'left' as const,
      },
      {
        element: '#schedule-panel',
        title: 'Agenda del Día',
        content: 'Aquí verás los eventos del día seleccionado. Puedes añadir nuevos eventos, gestionar rutinas y marcar tareas como completadas.',
        position: 'right' as const,
      },
      {
        element: '#reflection-panel',
        title: 'Reflexión Diaria',
        content: 'Tómate un momento cada día para conectar contigo. Guarda tus pensamientos, lecciones aprendidas y cómo te sentiste.',
        position: 'right' as const,
      },
      {
        element: '#summary-column',
        title: 'Resúmenes Rápidos',
        content: 'En esta columna tienes vistas rápidas de tus otras secciones. ¡Y puedes arrastrarlas para reordenarlas como prefieras!',
        position: 'left' as const,
      },
    ];

    if (pairedUser) {
      steps.push({
        element: '#couple-space-tab',
        title: 'Espacio de Conexiones',
        content: 'Este es su espacio privado para compartir notas, cómo se sienten y conectar a un nivel más profundo.',
        position: 'bottom' as const,
      });
    }

    steps.push({
      element: '#user-menu',
      title: 'Tu Perfil y Conexiones',
      content: "Desde aquí gestionas tu perfil, la seguridad y, muy importante, tus 'Conexiones'. Puedes vincular tu cuenta con la de tu pareja para compartir un espacio privado.",
      position: 'left' as const,
    });
    
     steps.push({
      element: 'body',
      title: '¡Todo listo!',
      content: 'Has completado el tour. Explora y haz de ConectaMente tu espacio. Recuerda que puedes volver a hacer este tour desde el menú de usuario.',
      position: 'center' as const,
    });
    
    return steps;
  }, [pairedUser]);
  
  // Tour Steps for Modules
  const homeTourSteps: TourStep[] = [
    { element: '#home-panel-header', title: "Sección Mi Hogar", content: "Este espacio es para organizar las tareas y listas de tu día a día, ya sea personal o para compartir.", position: 'bottom' },
    { element: '#home-add-list-btn', title: "Crear una Lista", content: "Usa este botón para crear cualquier tipo de lista: supermercado, cuentas por pagar, tareas del hogar, etc.", position: 'bottom' },
    { element: '#list-card-example', title: "Tus Listas", content: "Cada lista que crees aparecerá aquí. Puedes editarla o eliminarla usando los íconos que aparecen al pasar el mouse.", position: 'bottom' },
    { element: '#add-list-item-form-example', title: "Añadir Elementos", content: "Escribe aquí para añadir un nuevo ítem a la lista y presiona el botón '+' o Enter.", position: 'top' },
    { element: '#list-item-checkbox-example', title: "Completar Tareas", content: "Marca la casilla para tachar un elemento. ¡Qué satisfacción!", position: 'right' },
    ...(pairedUser ? [{ element: '#share-list-btn-example', title: "Compartir Listas", content: "Puedes compartir listas para que tu pareja pueda verlas y editarlas en tiempo real.", position: 'left' as const }] : []),
    { element: 'body', position: 'center', title: "Hogar, dulce hogar organizado", content: "Ya estás listo/a para mantener todo en orden." }
  ];

  const goalsTourSteps: TourStep[] = [
    { element: '#goals-panel-header', title: "Sección de Metas", content: "Aquí puedes dar vida a tus grandes ambiciones. Define proyectos, desglósalos en tareas y sigue tu progreso.", position: 'bottom' },
    { element: '#goals-add-project-btn', title: "Crear un Proyecto", content: "Usa este botón para empezar un nuevo proyecto o meta. Dale un nombre, un ícono y una descripción motivadora.", position: 'bottom' },
    { element: '#project-card-example', title: "Tu Proyecto", content: "Cada proyecto se muestra así. Haz clic para expandir y ver las tareas. La barra muestra tu progreso general.", position: 'bottom' },
    { element: '#add-task-form-example', title: "Añadir Tareas", content: "Una vez expandido un proyecto, puedes añadir tareas manualmente aquí. ¡Divide y vencerás!", position: 'top' },
    { element: '#ai-task-suggester-example', title: "Sugerencias con IA", content: "¿No sabes por dónde empezar? Pide a la IA que te sugiera los primeros pasos para tu proyecto.", position: 'top' },
    { element: 'body', position: 'center', title: "¡A conquistar!", content: "Ya sabes cómo organizar tus metas. ¡El primer paso es el más importante!" }
  ];

  const academicTourSteps: TourStep[] = [
    { element: '#academic-panel-header', title: "Panel Académico", content: "Gestiona toda tu carrera desde aquí. Organiza tus materias, cuatrimestres y lleva un control de tus exámenes y notas.", position: 'bottom' },
    { element: '#subject-bank', title: "Banco de Materias", content: "Esta es tu 'caja' con todas las materias de tu plan de estudios. Añádelas con el botón de arriba.", position: 'right' },
    { element: '#draggable-subject-example', title: "Arrastrar y Soltar", content: "Arrastra una materia desde el banco y suéltala en un cuatrimestre para asignarla. Si tiene un candado, significa que aún no cumpliste sus correlativas.", position: 'right' },
    { element: '#semester-timeline', title: "Línea de Tiempo", content: "Aquí organizas tus cuatrimestres. Puedes crearlos, editarlos y ver qué materias cursas en cada uno.", position: 'left' },
    { element: '#semester-card-example', title: "Detalles del Cuatrimestre", content: "Haz clic en el título de un cuatrimestre para abrir una vista detallada donde puedes gestionar exámenes y cambiar el estado de las materias.", position: 'left' },
    { element: '#academic-progress-toggle', title: "Ver Progreso", content: "Haz clic aquí para desplegar un resumen visual de tu avance en la carrera y tu promedio general.", position: 'left' },
    { element: 'body', position: 'center', title: "¡Éxito en tus estudios!", content: "Ahora tienes el control total de tu recorrido académico." }
  ];

  const travelTourSteps: TourStep[] = [
    { element: '#travel-log-header', title: "Bitácora de Viajes", content: "Este es tu diario de aventuras. Guarda cada viaje y colecciona tus recuerdos más preciados.", position: 'bottom' },
    { element: '#travel-add-trip-btn', title: "Añadir un Viaje", content: "Haz clic aquí para registrar un nuevo viaje. Podrás añadir destino, fechas y una foto de portada.", position: 'bottom' },
    { element: '#trip-card-example', title: "Tus Viajes", content: "Cada viaje se muestra como una foto polaroid. Haz clic en una para abrirla y ver todos los detalles y recuerdos.", position: 'bottom' },
    { element: 'body', position: 'center', title: "¡A viajar!", content: "Cuando entres a un viaje, podrás añadir 'Recuerdos' (fotos, notas, emociones) y pedirle a la IA que te dé ideas. ¡Buen viaje!" }
  ];
  
  const ideasTourSteps: TourStep[] = [
      { element: '#ideas-panel-header', title: "Pizarrón de Ideas", content: "¡Bienvenido a tu espacio creativo! Aquí puedes anotar cualquier idea que se te ocurra.", position: 'bottom' },
      { element: '#add-idea-btn', title: "Añadir una Idea", content: "Usa este botón para crear una nueva nota adhesiva en tu pizarrón. ¡No dejes que se te escape ninguna idea!", position: 'bottom' },
      { element: '.idea-note-example', title: "Tu Nota Adhesiva", content: "Cada idea es una nota. Haz doble clic para editar el texto. ¡Arrastra la nota para moverla por el pizarrón!", position: 'bottom' },
      { element: '.idea-note-example', title: "Controles de la Nota", content: "Pasa el mouse sobre una nota para ver los controles: puedes convertirla en un proyecto, eliminarla o cambiarle el color.", position: 'top' },
      { element: 'body', position: 'center', title: "¡Listo para crear!", content: "Ya sabes cómo funciona. ¡Ahora a llenar este pizarrón con ideas geniales!" }
  ];


  const userShoppingLists = useMemo(() => {
    if (!currentUser) return [];
    return allShoppingLists.filter(list => 
        list.ownerId === currentUser.id || 
        (list.isShared && list.ownerId === pairedUser?.id)
    );
  }, [allShoppingLists, currentUser, pairedUser]);


  const coupleId = useMemo(() => {
    if (!currentUser || !pairedUser) return null;
    return [currentUser.id, pairedUser.id].sort().join('_');
  }, [currentUser, pairedUser]);

  const [qaSessions, setQaSessions] = useLocalStorage<QASession[]>(`qa_sessions_${coupleId}`, []);
  const [partnerNotes, setPartnerNotes] = useLocalStorage<PartnerNote[]>(`partner_notes_${coupleId}`, []);
  const [sharedEmotionStates, setSharedEmotionStates] = useLocalStorage<SharedEmotionState[]>(`shared_emotions_${coupleId}`, []);
  
  const academicEventsForCalendar = useMemo((): Event[] => {
    const subjectMap = new Map(subjects.map(s => [s.id, s]));
    // FIX: Add an explicit return type to the map callback. This helps TypeScript correctly infer
    // the array type for the subsequent filter, resolving the type predicate error.
    return exams.map((exam): Event | null => {
        const subject = subjectMap.get(exam.subjectId);
        if (!subject) return null;
        return {
            id: `exam-${exam.id}`,
            title: `[${exam.type === 'final' ? 'Final' : 'Parcial'}] ${subject.name}`,
            date: exam.date,
            time: exam.time,
            category: 'otro' as const,
            reminder: true, // Exams always have reminders
            color: '#8B5CF6', // A distinct violet color
            completed: exam.grade !== null,
            isAcademic: true, // Custom flag to identify these events
        };
    }).filter((e): e is Event => e !== null);
  }, [exams, subjects]);

  const allEvents = useMemo(() => [...events, ...academicEventsForCalendar], [events, academicEventsForCalendar]);

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
      setIdeas([]);
      setStickyNotes([]);
      setAreStickyNotesVisible(true);
      setSemesters([]);
      setSubjects([]);
      setExams([]);
      setProcessedPartnerNoteIds([]);
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

        const newIdeasKey = `ideas_${currentUser.id}`;
        const storedIdeas = localStorage.getItem(newIdeasKey);
        setIdeas(storedIdeas ? JSON.parse(storedIdeas) : EXAMPLE_IDEAS_DATA);
        
        const newStickyNotesKey = `sticky_notes_${currentUser.id}`;
        const storedStickyNotes = localStorage.getItem(newStickyNotesKey);
        setStickyNotes(storedStickyNotes ? JSON.parse(storedStickyNotes) : []);

        const newVisibleKey = `sticky_notes_visible_${currentUser.id}`;
        const storedVisible = localStorage.getItem(newVisibleKey);
        setAreStickyNotesVisible(storedVisible ? JSON.parse(storedVisible) : true);

        const newSemestersKey = `semesters_${currentUser.id}`;
        const storedSemesters = localStorage.getItem(newSemestersKey);
        setSemesters(storedSemesters ? JSON.parse(storedSemesters) : EXAMPLE_SEMESTERS_DATA);

        const newSubjectsKey = `subjects_${currentUser.id}`;
        const storedSubjects = localStorage.getItem(newSubjectsKey);
        setSubjects(storedSubjects ? JSON.parse(storedSubjects) : EXAMPLE_SUBJECTS_DATA);
        
        const newExamsKey = `exams_${currentUser.id}`;
        const storedExams = localStorage.getItem(newExamsKey);
        setExams(storedExams ? JSON.parse(storedExams) : EXAMPLE_EXAMS_DATA);
        
        const newProcessedKey = `processed_partner_notes_${currentUser.id}`;
        const storedProcessed = localStorage.getItem(newProcessedKey);
        setProcessedPartnerNoteIds(storedProcessed ? JSON.parse(storedProcessed) : []);
    }
  }, [currentUser, setEvents, setRoutines, setJournalEntries, setNotifications, setNotifiedEvents, setProjects, setTasks, setTrips, setIdeas, setStickyNotes, setAreStickyNotesVisible, setSemesters, setSubjects, setExams, setProcessedPartnerNoteIds]);

  useEffect(() => {
    // Start main tour automatically if it's the first time
    if (currentUser && !isTourCompleted) {
        const timer = setTimeout(() => setIsTourOpen(true), 500);
        return () => clearTimeout(timer);
    }
  }, [currentUser, isTourCompleted]);
  
  // Effect to trigger module tours
  useEffect(() => {
    if (!currentUser) return;
    const timer = setTimeout(() => {
      switch(activeSection) {
        case 'home':
          if (!isHomeTourCompleted) setIsHomeTourOpen(true);
          break;
        case 'goals':
          if (!isGoalsTourCompleted) setIsGoalsTourOpen(true);
          break;
        case 'academic':
          if (!isAcademicTourCompleted) setIsAcademicTourOpen(true);
          break;
        case 'travel':
          if (!isTravelTourCompleted) setIsTravelTourOpen(true);
          break;
        case 'ideas':
            if (!isIdeasTourCompleted) setIsIdeasTourOpen(true);
            break;
        default:
          break;
      }
    }, 500); // Delay to allow UI to render

    return () => clearTimeout(timer);
  }, [activeSection, currentUser, isHomeTourCompleted, isGoalsTourCompleted, isAcademicTourCompleted, isTravelTourCompleted, isIdeasTourCompleted]);
  
  const generateId = useCallback(() => uuidv4(), []);

  // Effect for new partner notes to appear as sticky notes
  useEffect(() => {
    if (!pairedUser) return;

    // Find new text notes from the partner that haven't been turned into stickies yet.
    const newPartnerTextNotes = partnerNotes.filter(note =>
        note.authorId === pairedUser.id &&
        (note.type === 'note' || !note.type) && // Standard text notes
        !processedPartnerNoteIds.includes(note.id)
    );

    if (newPartnerTextNotes.length > 0) {
        const newStickyNotes: StickyNote[] = newPartnerTextNotes.map(note => {
            const noteColors = ['#FFFACD', '#FFDDC1', '#D4F0F0', '#E2F0D4', '#F4C2C2'];
            const noteWidth = 208;
            const noteHeight = 208;
            const bufferX = 20;
            const bufferY = 100; // Account for header

            return {
                id: generateId(),
                text: `Nota de ${pairedUser.name}:\n"${note.text}"`,
                position: {
                    x: Math.max(bufferX, Math.random() * (window.innerWidth - noteWidth - bufferX * 2)),
                    y: Math.max(bufferY, Math.random() * (window.innerHeight - noteHeight - bufferY - bufferX))
                },
                color: noteColors[Math.floor(Math.random() * noteColors.length)],
                rotation: (Math.random() * 8) - 4,
                width: noteWidth,
                height: noteHeight,
            };
        });

        setStickyNotes(prev => [...prev, ...newStickyNotes]);
        setProcessedPartnerNoteIds(prev => [...prev, ...newPartnerTextNotes.map(n => n.id)]);
    }
  }, [partnerNotes, pairedUser, processedPartnerNoteIds, setStickyNotes, setProcessedPartnerNoteIds, generateId]);


  // User and Pairing Logic
    const handleLogin = async (email: string, password: string): Promise<{success: boolean; message?: string}> => {
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                redirect: 'follow',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: 'getUser', email }),
            });
            if (!response.ok) throw new Error('Network response was not ok.');
            const result = await response.json();

            if (result.success && result.user) {
                if (result.user.password === password) {
                    const localUserData = users.find(u => u.id === result.user.userId);
                    
                    const loggedInUser: User = {
                        id: result.user.userId,
                        name: result.user.name,
                        pairedWith: localUserData?.pairedWith || null,
                        pin: localUserData?.pin,
                    };

                    const testEmail1 = 'lucassdiazz96@gmail.com';
                    const testEmail2 = 'lucasrondanorte@gmail.com';

                    if (email === testEmail1 || email === testEmail2) {
                        const otherTestEmail = email === testEmail1 ? testEmail2 : testEmail1;
                        
                        try {
                            const otherUserResponse = await fetch(APPS_SCRIPT_URL, {
                                method: 'POST',
                                redirect: 'follow',
                                headers: { "Content-Type": "text/plain;charset=utf-8" },
                                body: JSON.stringify({ action: 'getUser', email: otherTestEmail }),
                            });
                            if (otherUserResponse.ok) {
                                const otherUserResult = await otherUserResponse.json();
                                if (otherUserResult.success && otherUserResult.user) {
                                    const otherUserId = otherUserResult.user.userId;
                                    const otherUserName = otherUserResult.user.name;

                                    loggedInUser.pairedWith = otherUserId;

                                    setUsers(prev => {
                                        let newUsers = [...prev];
                                        
                                        const loggedInUserIndex = newUsers.findIndex(u => u.id === loggedInUser.id);
                                        if (loggedInUserIndex > -1) {
                                            newUsers[loggedInUserIndex] = { ...newUsers[loggedInUserIndex], ...loggedInUser };
                                        } else {
                                            newUsers.push(loggedInUser);
                                        }

                                        const otherUserIndex = newUsers.findIndex(u => u.id === otherUserId);
                                        if (otherUserIndex > -1) {
                                            newUsers[otherUserIndex] = { ...newUsers[otherUserIndex], name: otherUserName, pairedWith: loggedInUser.id };
                                        } else {
                                            newUsers.push({ id: otherUserId, name: otherUserName, pairedWith: loggedInUser.id, pin: undefined });
                                        }
                                        
                                        return newUsers;
                                    });

                                    setCurrentUser(loggedInUser);
                                    return { success: true };
                                }
                            }
                        } catch (error) {
                            console.error("Auto-pairing for test users failed:", error);
                        }
                    }
                    
                    setUsers(prev => {
                        const userInCache = prev.find(u => u.id === loggedInUser.id);
                        if (userInCache) {
                            return prev.map(u => u.id === loggedInUser.id ? { ...u, name: loggedInUser.name } : u);
                        }
                        return [...prev, loggedInUser];
                    });

                    setCurrentUser(loggedInUser);
                    return { success: true };
                } else {
                    return { success: false, message: "Contraseña incorrecta." };
                }
            } else {
                return { success: false, message: result.message || "Usuario no encontrado." };
            }
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "Error de red al intentar iniciar sesión." };
        }
    };

    const handleCreateUser = async (name: string, email: string, password: string): Promise<{success: boolean; message?: string}> => {
        try {
            const checkResponse = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                redirect: 'follow',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: 'getUser', email }),
            });
            if(checkResponse.ok) {
                const checkResult = await checkResponse.json();
                if (checkResult.success) {
                    return { success: false, message: 'Ya existe un usuario con este correo electrónico.' };
                }
            }
            
            const createResponse = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                redirect: 'follow',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: 'saveUser', name, email, password }),
            });

            if (!createResponse.ok) throw new Error('Network response was not ok during creation.');
            
            const createResult = await createResponse.json();

            if (createResult.success) {
                return await handleLogin(email, password);
            } else {
                return { success: false, message: createResult.message || 'Error al crear el usuario.' };
            }

        } catch (error) {
            console.error("Create user error:", error);
            return { success: false, message: 'Error de red al crear el usuario.' };
        }
    };


  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const handleSavePin = (newPin: string) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, pin: newPin } : u);
    setUsers(updatedUsers);
    setCurrentUser(prev => prev ? { ...prev, pin: newPin } : null);
    setIsPinModalOpen(false);
  };
  
  const handleSendRequest = async (email: string): Promise<{ success: boolean; message: string; }> => {
    if (!currentUser) {
        return { success: false, message: 'Debes iniciar sesión para enviar solicitudes.' };
    }
    
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: 'getUser', email }),
        });
        if (!response.ok) throw new Error('Respuesta de red no fue OK.');
        const result = await response.json();

        if (result.success && result.user) {
            const toUserId = result.user.userId;

            if (toUserId === currentUser.id) {
                return { success: false, message: 'No puedes enviarte una solicitud a ti mismo.' };
            }

            const targetUser: User = { id: toUserId, name: result.user.name };
            
            // Add user to cache if not already there
            setUsers(prev => prev.some(u => u.id === targetUser.id) ? prev : [...prev, targetUser]);

            const existingRequest = pairingRequests.find(
              r => (r.fromUserId === currentUser.id && r.toUserId === toUserId) || 
                   (r.fromUserId === toUserId && r.toUserId === currentUser.id)
            );

            if (existingRequest) {
                return { success: false, message: 'Ya existe una solicitud con este usuario.' };
            }

            const newRequest: PairingRequest = { id: generateId(), fromUserId: currentUser.id, toUserId, status: 'pending' };
            setPairingRequests(prev => [...prev, newRequest]);
            return { success: true, message: `Solicitud enviada a ${targetUser.name}.` };

        } else {
            return { success: false, message: result.message || 'Usuario no encontrado.' };
        }
    } catch (err) {
        console.error("Error sending pairing request:", err);
        return { success: false, message: 'Ocurrió un error de red.' };
    }
  };


  const handleRespondToRequest = (requestId: string, status: 'accepted' | 'declined') => {
    const request = pairingRequests.find(r => r.id === requestId);
    if (!request) return;
    
    if (status === 'accepted') {
      // Update users
      let fromUser: User | undefined, toUser: User | undefined;
      const updatedUsers = users.map(u => {
          if (u.id === request.fromUserId) {
              fromUser = { ...u, pairedWith: request.toUserId };
              return fromUser;
          }
          if (u.id === request.toUserId) {
              toUser = { ...u, pairedWith: request.fromUserId };
              return toUser;
          }
          return u;
      });
      setUsers(updatedUsers);

        // Update current user state if they are involved
      if(currentUser && (currentUser.id === fromUser?.id)) {
          setCurrentUser(fromUser);
      } else if (currentUser && (currentUser.id === toUser?.id)) {
          setCurrentUser(toUser);
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
      
      let newCurrentUser: User | undefined;
      const updatedUsers = users.map(u => {
          if (u.id === currentUser.id) {
              newCurrentUser = { ...u, pairedWith: null };
              return newCurrentUser;
          }
          if (u.id === partnerId) {
              return { ...u, pairedWith: null };
          }
          return u;
      });
      setUsers(updatedUsers);
      if(newCurrentUser) setCurrentUser(newCurrentUser);
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
    if (event.isAcademic) {
        addNotification({
            type: 'generic',
            title: 'Evento Académico',
            message: 'Para editar este examen, ve a la sección "Académico".',
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
     if(eventToDelete?.isAcademic) {
        addNotification({
            type: 'generic',
            title: 'No se puede eliminar',
            message: 'Para eliminar este examen, ve a la sección "Académico".',
        });
        return;
    }
    setEvents(events.filter(e => e.id !== eventId));
  };
  
  const handleToggleEventCompletion = (eventId: string) => {
    const event = allEvents.find(e => e.id === eventId);
    if (event && event.isAcademic) {
        const examId = event.id.replace('exam-', '');
        const examToGrade = exams.find(e => e.id === examId);
        if (examToGrade) {
            if (examToGrade.grade !== null) {
                handleSaveExam({ ...examToGrade, grade: null }, examToGrade.id);
            } else {
                handlePromptForExamGrade(examToGrade);
            }
        }
    } else if (event) {
        setEvents(events.map(e => 
            e.id === eventId ? { ...e, completed: !e.completed } : e
        ));
    }
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

  const handleAddReplyToNote = (noteId: string, replyText: string) => {
    if (!currentUser) return;

    const newReply: PartnerNote = {
        id: generateId(),
        authorId: currentUser.id,
        text: replyText,
        timestamp: new Date().toISOString(),
        type: 'note',
        replyToId: noteId,
    };

    setPartnerNotes(prev => [newReply, ...prev]);
  };
  
  const handlePinPartnerNote = (note: PartnerNote) => {
    if (!pairedUser) return;

    const noteColors = ['#FFFACD', '#FFDDC1', '#D4F0F0', '#E2F0D4', '#F4C2C2'];
    const newStickyNote: StickyNote = {
        id: generateId(),
        text: `Nota de ${pairedUser.name}:\n"${note.text}"`,
        position: { x: window.innerWidth / 2 - 104, y: 100 },
        color: noteColors[Math.floor(Math.random() * noteColors.length)],
        rotation: (Math.random() * 6) - 3,
        width: 208,
        height: 208,
    };
    
    setStickyNotes(prev => [...prev, newStickyNote]);
    
    addNotification({
        type: 'generic',
        title: '¡Nota Guardada!',
        message: 'La nota de tu pareja se ha añadido a tu pizarrón.',
    });
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
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTasks(prev => prev.filter(t => t.projectId !== projectId));
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
        setTrips(prev => prev.filter(t => t.id !== tripId));
    };

    // Home / Shopping List Logic
    const handleSaveShoppingList = (title: string, icon: string, id?: string) => {
        if (id) {
            setAllShoppingLists(prev => prev.map(list => list.id === id ? { ...list, title, icon } : list));
        } else {
            const newList: ShoppingList = { id: generateId(), title, icon, items: [], ownerId: currentUser!.id, isShared: false };
            setAllShoppingLists(prev => [...prev, newList]);
        }
    };

    const handleDeleteShoppingList = (listId: string) => {
        setAllShoppingLists(prev => prev.filter(list => list.id !== listId));
    };
    
    const handleToggleShareList = (listId: string) => {
        setAllShoppingLists(prev => prev.map(list => 
            list.id === listId && list.ownerId === currentUser?.id 
            ? { ...list, isShared: !list.isShared } 
            : list
        ));
    };

    const handleAddShoppingListItem = (listId: string, text: string) => {
        const newItem: ShoppingListItem = { id: generateId(), text, completed: false };
        setAllShoppingLists(prev => prev.map(list => 
            list.id === listId ? { ...list, items: [...list.items, newItem] } : list
        ));
    };

    const handleUpdateShoppingListItem = (listId: string, itemId: string, newText: string, newCompleted: boolean) => {
        setAllShoppingLists(prev => prev.map(list => {
            if (list.id === listId) {
                return {
                    ...list,
                    items: list.items.map(item => 
                        item.id === itemId 
                        ? { 
                            ...item, 
                            text: newText, 
                            completed: newCompleted,
                            completedBy: newCompleted ? currentUser!.id : undefined,
                          } 
                        : item
                    )
                };
            }
            return list;
        }));
    };
    
    const handleDeleteShoppingListItem = (listId: string, itemId: string) => {
        setAllShoppingLists(prev => prev.map(list => 
            list.id === listId ? { ...list, items: list.items.filter(item => item.id !== itemId) } : list
        ));
    };

    // Academic Logic
    const handleSaveSemester = (data: Omit<Semester, 'id'>, id?: string) => {
        if (id) {
            setSemesters(prev => prev.map(s => s.id === id ? { ...data, id, subjectIds: s.subjectIds } : s));
        } else {
            setSemesters(prev => [...prev, { ...data, id: generateId(), subjectIds: [] }]);
        }
    };
    const handleDeleteSemester = (id: string) => {
        const semesterToDelete = semesters.find(s => s.id === id);
        if (!semesterToDelete) return;
        
        // Revert subjects to 'pendiente'
        setSubjects(prev => prev.map(sub => {
            if (semesterToDelete.subjectIds.includes(sub.id)) {
                return { ...sub, status: 'pendiente' };
            }
            return sub;
        }));

        setSemesters(prev => prev.filter(s => s.id !== id));
    };
    const handleSaveSubject = (data: Omit<Subject, 'id'>, id?: string) => {
        if (id) {
            setSubjects(prev => prev.map(s => s.id === id ? { ...data, id } : s));
        } else {
            setSubjects(prev => [...prev, { ...data, id: generateId() }]);
        }
    };
    const handleDeleteSubject = (id: string) => {
        // Remove from semesters first
        setSemesters(prev => prev.map(sem => ({
            ...sem,
            subjectIds: sem.subjectIds.filter(subId => subId !== id)
        })));

        // Then, remove the subject itself and update prerequisites in others
        setSubjects(prev => 
            prev
                .filter(s => s.id !== id) // Remove the subject
                .map(sub => ({ // Update prerequisites in remaining subjects
                    ...sub,
                    prerequisiteIds: sub.prerequisiteIds.filter(pId => pId !== id)
                }))
        );
        
        // Finally, remove associated exams
        setExams(prev => prev.filter(e => e.subjectId !== id));
    };
    const handleSaveExam = (data: Omit<Exam, 'id'>, id?: string) => {
         if (id) {
            setExams(prev => prev.map(e => e.id === id ? { ...data, id } : e));
        } else {
            setExams(prev => [...prev, { ...data, id: generateId() }]);
        }
    };
    const handleDeleteExam = (id: string) => {
        setExams(prev => prev.filter(e => e.id !== id));
    };

    const handleAssignSubject = (subjectId: string, semesterId: string) => {
        // Add subjectId to semester
        setSemesters(prev => prev.map(sem => 
            sem.id === semesterId 
            ? { ...sem, subjectIds: [...sem.subjectIds, subjectId] }
            : sem
        ));
        // Update subject status to 'cursando'
        setSubjects(prev => prev.map(sub => 
            sub.id === subjectId
            ? { ...sub, status: 'cursando' }
            : sub
        ));
    };
    
    const handleUnassignSubject = (subjectId: string, semesterId: string) => {
        // Remove subjectId from semester
        setSemesters(prev => prev.map(sem => 
            sem.id === semesterId
            ? { ...sem, subjectIds: sem.subjectIds.filter(id => id !== subjectId) }
            : sem
        ));
        // Update subject status to 'pendiente'
        setSubjects(prev => prev.map(sub =>
            sub.id === subjectId
            ? { ...sub, status: 'pendiente' }
            : sub
        ));
    };

    const handleShareSubjectUpdate = (subject: Subject) => {
        if (!currentUser || !pairedUser) return;
        const note: PartnerNote = {
            id: generateId(),
            authorId: currentUser.id,
            text: `${currentUser.name} ha actualizado una materia.`,
            timestamp: new Date().toISOString(),
            type: 'subject_update',
            subjectUpdateContent: {
                subjectName: subject.name,
                newStatus: subject.status,
                finalGrade: subject.finalGrade,
            }
        };
        setPartnerNotes(prev => [note, ...prev]);
        addNotification({
            type: 'new_partner_note',
            title: 'Progreso Académico Compartido',
            message: `${currentUser.name} actualizó el estado de ${subject.name}.`
        });
    };

    const handleUpdateSubjectStatusAndGrade = (subjectId: string, newStatus: SubjectStatus, finalGrade: number | null = null) => {
        let updatedSubject: Subject | undefined;
        const newSubjects = subjects.map(sub => {
            if (sub.id === subjectId) {
                const newGrade = newStatus === 'aprobada' ? finalGrade : null;
                updatedSubject = { ...sub, status: newStatus, finalGrade: newGrade };
                return updatedSubject;
            }
            return sub;
        });
        setSubjects(newSubjects);

        if (pairedUser && updatedSubject && (newStatus === 'aprobada' || newStatus === 'recursar')) {
            const actionText = newStatus === 'aprobada' ? `aprobado` : `puesto a recursar`;
            const titleText = newStatus === 'aprobada' ? '¡Felicitaciones!' : 'Actualización Académica';
            
            setConfirmationState({
                isOpen: true,
                title: `${titleText} - Compartir`,
                message: `¿Quieres compartir con ${pairedUser.name} que has ${actionText} "${updatedSubject.name}"?`,
                onConfirm: () => handleShareSubjectUpdate(updatedSubject!),
                confirmText: 'Sí, compartir',
                cancelText: 'No, gracias',
            });
        }
    };

    const handlePromptForGrade = (subject: Subject) => {
        setSubjectForGrade(subject);
        setIsGradeModalOpen(true);
    };

    const handlePromptForExamGrade = (exam: Exam) => {
        setExamForGrade(exam);
        setIsExamGradeModalOpen(true);
    };

    const handleSaveExamGrade = (grade: number | null) => {
        if (examForGrade) {
            // First, update the exam itself
            handleSaveExam({ ...examForGrade, grade }, examForGrade.id);

            // Check if it's a passing final exam grade (assuming 4 is the passing grade)
            const isPassingFinal = examForGrade.type === 'final' && grade !== null && grade >= 4;

            if (isPassingFinal) {
                const subjectToUpdate = subjects.find(s => s.id === examForGrade.subjectId);
                // Update the subject only if it's not already approved
                if (subjectToUpdate && subjectToUpdate.status !== 'aprobada') {
                    handleUpdateSubjectStatusAndGrade(subjectToUpdate.id, 'aprobada', grade);
                }
            }
        }
        // Close modal and reset state
        setIsExamGradeModalOpen(false);
        setExamForGrade(null);
    };

    // Idea Board Logic
    const handleSaveIdea = (ideaToSave: Idea) => {
        setIdeas(prev => {
            const ideaIndex = prev.findIndex(i => i.id === ideaToSave.id);
            if (ideaIndex > -1) {
                const updatedIdeas = [...prev];
                updatedIdeas[ideaIndex] = ideaToSave;
                return updatedIdeas;
            } else {
                return [...prev, ideaToSave];
            }
        });
    };

    const handleDeleteIdea = (ideaId: string) => {
        setIdeas(prev => prev.filter(i => i.id !== ideaId));
    };

    const handleConvertIdeaToProject = (idea: Idea) => {
        setConfirmationState({
            isOpen: true,
            title: 'Convertir Idea en Proyecto',
            message: `¿Estás seguro de que quieres convertir esta idea en un nuevo proyecto? La nota se eliminará del pizarrón.`,
            onConfirm: () => {
                const newProject: Omit<Project, 'id'> = {
                    title: idea.content.substring(0, 100), // Use content as title
                    description: `Proyecto generado desde la idea: "${idea.content}"`,
                    icon: '💡',
                };
                handleSaveProject(newProject);
                handleDeleteIdea(idea.id);
                setActiveSection('goals');
                addNotification({
                    type: 'generic',
                    title: '¡Idea en marcha!',
                    message: `Tu idea se ha convertido en el proyecto "${newProject.title}".`
                });
            },
            confirmText: 'Sí, convertir',
            cancelText: 'Cancelar',
        });
    };

    // Sticky Note Logic
    const handleAddStickyNote = () => {
        const noteColors = ['#FFFACD', '#FFDDC1', '#D4F0F0', '#E2F0D4', '#F4C2C2'];
        const newNote: StickyNote = {
            id: generateId(),
            text: 'Escribe algo...',
            position: { x: window.innerWidth / 2 - 104, y: window.innerHeight / 2 - 104 }, // 104 is half of 208px (w-52)
            color: noteColors[Math.floor(Math.random() * noteColors.length)],
            rotation: (Math.random() * 8) - 4, // -4 to 4 degrees
            width: 208,
            height: 208,
        };
        setStickyNotes(prev => [...prev, newNote]);
    };

    const handleSaveStickyNote = (noteToSave: StickyNote) => {
        setStickyNotes(prev => prev.map(note => note.id === noteToSave.id ? noteToSave : note));
    };
    
    const handleDeleteStickyNote = (noteId: string) => {
        setStickyNotes(prev => prev.filter(note => note.id !== noteId));
    };

    const handleSaveStickyNoteToIdeas = (note: StickyNote) => {
        const newIdea: Idea = {
            id: generateId(),
            content: note.text,
            color: note.color,
            position: { x: (Math.random() * 300) + 50, y: (Math.random() * 300) + 50 },
            createdAt: new Date().toISOString(),
        };
        setIdeas(prev => [...prev, newIdea]);
        handleDeleteStickyNote(note.id);

        addNotification({
            type: 'generic',
            title: 'Nota Guardada',
            message: 'Tu nota se ha guardado en el Pizarrón de Ideas.',
            action: {
                label: 'Ver Pizarrón',
                callback: () => setActiveSection('ideas'),
            }
        });
    };

    const handleConvertStickyNoteToGoal = (note: StickyNote) => {
        const newProject: Omit<Project, 'id'> = {
            title: note.text.substring(0, 100),
            description: `Proyecto generado desde una nota adhesiva.`,
            icon: '📌',
        };
        handleSaveProject(newProject);
        handleDeleteStickyNote(note.id);
        
        addNotification({
            type: 'generic',
            title: '¡Meta Creada!',
            message: 'Tu nota se ha convertido en un nuevo proyecto.',
            action: {
                label: 'Ver Metas',
                callback: () => setActiveSection('goals'),
            }
        });
    };


  // Notification Logic
  // FIX: Moved `handleNotificationClick` before `addNotification` to resolve the "used before its declaration" error.
  // The two functions had a dependency, and this reordering ensures `handleNotificationClick` is defined when `addNotification` needs it.
  const handleNotificationClick = useCallback((notification: Notification) => {
    window.focus(); // Bring window to front
    
    switch (notification.type) {
      case 'event_reminder':
        if (notification.relatedId) {
          const event = allEvents.find(e => e.id === notification.relatedId);
          if (event) {
            setActiveSection(event.isAcademic ? 'academic' : 'planner');
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
  }, [allEvents, pairedUser]);
  
  const handleMarkAsRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const handleMarkAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

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

  }, [isNotificationsMuted, setNotifications, sendSystemNotification, handleNotificationClick, generateId]);

  // Effect for event reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);

      allEvents.forEach(event => {
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
  }, [allEvents, notifiedEvents, addNotification, setNotifiedEvents]);
  
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
    return <UserAuth onLogin={handleLogin} onCreateUser={handleCreateUser} />;
  }

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const currentJournalEntry = journalEntries.find(e => e.date === selectedDateString);

  return (
    <>
      <style>{`
        .draggable-summary:active {
          cursor: grabbing;
          transform: scale(1.01);
          z-index: 10;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
      `}</style>
      <NotificationHost toastNotifications={toastNotifications} setToastNotifications={setToastNotifications} />
      <StickyNotesOverlay
        notes={stickyNotes}
        onAddNote={handleAddStickyNote}
        onSaveNote={handleSaveStickyNote}
        onDeleteNote={handleDeleteStickyNote}
        isVisible={areStickyNotesVisible}
        onToggleVisibility={() => setAreStickyNotesVisible(prev => !prev)}
        onSaveToIdeas={handleSaveStickyNoteToIdeas}
        onConvertToGoal={handleConvertStickyNoteToGoal}
      />
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
              onNavigateToAcademic={() => setActiveSection('academic')}
              onNavigateToIdeas={() => setActiveSection('ideas')}
              activeSection={activeSection}
              onStartTour={() => setIsTourOpen(true)}
            />
        </div>
        <main className="max-w-7xl mx-auto p-2 sm:p-6 lg:p-8">
            {activeSection === 'planner' && (
                <>
                    {pairedUser && (
                        <div id="couple-space-tab" className="mb-6 border-b border-zinc-200">
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
                                {(() => {
                                    const mainPanelComponents: Record<string, React.ReactNode> = {
                                      schedule: (
                                        <div id="schedule-panel" className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                                            <SchedulePanel
                                                selectedDate={selectedDate}
                                                events={allEvents}
                                                exams={exams}
                                                subjects={subjects}
                                                onAddEvent={handleAddEventClick}
                                                onEditEvent={handleEditEventClick}
                                                onDeleteEvent={handleDeleteEvent}
                                                onManageRoutines={() => setIsRoutineManagerOpen(true)}
                                                onToggleEventCompletion={handleToggleEventCompletion}
                                            />
                                        </div>
                                      ),
                                      reflection: (
                                        <div id="reflection-panel">
                                            <DailyReflection 
                                                journalEntries={journalEntries}
                                                currentJournalEntry={currentJournalEntry}
                                                selectedDate={selectedDate}
                                                onSave={handleSaveJournal}
                                                onOpenHistory={() => setIsReflectionLogModalOpen(true)}
                                                onOpenShareModal={handleOpenShareModal}
                                                partner={pairedUser}
                                            />
                                        </div>
                                      ),
                                      partnerNotes: pairedUser ? (
                                        <PartnerNotes
                                            partner={pairedUser}
                                            partnerNotes={partnerNotes}
                                            sharedEmotionStates={sharedEmotionStates}
                                            qaSessions={qaSessions}
                                            onNavigate={handleNavigateToCoupleSpace}
                                        />
                                      ) : null,
                                    };

                                    const orderedComponentKeys = mainPanelOrder.filter(key => mainPanelComponents[key]);

                                    return orderedComponentKeys.map((key, index) => (
                                       <div
                                          key={key}
                                          draggable
                                          onDragStart={() => (dragMainPanelItem.current = index)}
                                          onDragEnter={() => (dragOverMainPanelItem.current = index)}
                                          onDragEnd={handleMainPanelDragSort}
                                          onDragOver={(e) => e.preventDefault()}
                                          className="draggable-summary group relative cursor-grab transition-transform"
                                       >
                                          <div className="absolute top-3 right-3 p-1 bg-white/50 rounded-md text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Arrastrar para reordenar">
                                            <GripVerticalIcon className="w-5 h-5"/>
                                          </div>
                                          {mainPanelComponents[key]}
                                       </div>
                                    ));
                                })()}
                            </div>

                            {/* Columna Lateral */}
                            <div id="summary-column" className="xl:col-span-2 space-y-8">
                                <div id="calendar-view" className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                                    <Calendar
                                    currentDate={currentDate}
                                    setCurrentDate={setCurrentDate}
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                    events={allEvents}
                                    onOpenPrintView={() => setIsPrintViewOpen(true)}
                                    />
                                </div>
                                 {(() => {
                                    const summaryComponents: Record<string, React.ReactNode> = {
                                      home: (
                                        <HomeSummary
                                          shoppingLists={userShoppingLists}
                                          onNavigate={() => setActiveSection('home')}
                                        />
                                      ),
                                      academic: (
                                        <AcademicSummary
                                          subjects={subjects}
                                          exams={exams}
                                          semesters={semesters}
                                          onNavigate={() => setActiveSection('academic')}
                                        />
                                      ),
                                      goals: (
                                        <GoalsSummary 
                                          projects={projects}
                                          tasks={tasks}
                                          onNavigate={() => setActiveSection('goals')}
                                        />
                                      ),
                                    };

                                    const orderedComponentKeys = summaryOrder.filter(key => summaryComponents[key]);

                                    return orderedComponentKeys.map((key, index) => (
                                       <div
                                          key={key}
                                          draggable
                                          onDragStart={() => (dragItem.current = index)}
                                          onDragEnter={() => (dragOverItem.current = index)}
                                          onDragEnd={handleDragSort}
                                          onDragOver={(e) => e.preventDefault()}
                                          className="draggable-summary group relative cursor-grab transition-transform"
                                       >
                                          <div className="absolute top-3 right-3 p-1 bg-white/50 rounded-md text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity z-10" title="Arrastrar para reordenar">
                                            <GripVerticalIcon className="w-5 h-5"/>
                                          </div>
                                          {summaryComponents[key]}
                                       </div>
                                    ));
                                })()}
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
                            onAddReply={handleAddReplyToNote}
                            onPinNote={handlePinPartnerNote}
                        />
                    )}
                </>
            )}

            {activeSection === 'travel' && (
              <TravelLog
                trips={trips}
                onSaveTrip={handleSaveTrip}
                onDeleteTrip={handleDeleteTrip}
                onOpenShareModal={handleOpenShareTripModal}
                pairedUser={pairedUser}
                onStartTour={() => setIsTravelTourOpen(true)}
              />
           )}
           
           {activeSection === 'academic' && (
              <AcademicPanel
                semesters={semesters}
                subjects={subjects}
                exams={exams}
                onSaveSemester={handleSaveSemester}
                onDeleteSemester={handleDeleteSemester}
                onSaveSubject={handleSaveSubject}
                onDeleteSubject={handleDeleteSubject}
                onSaveExam={handleSaveExam}
                onDeleteExam={handleDeleteExam}
                onAssignSubject={handleAssignSubject}
                onUnassignSubject={handleUnassignSubject}
                onUpdateSubjectStatusAndGrade={handleUpdateSubjectStatusAndGrade}
                onPromptForGrade={handlePromptForGrade}
                onStartTour={() => setIsAcademicTourOpen(true)}
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
                onStartTour={() => setIsGoalsTourOpen(true)}
              />
            )}
             {activeSection === 'home' && (
                <HomePanel
                    shoppingLists={userShoppingLists}
                    onSaveList={handleSaveShoppingList}
                    onDeleteList={handleDeleteShoppingList}
                    onAddItem={handleAddShoppingListItem}
                    onUpdateItem={handleUpdateShoppingListItem}
                    onDeleteItem={handleDeleteShoppingListItem}
                    onToggleShareList={handleToggleShareList}
                    currentUser={currentUser}
                    pairedUser={pairedUser}
                    onStartTour={() => setIsHomeTourOpen(true)}
                />
            )}
            {activeSection === 'ideas' && (
                <IdeaBoard
                    ideas={ideas}
                    onSaveIdea={handleSaveIdea}
                    onDeleteIdea={handleDeleteIdea}
                    onConvertToProject={handleConvertIdeaToProject}
                    onStartTour={() => setIsIdeasTourOpen(true)}
                />
            )}
        </main>
      </div>

      <PrintableView 
        isOpen={isPrintViewOpen}
        onClose={() => setIsPrintViewOpen(false)}
        events={allEvents}
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
      <GradeEntryModal
        isOpen={isGradeModalOpen}
        onClose={() => {
            setIsGradeModalOpen(false);
            setSubjectForGrade(null);
        }}
        onSave={(grade) => {
            if (subjectForGrade) {
                handleUpdateSubjectStatusAndGrade(subjectForGrade.id, 'aprobada', grade);
            }
            setIsGradeModalOpen(false);
            setSubjectForGrade(null);
        }}
        subjectName={subjectForGrade?.name || ''}
      />
{/* FIX: Replaced truncated/incorrect '<Exam' tag with the full, correct '<ExamGradeModal />' component and reconstructed the missing closing tags for the component. */}
       <ExamGradeModal
        isOpen={isExamGradeModalOpen}
        onClose={() => {
            setIsExamGradeModalOpen(false);
            setExamForGrade(null);
        }}
        onSave={handleSaveExamGrade}
        exam={examForGrade}
        subjectName={subjects.find(s => s.id === examForGrade?.subjectId)?.name || ''}
      />
      <ConfirmationModal
        isOpen={!!confirmationState}
        onClose={() => setConfirmationState(null)}
        onConfirm={() => {
            confirmationState?.onConfirm();
            setConfirmationState(null);
        }}
        title={confirmationState?.title || ''}
        message={confirmationState?.message || ''}
        confirmText={confirmationState?.confirmText}
        cancelText={confirmationState?.cancelText}
      />

        <Tour isOpen={isTourOpen} onClose={() => { setIsTourOpen(false); setIsTourCompleted(true); }} steps={mainTourSteps} />
        <Tour isOpen={isHomeTourOpen} onClose={() => { setIsHomeTourOpen(false); setIsHomeTourCompleted(true); }} steps={homeTourSteps} />
        <Tour isOpen={isGoalsTourOpen} onClose={() => { setIsGoalsTourOpen(false); setIsGoalsTourCompleted(true); }} steps={goalsTourSteps} />
        <Tour isOpen={isAcademicTourOpen} onClose={() => { setIsAcademicTourOpen(false); setIsAcademicTourCompleted(true); }} steps={academicTourSteps} />
        <Tour isOpen={isTravelTourOpen} onClose={() => { setIsTravelTourOpen(false); setIsTravelTourCompleted(true); }} steps={travelTourSteps} />
        <Tour isOpen={isIdeasTourOpen} onClose={() => { setIsIdeasTourOpen(false); setIsIdeasTourCompleted(true); }} steps={ideasTourSteps} />

    </>
  );
}