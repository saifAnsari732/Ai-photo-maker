import { useState, useCallback } from 'react';

let toastId = 0;
let addToastFn = null;

export const showToast = (message, type = 'success') => {
  if (addToastFn) addToastFn(message, type);
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  addToastFn = useCallback((message, type) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  
  const colors = {
    success: { background: '#4caf50', color: 'white' },
    error: { background: '#f44336', color: 'white' },
    warning: { background: '#ff9800', color: 'white' }
  };

  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:10 }}>
      {toasts.map(t => (
        <div 
          key={t.id} 
          className={`toast ${t.type}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '4px',
            minWidth: '200px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            ...colors[t.type]
          }}
        >
          <span>{icons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}