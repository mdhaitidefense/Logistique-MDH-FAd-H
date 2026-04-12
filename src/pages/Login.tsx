import React, { useState } from 'react';
import { Shield, AlertCircle, Lock } from 'lucide-react';

interface LoginProps {
  handleLogin: (e: React.FormEvent, email: string, password: string) => Promise<void>;
  authError: string | null;
}

export const Login = ({ handleLogin, authError }: LoginProps) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    await handleLogin(e, loginEmail, loginPassword);
    setLoginLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-8">
        <div className="bg-white w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100">
          <img 
            src="https://md.gouv.ht/wp-content/uploads/2024/07/IMG-20240704-WA0027-removebg-preview-1-300x300.png" 
            alt="Logo MDH"
            className="w-20 h-20 object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Logistique MDH & FAd'H</h1>
        <p className="text-slate-500 mb-4">Système de gestion des matériels et mobiliers du Ministère de la Défense d'Haïti.</p>
        
        {authError && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium leading-relaxed">{authError}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              placeholder="votre@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loginLoading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-md disabled:opacity-50"
          >
            {loginLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Se connecter
              </>
            )}
          </button>
        </form>
        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">République d'Haïti</p>
      </div>
    </div>
  );
};
