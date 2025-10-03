// This component provides UI for user authentication actions.
import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';

// Reusable PIN Input component
const PinInput: React.FC<{
  length: number;
  value: string;
  onChange: (pin: string) => void;
  error?: boolean;
}> = ({ length, value, onChange, error }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pinArray = value.split('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value;
    // Allow only single digits
    if (/^[0-9]$/.test(inputValue) || inputValue === '') {
      const newPinArray = [...pinArray];
      // Ensure array is of correct length to avoid out-of-bounds
      while (newPinArray.length < length) newPinArray.push('');
      
      newPinArray[index] = inputValue;
      const newPin = newPinArray.slice(0, length).join('');
      onChange(newPin);

      // Move focus to next input if a digit is entered
      if (inputValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move focus to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !pinArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  // Ensure refs array is always the correct size
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
          ref={(el) => { inputRefs.current[index] = el; }}
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


interface UserAuthProps {
  users: User[];
  onLogin: (userId: string, pin: string) => boolean;
  onCreateUser: (name: string) => User;
}

type AuthScreen = 'select_user' | 'create_user' | 'enter_pin' | 'set_pin';

export const UserAuth: React.FC<UserAuthProps> = ({ users, onLogin, onCreateUser }) => {
  const [screen, setScreen] = useState<AuthScreen>('select_user');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const [newUserName, setNewUserName] = useState('');

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setError('');
    setPin('');
    if (user.pin) {
      setScreen('enter_pin');
    } else {
      setScreen('set_pin');
    }
  };
  
  const handleBack = () => {
      setSelectedUser(null);
      setError('');
      setPin('');
      setConfirmPin('');
      setNewUserName('');
      setScreen('select_user');
  }
  
  const handlePinChange = (value: string) => {
      setPin(value);
      setError('');
      if (screen === 'enter_pin' && value.length === 4) {
          setTimeout(() => handleSubmitPin(value), 100);
      }
  };
  
  const handleSubmitPin = (pinValue: string) => {
    if (!selectedUser) return;
    const success = onLogin(selectedUser.id, pinValue);
    if (!success) {
      setError('PIN incorrecto. Por favor, intenta de nuevo.');
      setPin('');
    }
  };
  
  const handleSetPin = () => {
      if (pin.length !== 4) {
          setError('El PIN debe tener 4 dígitos.');
          return;
      }
      if (pin !== confirmPin) {
          setError('Los PIN no coinciden.');
          return;
      }
      onLogin(selectedUser!.id, pin);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      const newUser = onCreateUser(newUserName.trim());
      handleSelectUser(newUser);
    }
  };

  const renderPinScreen = (isSetup: boolean) => (
    <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-800">Hola, {selectedUser?.name}</h1>
            <p className="text-zinc-600 mt-2">
                {isSetup ? 'Crea un PIN de 4 dígitos para proteger tu cuenta.' : 'Ingresa tu PIN para continuar.'}
            </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="space-y-4">
                <div>
                    <label className="block text-center text-sm font-medium text-zinc-700 mb-2">
                        {isSetup ? 'Nuevo PIN' : 'Tu PIN'}
                    </label>
                    <PinInput length={4} value={pin} onChange={handlePinChange} error={!!error}/>
                </div>
                {isSetup && (
                     <div>
                        <label className="block text-center text-sm font-medium text-zinc-700 mb-2">Confirmar PIN</label>
                        <PinInput length={4} value={confirmPin} onChange={setConfirmPin} />
                    </div>
                )}
            </div>
             {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}
             <div className="mt-6 flex items-center justify-between">
                 <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm font-medium text-teal-600 hover:text-teal-800"
                >
                    Volver
                </button>
                {isSetup && (
                    <button
                        type="button"
                        onClick={handleSetPin}
                        className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Guardar y Entrar
                    </button>
                )}
            </div>
        </div>
    </div>
  );


  const renderSelectUserScreen = () => (
     <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <img src="https://i.postimg.cc/YhvKDdRc/Logo-for-Conecta-Mente-Clean-Sans-Serif-Abstract-Design.png" alt="ConectaMente Logo" className="h-24 sm:h-32 w-auto mb-6 mx-auto shadow-lg rounded-full drop-shadow-lg" />
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-800">Bienvenido/a a ConectaMente</h1>
            <p className="text-zinc-600 mt-2">Selecciona un perfil para continuar o crea uno nuevo.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-zinc-700 mb-4">Perfiles Existentes</h2>
            {users.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                {users.map(user => (
                    <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full p-4 bg-zinc-100 rounded-lg text-zinc-800 font-semibold hover:bg-teal-100 hover:text-teal-700 transition-colors"
                    >
                    {user.name}
                    </button>
                ))}
                </div>
            ) : (
                <p className="text-center text-sm text-zinc-500 py-4">No hay perfiles. ¡Crea el primero!</p>
            )}
             <div className="mt-8 pt-6 border-t border-zinc-200">
                <button
                    onClick={() => setScreen('create_user')}
                    className="w-full px-4 py-2 bg-teal-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-teal-700"
                >
                    Crear Nuevo Perfil
                </button>
            </div>
        </div>
    </div>
  );
  
  const renderCreateUserScreen = () => (
     <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-800">Crear Perfil</h1>
            <p className="text-zinc-600 mt-2">Introduce tu nombre. Configurarás tu PIN en el siguiente paso.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-md">
            <form onSubmit={handleCreate} className="space-y-4">
                <div>
                    <label htmlFor="new-name" className="block text-sm font-medium text-zinc-700 mb-1">Tu nombre</label>
                    <input 
                        type="text"
                        id="new-name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Nombre de usuario"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        autoFocus
                    />
                </div>
                <div className="flex items-center justify-between pt-2">
                    <button type="button" onClick={handleBack} className="text-sm font-medium text-teal-600 hover:text-teal-800">
                        Volver
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-teal-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:bg-teal-300"
                        disabled={!newUserName.trim()}
                    >
                        Siguiente: Crear PIN
                    </button>
                </div>
            </form>
        </div>
    </div>
  );

  const renderContent = () => {
      switch(screen) {
          case 'enter_pin':
              return renderPinScreen(false);
          case 'set_pin':
              return renderPinScreen(true);
          case 'create_user':
              return renderCreateUserScreen();
          case 'select_user':
          default:
              return renderSelectUserScreen();
      }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col justify-center items-center p-4">
        {renderContent()}
      </main>
      <footer className="flex-shrink-0">
        <svg className="w-0 h-0 absolute">
          <defs>
            <clipPath id="torn-edge-clip" clipPathUnits="objectBoundingBox">
              <path d="M0,0.1 C0.05,0.05, 0.1,0.15, 0.15,0.1 C0.2,0.02, 0.25,0.12, 0.3,0.1 C0.35,0.05, 0.4,0.15, 0.45,0.1 C0.5,0.05, 0.55,0.15, 0.6,0.1 C0.65,0.02, 0.7,0.12, 0.75,0.1 C0.8,0.05, 0.85,0.15, 0.9,0.1 C0.95,0.05, 1,0.15, 1,0.1 V1 H0 Z" />
            </clipPath>
          </defs>
        </svg>
        <style>{`
          .text-shadow-subtle {
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .torn-edge-clip {
            clip-path: url(#torn-edge-clip);
            filter: drop-shadow(0 -6px 4px rgba(0,0,0,0.05));
          }
        `}</style>
        <div className="torn-edge-clip bg-[#fdfaf6] pt-12 pb-6">
          <blockquote className="max-w-prose mx-auto text-stone-700 font-handwriting text-lg sm:text-xl text-center text-shadow-subtle px-4">
            <p>"Nunca te olvides que solo existe el hoy. ¿Por qué dejar todo para mañana? Viví la vida que querés y que merecés. Por ende, una vida hermosa, llena de disfrute, felicidad y aprendizaje."</p>
            <footer className="text-right mt-2 font-bold">- V.C</footer>
          </blockquote>
        </div>
      </footer>
    </div>
  );
};
