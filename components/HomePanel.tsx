import React, { useState } from 'react';
import type { ShoppingList, ShoppingListItem } from '../types';

interface HomePanelProps {
    shoppingLists: ShoppingList[];
    onSaveList: (title: string, icon: string, id?: string) => void;
    onDeleteList: (listId: string) => void;
    onAddItem: (listId: string, text: string) => void;
    onUpdateItem: (listId: string, itemId: string, newText: string, newCompleted: boolean) => void;
    onDeleteItem: (listId: string, itemId: string) => void;
}

// Icons
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>);

const listIcons = ['🛒', '🧾', '🛠️', '💊', '🎁', '🐶', '🏠', '💡'];

const ListItem: React.FC<{ listId: string; item: ShoppingListItem; onUpdate: HomePanelProps['onUpdateItem']; onDelete: HomePanelProps['onDeleteItem']; }> = ({ listId, item, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);

    const handleSave = () => {
        if (editText.trim()) {
            onUpdate(listId, item.id, editText.trim(), item.completed);
        } else {
            setEditText(item.text);
        }
        setIsEditing(false);
    };

    return (
        <div className="flex items-center group w-full py-1">
            <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onUpdate(listId, item.id, item.text, !item.completed)}
                className="h-5 w-5 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <div className="ml-3 flex-grow">
                {isEditing ? (
                    <input type="text" value={editText} onChange={e => setEditText(e.target.value)} onBlur={handleSave} onKeyDown={e => e.key === 'Enter' && handleSave()} autoFocus className="w-full bg-transparent p-1 -m-1 border-b border-teal-500 outline-none text-sm"/>
                ) : (
                    <p onDoubleClick={() => setIsEditing(true)} className={`text-sm cursor-pointer ${item.completed ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>{item.text}</p>
                )}
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button onClick={() => setIsEditing(true)} className="p-1 text-zinc-400 hover:text-teal-600 rounded"><PencilIcon className="w-4 h-4"/></button>
                <button onClick={() => onDelete(listId, item.id)} className="p-1 text-zinc-400 hover:text-red-600 rounded"><TrashIcon className="w-4 h-4"/></button>
            </div>
        </div>
    );
};

const ListCard: React.FC<Omit<HomePanelProps, 'shoppingLists' | 'onSaveList' | 'onDeleteList'> & { list: ShoppingList; onEditList: () => void; onDelete: () => void; }> = ({ list, onAddItem, onUpdateItem, onDeleteItem, onEditList, onDelete }) => {
    const [newItemText, setNewItemText] = useState('');
    const [showCompleted, setShowCompleted] = useState(false);

    const pendingItems = list.items.filter(i => !i.completed);
    const completedItems = list.items.filter(i => i.completed);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemText.trim()) {
            onAddItem(list.id, newItemText.trim());
            setNewItemText('');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{list.icon}</span>
                    <h4 className="font-bold text-zinc-800">{list.title}</h4>
                </div>
                <div className="flex items-center">
                     <button onClick={onEditList} className="p-1.5 text-zinc-400 hover:text-teal-600 rounded-md"><PencilIcon className="w-4 h-4"/></button>
                     <button onClick={onDelete} className="p-1.5 text-zinc-400 hover:text-red-600 rounded-md"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
            <div className="flex-grow space-y-1 pr-1 overflow-y-auto max-h-60">
                {pendingItems.length > 0 ? pendingItems.map(item => (
                    <ListItem key={item.id} listId={list.id} item={item} onUpdate={onUpdateItem} onDelete={onDeleteItem} />
                )) : <p className="text-center text-xs text-zinc-400 py-4">¡Todo listo!</p>}
            </div>
            {completedItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-200">
                    <button onClick={() => setShowCompleted(!showCompleted)} className="w-full flex justify-between items-center text-sm font-medium text-zinc-500">
                        <span>Completados ({completedItems.length})</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
                    </button>
                    {showCompleted && (
                        <div className="mt-2 space-y-1">
                            {completedItems.map(item => (
                                <ListItem key={item.id} listId={list.id} item={item} onUpdate={onUpdateItem} onDelete={onDeleteItem} />
                            ))}
                        </div>
                    )}
                </div>
            )}
            <form onSubmit={handleAddItem} className="mt-3 pt-3 border-t border-zinc-200 flex items-center space-x-2">
                <input type="text" value={newItemText} onChange={e => setNewItemText(e.target.value)} placeholder="Añadir elemento..." className="w-full px-3 py-1.5 bg-stone-50 border border-zinc-200 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-teal-500" />
                <button type="submit" className="p-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"><PlusIcon className="w-4 h-4"/></button>
            </form>
        </div>
    );
};

export const HomePanel: React.FC<HomePanelProps> = (props) => {
    const [showForm, setShowForm] = useState(false);
    const [editingList, setEditingList] = useState<ShoppingList | null>(null);
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('🛒');

    const handleOpenForm = (list: ShoppingList | null = null) => {
        setEditingList(list);
        setTitle(list?.title || '');
        setIcon(list?.icon || '🛒');
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingList(null);
        setTitle('');
        setIcon('🛒');
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            props.onSaveList(title.trim(), icon, editingList?.id);
            handleCloseForm();
        }
    };

    return (
        <div className="bg-stone-50/50 p-6 rounded-xl shadow-inner">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-zinc-800">Mi Hogar: Listas y Tareas</h3>
                <button onClick={() => handleOpenForm()} className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-teal-700">
                    <PlusIcon className="w-5 h-5"/>
                    <span>Crear Nueva Lista</span>
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSave} className="mb-6 p-4 bg-white rounded-lg shadow-md border border-zinc-200 space-y-4">
                    <h4 className="font-semibold">{editingList ? 'Editar Lista' : 'Nueva Lista'}</h4>
                     <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Icono</label>
                        <div className="flex flex-wrap gap-2">
                            {listIcons.map(i => (
                                <button key={i} type="button" onClick={() => setIcon(i)} className={`w-10 h-10 text-xl rounded-full transition-all ${icon === i ? 'bg-teal-200 scale-110' : 'hover:bg-zinc-200'}`}>{i}</button>
                            ))}
                        </div>
                     </div>
                     <div>
                        <label htmlFor="list-title" className="block text-sm font-medium text-zinc-700 mb-1">Título</label>
                        <input id="list-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="p. ej. Supermercado" className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                     </div>
                     <div className="flex justify-end space-x-2">
                        <button type="button" onClick={handleCloseForm} className="px-3 py-1.5 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-50">Cancelar</button>
                        <button type="submit" className="px-3 py-1.5 bg-teal-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-teal-700">Guardar</button>
                     </div>
                </form>
            )}

            {props.shoppingLists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {props.shoppingLists.map(list => (
                        <ListCard 
                            key={list.id}
                            list={list}
                            onAddItem={props.onAddItem}
                            onUpdateItem={props.onUpdateItem}
                            onDeleteItem={props.onDeleteItem}
                            onEditList={() => handleOpenForm(list)}
                            onDelete={() => props.onDeleteList(list.id)}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed border-zinc-300 rounded-lg">
                    <div className="mx-auto w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-zinc-400"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                    </div>
                    <h4 className="mt-4 text-lg font-semibold text-zinc-700">Empieza a organizarte</h4>
                    <p className="mt-1 text-sm text-zinc-500">Crea tu primera lista para llevar un registro de todo.</p>
                </div>
            )}
        </div>
    );
};