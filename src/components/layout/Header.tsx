import React, { useState } from 'react';
import { Menu, User as UserIcon, Plus, Settings } from 'lucide-react';
import { UserProfile } from '../../types';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: string;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  setIsAddingCategory: (v: boolean) => void;
  setIsAddingTransport: (v: boolean) => void;
}

export const Header = ({ isSidebarOpen, setIsSidebarOpen, activeTab, userProfile, isAdmin, setIsAddingCategory, setIsAddingTransport }: HeaderProps) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 w-full">
      <div className="flex items-center gap-2 lg:gap-4 overflow-hidden">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 shrink-0"
        >
          <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
        <h2 className="text-base lg:text-xl font-bold text-slate-900 truncate">
          {activeTab === 'dashboard' && 'Tableau de Bord'}
          {activeTab === 'inventory' && 'Inventaire'}
          {activeTab === 'movements' && 'Mouvements'}
          {activeTab === 'units' && 'Unités'}
          {activeTab === 'reports' && 'Rapports'}
          {activeTab === 'ai_analysis' && 'Analyse IA'}
          {activeTab === 'user_management' && 'Utilisateurs'}
        </h2>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {isAdmin && (
          <div className="relative">
            <button 
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 flex items-center gap-2"
              title="Paramètres avancés"
            >
              <Settings className="w-5 h-5" />
            </button>
            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-48 lg:w-56 bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-50">
                <button 
                  onClick={() => { setIsAddingCategory(true); setShowSettingsMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Catégorie
                </button>
                <button 
                  onClick={() => { setIsAddingTransport(true); setShowSettingsMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Transport
                </button>
              </div>
            )}
          </div>
        )}
        <div className="text-right hidden md:block ml-2 overflow-hidden">
          <p className="text-xs lg:text-sm font-bold text-slate-900 truncate max-w-[120px] lg:max-w-none">
            {userProfile?.full_name || 'Utilisateur'}
          </p>
          <p className="text-[10px] lg:text-xs text-slate-500 truncate max-w-[120px] lg:max-w-none">
            {userProfile?.role || 'Consultant'}
          </p>
        </div>
        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-slate-100 bg-slate-900 flex items-center justify-center cursor-pointer shrink-0">
          <UserIcon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
        </div>
      </div>
    </header>
  );
};
