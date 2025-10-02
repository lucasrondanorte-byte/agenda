import React from 'react';
import type { ShoppingList } from '../types';

interface HomeSummaryProps {
  shoppingLists: ShoppingList[];
  onNavigate: () => void;
}

const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

export const HomeSummary: React.FC<HomeSummaryProps> = ({ shoppingLists, onNavigate }) => {
    const summaryLists = shoppingLists.slice(0, 4); // Show top 4

    return (
        <div 
            className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={onNavigate}
        >
            <div className="flex items-center gap-3 mb-4">
              <HomeIcon className="w-6 h-6 text-teal-500"/>
              <h3 className="text-xl font-semibold text-zinc-700">Listas del Hogar</h3>
            </div>
            {summaryLists.length > 0 ? (
                <div className="space-y-3">
                    {summaryLists.map(list => {
                        const pendingItems = list.items.filter(item => !item.completed).length;
                        return (
                            <div key={list.id} className="flex items-center gap-3 p-2 bg-stone-50 rounded-md">
                                <span className="text-xl">{list.icon}</span>
                                <div className="flex-grow">
                                    <p className="font-medium text-sm text-zinc-700 truncate">{list.title}</p>
                                </div>
                                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${pendingItems > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                    {pendingItems}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                 <div className="text-center py-6">
                    <p className="text-sm text-zinc-500">Añade listas de compras, cuentas por pagar y más. ¡Haz clic para empezar!</p>
                </div>
            )}
        </div>
    );
};