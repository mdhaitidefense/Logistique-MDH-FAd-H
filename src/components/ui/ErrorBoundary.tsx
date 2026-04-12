import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Une erreur est survenue.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error && parsed.error.includes("insufficient permissions")) {
          errorMessage = "Erreur de permissions. Veuillez contacter l'administrateur.";
        }
      } catch (e) {
        // Not a JSON error
      }
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Oups !</h2>
            <p className="text-slate-600 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
