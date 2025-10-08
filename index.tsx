
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'uuid'; // asegura que uuid esté disponible
import './firebaseConfig'; // importa Firebase sin usarlo directamente, solo inicializa

const container = document.getElementById('root');
if (!container) {
  throw new Error("No se encontró el elemento root");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
