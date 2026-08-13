import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import '@fontsource/noto-sans-myanmar/400.css';
import '@fontsource/noto-sans-myanmar/700.css';
import './styles/globals.css';
import { LanguageProvider } from './hooks/useLanguage';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}><LanguageProvider><App /></LanguageProvider></QueryClientProvider>
  </React.StrictMode>,
);
