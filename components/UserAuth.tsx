// This component provides UI for user authentication actions.
import React, { useState } from 'react';
import { useAuth } from '../UserAuth';

interface UserAuthProps {
  onLogin: (email: string, password: string) => Promise<{success: boolean, message?: string}>;
  onCreateUser: (name: string, email: string, password: string) => Promise<{success: boolean, message?: string}>;
}

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

export const UserAuth: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { handleLogin, handleRegister } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    let result;
    if (isLoginView) {
        if (!email || !password) {
            setError("Por favor, introduce tu correo y contraseña.");
            setIsLoading(false);
            return;
        }
        result = await handleLogin(email, password);
    } else {
        if (!name || !email || !password) {
            setError("Por favor, completa todos los campos.");
            setIsLoading(false);
            return;
        }
        result = await handleRegister(name, email, password);
    }

    setIsLoading(false);
    if (result && !result.success) {
      setError(result.message || 'Ocurrió un error inesperado.');
    }
  };

  const renderContent = () => (
     <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <img src="https://i.postimg.cc/YhvKDdRc/Logo-for-Conecta-Mente-Clean-Sans-Serif-Abstract-Design.png" alt="ConectaMente Logo" className="h-24 sm:h-32 w-auto mb-6 mx-auto shadow-lg rounded-full drop-shadow-lg" />
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-800">
                {isLoginView ? 'Bienvenido/a de Nuevo' : 'Crea tu Cuenta'}
            </h1>
            <p className="text-zinc-600 mt-2">
                {isLoginView ? 'Inicia sesión para acceder a tu planificador.' : 'Únete a ConectaMente para empezar a organizarte.'}
            </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginView && (
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">Nombre</label>
                        <input 
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">Correo Electrónico</label>
                    <input 
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="password"  className="block text-sm font-medium text-zinc-700 mb-1">Contraseña</label>
                    <input 
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                    />
                </div>

                {error && <p className="text-red-600 text-sm font-medium text-center bg-red-50 p-2 rounded-md">{error}</p>}
                
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center px-4 py-2 bg-teal-600 border border-transparent rounded-md font-semibold text-white shadow-sm hover:bg-teal-700 disabled:bg-teal-400"
                    >
                        {isLoading ? <LoadingSpinner/> : (isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta')}
                    </button>
                </div>
            </form>
            <div className="mt-6 text-center">
                <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="text-sm font-medium text-teal-600 hover:text-teal-800">
                    {isLoginView ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia Sesión'}
                </button>
            </div>
        </div>
    </div>
  );

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