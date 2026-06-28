import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {enableMocking} from './mocks/enableMocking';

// Arranca los mocks MSW solo si VITE_USE_MOCKS=true; si no, resuelve al instante.
enableMocking().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

// PWA: registra el service worker solo en producción (evita cache molesto en dev)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* registro fallido: la app sigue funcionando sin offline */
    });
  });
}
