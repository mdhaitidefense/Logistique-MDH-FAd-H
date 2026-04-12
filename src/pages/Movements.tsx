import React from 'react';
import { ArrowRightLeft, Settings } from 'lucide-react';
import { Movement } from '../types';
import { cn } from '../lib/utils';

interface MovementsProps {
  movements: Movement[];
  isAdmin: boolean;
  setIsAddingMovement: (v: boolean) => void;
  setIsEditingMovement: (v: boolean) => void;
  setEditingMovement: (m: Movement) => void;
  handleDeleteMovement: (id: string) => void;
}

export const Movements = ({ 
  movements, 
  isAdmin, 
  setIsAddingMovement, 
  setIsEditingMovement,
  setEditingMovement,
  handleDeleteMovement
}: MovementsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Historique des Mouvements</h3>
        {isAdmin && (
          <button 
            onClick={() => setIsAddingMovement(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-md"
          >
            <ArrowRightLeft className="w-5 h-5" />
            Enregistrer un Mouvement
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Article</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Quantité</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Origine</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Départ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{m.itemName}</td>
                  <td className="px-6 py-4 font-mono">{m.quantity}</td>
                  <td className="px-6 py-4 text-sm">{m.originUnit}</td>
                  <td className="px-6 py-4 text-sm">{m.destinationUnit}</td>
                  <td className="px-6 py-4 text-sm">{m.departureDate}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      m.status === 'Livré' ? "bg-emerald-100 text-emerald-700" : 
                      m.status === 'En transit' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                    )}>
                      {m.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setEditingMovement(m);
                          setIsEditingMovement(true);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        title="Modifier le mouvement"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Aucun mouvement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
