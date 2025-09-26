import React, { useState, useMemo } from 'react';
import type { Goal } from '../types';

interface GoalsPanelProps {
  weeklyGoals: Goal[];
  monthlyGoals: Goal[];
  annualGoals: Goal[];
  onAddGoal: (text: string, period: 'weekly' | 'monthly' | 'annual') => void;
  onToggleGoal: (id: string, period: 'weekly' | 'monthly' | 'annual') => void;
  onDeleteGoal: (id: string, period: 'weekly' | 'monthly' | 'annual') => void;
}

type Period = 'weekly' | 'monthly' | 'annual';

const CheckBadgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const GoalItem: React.FC<{ goal: Goal; onToggle: () => void; onDelete: () => void; }> = ({ goal, onToggle, onDelete }) => {
  return (
    <li className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group">
      <div className="flex items-center flex-grow min-w-0">
        <input
          id={`goal-${goal.id}`}
          type="checkbox"
          checked={goal.completed}
          onChange={onToggle}
          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label
          htmlFor={`goal-${goal.id}`}
          className={`ml-3 text-sm font-medium flex-grow truncate cursor-pointer ${goal.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}
        >
          {goal.text}
        </label>
      </div>
      <button onClick={onDelete} aria-label={`Eliminar objetivo ${goal.text}`} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
        <TrashIcon className="w-4 h-4" />
      </button>
    </li>
  );
};


export const GoalsPanel: React.FC<GoalsPanelProps> = ({
  weeklyGoals,
  monthlyGoals,
  annualGoals,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
}) => {
  const [activeTab, setActiveTab] = useState<Period>('weekly');
  const [newGoalText, setNewGoalText] = useState('');

  const goalsMap = {
    weekly: weeklyGoals,
    monthly: monthlyGoals,
    annual: annualGoals,
  };

  const tabs = [
    { id: 'weekly', name: 'Semanal' },
    { id: 'monthly', name: 'Mensual' },
    { id: 'annual', name: 'Anual' },
  ];

  const currentGoals = goalsMap[activeTab];

  const progress = useMemo(() => {
    const total = currentGoals.length;
    if (total === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = currentGoals.filter(g => g.completed).length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  }, [currentGoals]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      onAddGoal(newGoalText.trim(), activeTab);
      setNewGoalText('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <CheckBadgeIcon className="w-6 h-6 text-indigo-500" />
        <h3 className="text-xl font-semibold text-slate-700">Mis Metas y Objetivos</h3>
      </div>

      <div className="border-b border-slate-200 mb-4">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Period)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {progress.total > 0 && (
            <div className="mb-4">
                <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-1">
                    <span>Progreso</span>
                    <span>{progress.completed} / {progress.total} completados</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                        className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progress.percentage}%` }}>
                    </div>
                </div>
            </div>
        )}

        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {currentGoals.length > 0 ? (
                currentGoals.map(goal => (
                    <GoalItem 
                        key={goal.id} 
                        goal={goal} 
                        onToggle={() => onToggleGoal(goal.id, activeTab)}
                        onDelete={() => onDeleteGoal(goal.id, activeTab)}
                    />
                ))
            ) : (
                <p className="text-center text-slate-500 py-8">Aún no has añadido objetivos para este periodo. ¡Empieza ahora!</p>
            )}
        </ul>

         <form onSubmit={handleAdd} className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="Añadir nuevo objetivo..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:bg-indigo-300 flex-shrink-0">
            <PlusIcon className="w-5 h-5"/>
          </button>
        </form>
      </div>
    </div>
  );
};
