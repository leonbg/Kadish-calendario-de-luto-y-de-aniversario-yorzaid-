import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('Root application error:', error, errorInfo);
  }

  handleRecover = () => {
    try {
      sessionStorage.removeItem('kaddish_calculator_open');
      sessionStorage.removeItem('kaddish_family_calendar_open');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fdfbf7] text-stone-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-amber-300 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <h1 className="text-lg font-bold text-stone-900">
              Kadish y Yurzaid
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              Se produjo una interrupción temporal al cargar la vista. Tus datos familiares están seguros.
            </p>
            <button
              type="button"
              onClick={this.handleRecover}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
            >
              Continuar a la aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>
  );
}

// Register lightweight Service Worker after initial load with updateViaCache: 'none'
// so server updates to components and manifests are always picked up immediately
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    window.setTimeout(() => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch(() => {
          // Ignore registration errors in restricted preview iframes
        });
    }, 800);
  });
}


