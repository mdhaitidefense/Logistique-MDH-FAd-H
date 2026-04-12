import React, { ReactNode } from 'react';
import { 
  LayoutDashboard, Package, Truck, Users, BarChart3, Brain, LogOut, Shield, X
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, collapsed, onClick }: NavItemProps) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 p-3 rounded-xl transition-all",
      active ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:bg-white/5 hover:text-white"
    )}
  >
    {icon}
    {!collapsed && <span>{label}</span>}
  </button>
);

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isAdmin: boolean;
  handleLogout: () => void;
}

export const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, isAdmin, handleLogout }: SidebarProps) => {
  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "bg-slate-900 text-white transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 h-screen",
        isSidebarOpen ? "w-72 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg shrink-0">
              <img 
                src="https://md.gouv.ht/wp-content/uploads/2024/07/IMG-20240704-WA0027-removebg-preview-1-300x300.png" 
                alt="Logo MDH"
                className="w-8 h-8 lg:w-10 lg:h-10 object-contain"
              />
            </div>
            {isSidebarOpen && <span className="font-bold text-lg leading-tight tracking-tight truncate">Logistique MDH</span>}
          </div>
          
          {/* Close button for mobile */}
          {isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-slate-400"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Tableau de Bord" 
            active={activeTab === 'dashboard'} 
            collapsed={!isSidebarOpen}
            onClick={() => handleTabClick('dashboard')}
          />
          <NavItem 
            icon={<Package />} 
            label="Inventaire" 
            active={activeTab === 'inventory'} 
            collapsed={!isSidebarOpen}
            onClick={() => handleTabClick('inventory')}
          />
          <NavItem 
            icon={<Truck />} 
            label="Mouvements" 
            active={activeTab === 'movements'} 
            collapsed={!isSidebarOpen}
            onClick={() => handleTabClick('movements')}
          />
          <NavItem 
            icon={<Users />} 
            label="Unités" 
            active={activeTab === 'units'} 
            collapsed={!isSidebarOpen}
            onClick={() => handleTabClick('units')}
          />
          <NavItem 
            icon={<BarChart3 />} 
            label="Rapports" 
            active={activeTab === 'reports'} 
            collapsed={!isSidebarOpen}
            onClick={() => handleTabClick('reports')}
          />
          <NavItem 
            icon={<Brain />} 
            label="Analyse IA" 
            active={activeTab === 'ai_analysis'} 
            collapsed={!isSidebarOpen}
            onClick={() => handleTabClick('ai_analysis')}
          />
          {isAdmin && (
            <NavItem 
              icon={<Users />} 
              label="Utilisateurs" 
              active={activeTab === 'user_management'} 
              collapsed={!isSidebarOpen}
              onClick={() => handleTabClick('user_management')}
            />
          )}
        </nav>


        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
          >
            <LogOut className="w-6 h-6" />
            {isSidebarOpen && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
