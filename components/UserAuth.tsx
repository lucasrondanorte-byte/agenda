// This component provides UI for user authentication actions.
import React, { useState } from 'react';
import type { User } from '../types';

interface UserAuthProps {
  users: User[];
  onLogin: (userId: string, password: string) => boolean;
  onCreateUser: (name: string, password: string) => void;
}

export const UserAuth: React.FC<UserAuthProps> = ({ users, onLogin, onCreateUser }) => {
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim() && newUserPassword.trim()) {
      onCreateUser(newUserName.trim(), newUserPassword.trim());
      setNewUserName('');
      setNewUserPassword('');
    }
  };
  
  const handleSelectUser = (user: User) => {
    // If user has no password, log them in directly.
    if (!user.password) {
        onLogin(user.id, '');
    } else {
        setSelectedUser(user);
        setLoginError('');
        setLoginPassword('');
    }
  }

  const handleAttemptLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const success = onLogin(selectedUser.id, loginPassword);
    if (!success) {
        setLoginError('Contraseña incorrecta. Por favor, intenta de nuevo.');
        setLoginPassword('');
    }
  }

  if (selectedUser) {
    // Show password login form for the selected user
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
          <div className="w-full max-w-sm">
             <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800">Hola, {selectedUser.name}</h1>
                <p className="text-slate-600 mt-2">Ingresa tu contraseña para continuar.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
                <form onSubmit={handleAttemptLogin}>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <input 
                            type="password"
                            id="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            autoFocus
                        />
                    </div>
                    {loginError && <p className="text-red-600 text-sm mt-2">{loginError}</p>}
                    <div className="mt-6 flex items-center justify-between">
                         <button
                            type="button"
                            onClick={() => setSelectedUser(null)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            Volver
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Ingresar
                        </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
    );
  }

  // Original user selection screen
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800">Bienvenido/a</h1>
            <p className="text-slate-600 mt-2">Selecciona un perfil para continuar o crea uno nuevo.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Perfiles Existentes</h2>
            {users.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                {users.map(user => (
                    <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full p-4 bg-slate-100 rounded-lg text-slate-800 font-semibold hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                    >
                    {user.name}
                    </button>
                ))}
                </div>
            ) : (
                <p className="text-center text-sm text-slate-500 py-4">No hay perfiles. ¡Crea el primero!</p>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200">
                 <h2 className="text-lg font-semibold text-slate-700 mb-4">Crear Nuevo Perfil</h2>
                 <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label htmlFor="new-name" className="block text-sm font-medium text-slate-700 mb-1">Tu nombre</label>
                        <input 
                            type="text"
                            id="new-name"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="Nombre de usuario"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="new-password"className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <input 
                            type="password"
                            id="new-password"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            placeholder="Crea una contraseña"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                        disabled={!newUserName.trim() || !newUserPassword.trim()}
                    >
                        Crear Perfil
                    </button>
                 </form>
            </div>
        </div>
      </div>
    </div>
  );
};