import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebaseConfig';

interface AuthContextType {
    user: FirebaseUser | null;
    loading: boolean;
    handleRegister: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    handleLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleRegister = async (name: string, email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: name });
                // Manually update user state because onAuthStateChanged can be slow
                setUser({ ...userCredential.user, displayName: name });
            }
            return { success: true };
        } catch (error: any) {
            // Firebase provides user-friendly error messages
            let message = "Ocurrió un error al registrarse.";
            if (error.code === 'auth/email-already-in-use') {
                message = 'Este correo electrónico ya está en uso.';
            } else if (error.code === 'auth/weak-password') {
                message = 'La contraseña debe tener al menos 6 caracteres.';
            }
            return { success: false, message: message };
        }
    };

    const handleLogin = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error: any) {
            let message = "Ocurrió un error al iniciar sesión.";
             if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = 'El correo electrónico o la contraseña son incorrectos.';
            }
            return { success: false, message: message };
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const value = {
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
