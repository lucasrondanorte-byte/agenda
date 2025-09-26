// This component provides UI for user authentication actions.
import React, { useState } from 'react';
import type { User } from '../types';

interface UserAuthProps {
  users: User[];
  onLogin: (userId: string) => void;
  onCreateUser: (name: string) => void;
}

export const UserAuth: React.FC<UserAuthProps> = ({ users, onLogin, onCreateUser }) => {
  const [newUserName, setNewUserName] = useState('');
  
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      onCreateUser(newUserName.trim());
      setNewUserName('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800">Bienvenido/a</h1>
            <p className="text-slate-600 mt-2">Selecciona un perfil para continuar o crea uno nuevo.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Perfiles de Ejemplo</h2>
            <div className="grid grid-cols-2 gap-4">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => onLogin(user.id)}
                  className="w-full p-4 bg-slate-100 rounded-lg text-slate-800 font-semibold hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                >
                  {user.name}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
                 <h2 className="text-lg font-semibold text-slate-700 mb-4">Crear Nuevo Perfil</h2>
                 <form onSubmit={handleCreate} className="flex space-x-2">
                    <input 
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Tu nombre"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                        disabled={!newUserName.trim()}
                    >
                        Crear
                    </button>
                 </form>
            </div>
        </div>
      </div>
    </div>
  );
};
