import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Trip, TripHighlight, User } from '../types';
import { TripFormModal } from './TripFormModal';
import { HighlightFormModal } from './HighlightFormModal';
import { v4 as uuidv4 } from 'uuid';

interface TravelLogProps {
    trips: Trip[];
    onSaveTrip: (trip: Trip) => void;
    onDeleteTrip: (tripId: string) => void;
    onOpenShareModal: (trip: Trip) => void;
    pairedUser: User | null;
    onStartTour: () => void;
}

// Icons remain the same as they are functional
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);
const ArrowUturnLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
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
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);
const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);
const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.195.025.39.05.588.082a2.25 2.25 0 0 1 2.829 2.829.096.096 0 0 0 .082.082m0 0a2.25 2.25 0 1 0 2.186 0m-2.186 0a2.25 2.25 0 0 0-2.829-2.829.096.096 0 0 1-.082-.082m0 0a2.25 2.25 0 1 0 0-2.186m0 2.186c-.195-.025-.39-.05-.588-.082a2.25 2.25 0 0 1-2.829-2.829.096.096 0 0 0-.082-.082" />
    </svg>
);
const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
  </svg>
);

const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return `${startDate.toLocaleDateString('es-ES', options)} - ${endDate.toLocaleDateString('es-ES', options)}`;
};

type Suggestion = {
    title: string;
    description: string;
    emotion: string;
};

export const TravelLog: React.FC<TravelLogProps> = ({ trips, onSaveTrip, onDeleteTrip, onOpenShareModal, pairedUser, onStartTour }) => {
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [isTripFormOpen, setTripFormOpen] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

    const [isHighlightFormOpen, setHighlightFormOpen] = useState(false);
    const [editingHighlight, setEditingHighlight] = useState<TripHighlight | null>(null);
    
    const [suggestionPrompt, setSuggestionPrompt] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [geminiError, setGeminiError] = useState('');


    const handleEditTrip = (e: React.MouseEvent, trip: Trip) => {
        e.stopPropagation();
        setEditingTrip(trip);
        setTripFormOpen(true);
    };
    
    const handleAddNewTrip = () => {
        setEditingTrip(null);
        setTripFormOpen(true);
    };

    const handleSaveTripForm = (tripData: Omit<Trip, 'id' | 'highlights'>, id?: string) => {
        if (id) { // Editing
            const originalTrip = trips.find(t => t.id === id);
            if (originalTrip) {
                onSaveTrip({ ...originalTrip, ...tripData });
                setSelectedTrip(prev => prev ? { ...prev, ...tripData } : null);
            }
        } else { // Creating
            const newTrip: Trip = { ...tripData, id: uuidv4(), highlights: [] };
            onSaveTrip(newTrip);
        }
        setTripFormOpen(false);
        setEditingTrip(null);
    };

    const handleSaveHighlightForm = (highlightData: Omit<TripHighlight, 'id'>, id?: string) => {
        if (!selectedTrip) return;

        let updatedHighlights: TripHighlight[];

        if (id) { // Editing
            updatedHighlights = selectedTrip.highlights.map(h => 
                h.id === id ? { ...h, ...highlightData } : h
            );
        } else { // Creating
            const newHighlight: TripHighlight = { ...highlightData, id: uuidv4() };
            updatedHighlights = [...selectedTrip.highlights, newHighlight];
        }
        
        const updatedTrip = { ...selectedTrip, highlights: updatedHighlights.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) };
        onSaveTrip(updatedTrip);
        setSelectedTrip(updatedTrip);
        setHighlightFormOpen(false);
        setEditingHighlight(null);
    };
    
    const handleDeleteHighlight = (highlight: TripHighlight) => {
        if (!selectedTrip) return;
        const updatedHighlights = selectedTrip.highlights.filter(h => h.id !== highlight.id);
        const updatedTrip = { ...selectedTrip, highlights: updatedHighlights };
        onSaveTrip(updatedTrip);
        setSelectedTrip(updatedTrip);
    };

    const requestTripDeletion = (trip: Trip) => {
        onDeleteTrip(trip.id);
        setSelectedTrip(null);
    };
    
    const handleAddSuggestionAsHighlight = (suggestion: Suggestion) => {
         if (!selectedTrip) return;
         const newHighlight: Omit<TripHighlight, 'id'> = {
            date: new Date().toISOString().split('T')[0],
            title: suggestion.title,
            description: suggestion.description,
            emotion: suggestion.emotion,
         };
         handleSaveHighlightForm(newHighlight);
         setSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
    }

    const getSuggestions = useCallback(async () => {
        if (!selectedTrip || !suggestionPrompt.trim() || !process.env.API_KEY) {
             setGeminiError("Por favor, introduce un tema para las sugerencias.");
             return;
        }

        setIsGenerating(true);
        setGeminiError('');
        setSuggestions([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'Un título corto y atractivo para la actividad.' },
                        description: { type: Type.STRING, description: 'Una descripción breve de la actividad.' },
                        emotion: { type: Type.STRING, description: 'Un único emoji que represente la emoción de la experiencia (ej: 🤩, 😋, 😌).' }
                    },
                    required: ["title", "description", "emotion"]
                }
            };
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Eres un asistente de viajes experto. Para un viaje a ${selectedTrip.destination}, sugiere 3 actividades o recuerdos relacionados con el tema "${suggestionPrompt}". Céntrate en experiencias únicas e interesantes, incluyendo un emoji que represente la emoción de la experiencia. Devuelve la respuesta como un array JSON que se ajuste al esquema proporcionado.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            
            const jsonStr = response.text.trim();
            const result = JSON.parse(jsonStr);
            setSuggestions(result);

        } catch (e) {
            console.error(e);
            setGeminiError("No se pudieron generar sugerencias. Inténtalo de nuevo.");
        } finally {
            setIsGenerating(false);
        }

    }, [selectedTrip, suggestionPrompt]);


    if (selectedTrip) {
        return (
            <>
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md scrapbook-background">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <button onClick={() => setSelectedTrip(null)} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-2">
                            <ArrowUturnLeftIcon className="w-4 h-4 mr-1"/> Volver a todos los viajes
                            </button>
                            <h2 className="text-3xl font-bold text-slate-800 font-handwriting">{selectedTrip.title}</h2>
                            <p className="text-lg text-slate-500 flex items-center mt-1">
                                <MapPinIcon className="w-5 h-5 mr-2 text-slate-400"/> {selectedTrip.destination}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">{formatDateRange(selectedTrip.startDate, selectedTrip.endDate)}</p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 mt-2">
                            {pairedUser && (
                                <button onClick={() => onOpenShareModal(selectedTrip)} title="Compartir viaje" className="p-2 text-slate-500 hover:text-green-600 rounded-md hover:bg-slate-100">
                                    <ShareIcon className="w-5 h-5" />
                                </button>
                            )}
                            <button onClick={(e) => handleEditTrip(e, selectedTrip)} className="p-2 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => requestTripDeletion(selectedTrip)} className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100">
                            <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>

                    {selectedTrip.notes && <p className="mt-4 mb-6 text-slate-600 bg-white/70 p-4 rounded-lg italic text-center text-lg font-handwriting">"{selectedTrip.notes}"</p>}
                    
                    <div className="border-t border-slate-200 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-slate-700">Recuerdos del Viaje</h3>
                            <button id="travel-add-highlight-btn" onClick={() => { setEditingHighlight(null); setHighlightFormOpen(true); }} className="flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                                <PlusIcon className="w-5 h-5"/>
                                <span>Añadir Recuerdo</span>
                            </button>
                        </div>
                        
                        <div id="ai-highlight-suggester" className="my-6 p-4 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-lg">
                            <h4 className="font-semibold text-indigo-800 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-indigo-500"/>Asistente de Viajes</h4>
                            <p className="text-sm text-indigo-700 mt-1">¿Necesitas inspiración? Pide sugerencias de recuerdos para tu viaje.</p>
                            <div className="mt-3 flex items-center space-x-2">
                                <input 
                                    type="text" 
                                    value={suggestionPrompt}
                                    onChange={e => setSuggestionPrompt(e.target.value)}
                                    placeholder="p. ej., 'comida local', 'museos'"
                                    className="w-full px-3 py-1.5 border border-indigo-200 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button onClick={getSuggestions} disabled={isGenerating} className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                                    {isGenerating ? 'Generando...' : 'Sugerir'}
                                </button>
                            </div>
                            {geminiError && <p className="text-sm text-red-600 mt-2">{geminiError}</p>}
                            {suggestions.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {suggestions.map((s, i) => (
                                        <div key={i} className="p-3 bg-white rounded-md flex justify-between items-start shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl mt-0.5">{s.emotion}</span>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{s.title}</p>
                                                    <p className="text-sm text-slate-600">{s.description}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleAddSuggestionAsHighlight(s)} className="text-xs font-bold text-indigo-600 hover:underline ml-2 flex-shrink-0">Añadir</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedTrip.highlights.length > 0 ? (
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 items-start">
                                {selectedTrip.highlights.map((h, index) => (
                                    <div key={h.id} id={index === 0 ? 'highlight-card-example' : undefined} className="group relative">
                                        <div className={`bg-white p-3 pb-4 shadow-xl border-4 border-white transition-transform duration-300 group-hover:scale-105 group-hover:rotate-0 ${index % 4 === 0 ? 'rotate-2' : index % 4 === 1 ? '-rotate-3' : index % 4 === 2 ? 'rotate-1' : '-rotate-2'}`}>
                                            {h.photo && (
                                                <div className="mb-3 bg-slate-100">
                                                    <img src={h.photo} alt={h.title} className="w-full h-48 object-cover" />
                                                </div>
                                            )}
                                            <div className="text-center px-2">
                                                <p className="text-sm text-slate-500">{new Date(h.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}</p>
                                                <div className="flex items-center justify-center gap-2 mt-1">
                                                    {h.emotion && <span className="text-2xl">{h.emotion}</span>}
                                                    <p className="font-bold text-slate-800 text-xl font-handwriting">{h.title}</p>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-600 text-left whitespace-pre-wrap">{h.description}</p>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button onClick={() => { setEditingHighlight(h); setHighlightFormOpen(true); }} className="p-1.5 bg-white/80 text-slate-500 hover:text-indigo-600 rounded-full shadow-md">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteHighlight(h)} className="p-1.5 bg-white/80 text-slate-500 hover:text-red-600 rounded-full shadow-md">
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-center text-slate-500 py-8">Aún no has añadido ningún recuerdo a este viaje.</p>}
                    </div>

                    <HighlightFormModal
                        isOpen={isHighlightFormOpen}
                        onClose={() => { setHighlightFormOpen(false); setEditingHighlight(null); }}
                        onSave={handleSaveHighlightForm}
                        highlight={editingHighlight}
                        tripStartDate={selectedTrip.startDate}
                        tripEndDate={selectedTrip.endDate}
                    />
                </div>
            </>
        );
    }


    return (
        <div className="scrapbook-background p-4 sm:p-6 rounded-xl border-4 border-white shadow-inner">
             <style>{`
                .polaroid-card:nth-child(5n+1) { transform: rotate(2deg); }
                .polaroid-card:nth-child(5n+2) { transform: rotate(-3deg); margin-top: 1rem; }
                .polaroid-card:nth-child(5n+3) { transform: rotate(4deg); }
                .polaroid-card:nth-child(5n+4) { transform: rotate(-1.5deg); margin-left: -1rem; }
                .polaroid-card:nth-child(5n+5) { transform: rotate(1deg); }
            `}</style>
            <div id="travel-log-header" className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-slate-800 font-handwriting">Mi Bitácora de Viajes</h2>
                 <div className="flex items-center space-x-2">
                    <button onClick={onStartTour} title="Iniciar tour guiado" className="p-2 text-slate-500 hover:text-yellow-700 rounded-full hover:bg-yellow-100 transition-colors">
                        <QuestionMarkCircleIcon className="w-6 h-6"/>
                    </button>
                    <button id="travel-add-trip-btn" onClick={handleAddNewTrip} className="flex items-center space-x-2 px-4 py-2 bg-yellow-300 text-yellow-900 rounded-md text-sm font-bold shadow-md hover:bg-yellow-400 transition-transform hover:scale-105" style={{transform: 'rotate(5deg)'}}>
                        <PlusIcon className="w-5 h-5"/>
                        <span>Añadir Viaje</span>
                    </button>
                 </div>
            </div>
            
            {trips.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-6 sm:gap-8 p-4">
                    {trips.map((trip, index) => (
                        <div key={trip.id} id={index === 0 ? 'trip-card-example' : undefined} onClick={() => setSelectedTrip(trip)} className="polaroid-card w-56 sm:w-64 bg-white p-3 pb-1 shadow-lg rounded-sm cursor-pointer group transition-transform hover:scale-105 hover:!rotate(0) hover:z-10">
                            <div className="h-40 sm:h-48 bg-slate-200 flex items-center justify-center overflow-hidden">
                               {trip.coverPhoto ? 
                                <img src={trip.coverPhoto} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/> : 
                                <CameraIcon className="w-12 h-12 text-slate-400"/>
                               }
                            </div>
                            <div className="p-3 text-center">
                                <h3 className="font-bold text-lg text-slate-800 font-handwriting truncate">{trip.title}</h3>
                                <p className="text-sm text-slate-500 truncate">{trip.destination}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                     <MapPinIcon className="w-12 h-12 mx-auto text-slate-300"/>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-800 font-handwriting">Tu aventura te espera</h3>
                    <p className="mt-1 text-sm text-slate-500">Añade tu primer viaje para empezar a pegar recuerdos en tu bitácora.</p>
                </div>
            )}

            <TripFormModal 
                isOpen={isTripFormOpen}
                onClose={() => { setTripFormOpen(false); setEditingTrip(null); }}
                onSave={handleSaveTripForm}
                trip={editingTrip}
            />
        </div>
    );
};