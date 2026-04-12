import React, { useState } from 'react';
import { Plus, Trash2, User as UserIcon, X } from 'lucide-react';
import { PreAuthorizedUser } from '../types';
import { cn } from '../lib/utils';
import { supabase } from '../supabase';

interface UserManagementProps {
  preAuthorizedUsers: PreAuthorizedUser[];
  fetchData: () => Promise<void>;
}

export const UserManagement = ({ preAuthorizedUsers, fetchData }: UserManagementProps) => {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<PreAuthorizedUser> & { password?: string }>({
    role: 'Officier Logistique',
    organization: 'Ministère de la Défense',
    password: ''
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) {
      alert("Veuillez remplir l'email et le mot de passe.");
      return;
    }
    
    try {
      // 1. Création de l'utilisateur dans Supabase Auth (via Edge Function)
      const { data: authData, error: authError } = await supabase.functions.invoke('create-admin-user', {
        body: { 
          email: newUser.email, 
          password: newUser.password, 
          role: newUser.role, 
          organization: newUser.organization 
        }
      });

      if (authError) {
        console.error('Edge Function Error:', authError);
        alert("Erreur lors de la création du compte Auth : " + authError.message);
        return;
      }

      // 2. Add to pre-authorized list (backup safety)
      const { error: preAuthError } = await supabase.from('pre_authorized_users').upsert({
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });
      
      if (preAuthError) throw preAuthError;

      // 2. Check if user already exists in 'users' table and update their role immediately
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .ilike('email', newUser.email.trim())
        .maybeSingle();

      if (existingUser) {
        await supabase
          .from('users')
          .update({ role: newUser.role })
          .eq('id', existingUser.id);
      }

      setIsAddingUser(false);
      setNewUser({ role: 'Officier Logistique', organization: 'Ministère de la Défense' });
      fetchData();
    } catch (error) {
      console.error('Error adding user:', error);
      alert("Erreur lors de l'ajout de l'utilisateur.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Supprimer cet accès ?")) return;
    try {
      const { error } = await supabase.from('pre_authorized_users').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Gestion des Accès</h3>
          <p className="text-slate-500 text-sm mt-1">Gérez les rôles et autorisations des utilisateurs.</p>
        </div>
        <button 
          onClick={() => setIsAddingUser(true)}
          className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Autorisation
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle / Accréditation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Organisation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preAuthorizedUsers.map(auth => (
                <tr key={auth.id} className="hover:bg-slate-50 transition-colors group text-sm">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-900 truncate max-w-[200px]">{auth.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] lg:text-xs font-bold whitespace-nowrap",
                      auth.role === 'Administrateur' ? "bg-red-100 text-red-700" :
                      auth.role === 'Officier Logistique' ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      {auth.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {auth.organization}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => auth.id && handleDeleteUser(auth.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {preAuthorizedUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Aucun utilisateur autorisé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Nouvel Utilisateur</h3>
              <button onClick={() => setIsAddingUser(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-6">
              <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-xl font-medium border border-blue-100 mb-6">
                Note: En mode production, l'ajout d'un utilisateur ici l'autorise à se connecter. L'utilisateur doit s'inscrire ou être créé dans Supabase Auth par un administrateur.
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email de l'utilisateur</label>
                <input 
                  required
                  type="email" 
                  placeholder="exemple@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                  value={newUser.email || ''}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Mot de passe provisoire</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                  value={newUser.password || ''}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
                <p className="text-[10px] text-slate-400 mt-1 italic">L'utilisateur pourra utiliser ce mot de passe pour sa première connexion.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Niveau d'Accréditation (Rôle)</label>
                <select 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                >
                  <option value="Administrateur">Administrateur</option>
                  <option value="Officier Logistique">Officier Logistique</option>
                  <option value="Consultant">Consultant</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Organisation</label>
                <select 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
                  value={newUser.organization}
                  onChange={e => setNewUser({...newUser, organization: e.target.value as any})}
                >
                  <option value="Ministère de la Défense">Ministère de la Défense</option>
                  <option value="Forces Armées d'Haïti">Forces Armées d'Haïti</option>
                  <option value="Conjoint (Ministère & FAd'H)">Conjoint (Ministère & FAd'H)</option>
                </select>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                  Autoriser l'utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
