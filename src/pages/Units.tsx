import React from 'react';
import { Plus, Users, Info, Edit2, Trash2, MapPin, Package, User as UserIcon } from 'lucide-react';
import { MilitaryUnit } from '../types';

interface UnitsProps {
  units: MilitaryUnit[];
  isAdmin: boolean;
  setIsAddingUnit: (v: boolean) => void;
  setEditingUnit: (u: MilitaryUnit) => void;
  setIsEditingUnit: (v: boolean) => void;
  setViewingUnit: (u: MilitaryUnit) => void;
  setIsViewingUnit: (v: boolean) => void;
  handleDeleteUnit: (id: string) => void;
}

export const Units = ({ units, isAdmin, setIsAddingUnit, setEditingUnit, setIsEditingUnit, setViewingUnit, setIsViewingUnit, handleDeleteUnit }: UnitsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Unités et Branches Militaires (FAd'H)</h3>
        {isAdmin && (
          <button 
            onClick={() => setIsAddingUnit(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Unité
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <div 
            key={unit.id} 
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer relative"
            onClick={() => {
              setViewingUnit(unit);
              setIsViewingUnit(true);
            }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-56 pointer-events-none">
              <div className="bg-slate-900 text-white text-[11px] p-4 rounded-2xl shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                  <Info className="w-3 h-3 text-indigo-400" />
                  <span className="font-black uppercase tracking-widest">Détails de l'Unité</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Commandant:</span>
                    <span className="font-bold text-indigo-300">{unit.commander || 'Non assigné'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Effectif:</span>
                    <span className="font-bold text-emerald-400">{unit.personnelCount || 0} membres</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Localisation:</span>
                    <span className="font-bold">{unit.location || 'N/A'}</span>
                  </div>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
              </div>
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-slate-900" />
              </div>
              {isAdmin && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => {
                      setEditingUnit(unit);
                      setIsEditingUnit(true);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => unit.id && handleDeleteUnit(unit.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">{unit.name}</h4>
            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded mb-4">
              {unit.branch}
            </span>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{unit.location || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>Cmd: {unit.commander || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                <span>Personnel: {unit.personnelCount || 0}</span>
              </div>
            </div>
          </div>
        ))}
        {units.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-slate-400">
            Aucune unité trouvée.
          </div>
        )}
      </div>
    </div>
  );
};
