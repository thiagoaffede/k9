import { createContext, useContext } from 'react';

// Contexto del sistema de avisos. Vive aparte de Feedback.jsx para que ese
// archivo solo exporte componentes (regla react-refresh/only-export-components).

export const FeedbackContext = createContext(null);

export const useFeedback = () => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback debe usarse dentro de <FeedbackProvider>');
  return ctx;
};
