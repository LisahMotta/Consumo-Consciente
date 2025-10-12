// src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Verificar atualizações a cada 1 hora
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.log('❌ Erro ao registrar Service Worker:', error);
      });
  });
}

// Garante que o elemento root existe no HTML
const rootElement = document.getElementById('root') as HTMLElement

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
