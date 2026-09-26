import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { EntitlementProvider } from './context/EntitlementContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <EntitlementProvider>
        <App />
      </EntitlementProvider>
    </AuthProvider>
  </StrictMode>,
);
