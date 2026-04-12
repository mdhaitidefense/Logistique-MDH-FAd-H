import React, { useState } from 'react';
import { Search, Plus, FileText, Table, MapPin, Settings } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { InventoryItem } from '../types';
import { cn } from '../lib/utils';
import { IconRenderer } from '../components/ui/IconRenderer';

interface InventoryProps {
  items: InventoryItem[];
  isAdmin: boolean;
  setIsAddingItem: (v: boolean) => void;
  setEditingItem: (item: InventoryItem) => void;
  setIsEditingItem: (v: boolean) => void;
}

export const Inventory = ({ items, isAdmin, setIsAddingItem, setEditingItem, setIsEditingItem }: InventoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState<string>('All');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Exact match for organization depending on the dropdown
    const orgValue = filterOrg === 'Ministère de la Défense' ? 'Ministère de la Défense' :
                     filterOrg === 'Forces Armées d\'Haïti' ? 'Forces Armées d\'Haïti' :
                     filterOrg === 'Conjoint (Ministère & FAd\'H)' ? 'Conjoint (Ministère & FAd\'H)' : 'All';

    const matchesOrg = orgValue === 'All' ? true : item.organization === orgValue;

    return matchesSearch && matchesOrg;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Rapport d\'Inventaire Logistique', 14, 15);
    const tableData = filteredItems.map(item => [
      item.name,
      item.organization,
      item.category,
      item.quantity.toString(),
      item.condition,
      item.location
    ]);
    (doc as any).autoTable({
      head: [['Article', 'Organisation', 'Catégorie', 'Quantité', 'État', 'Emplacement']],
      body: tableData,
      startY: 20
    });
    doc.save(`rapport_inventaire_${new Date().getTime()}.pdf`);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredItems.map(item => ({
      "Nom": item.name,
      "Organisation": item.organization,
      "Catégorie": item.category,
      "Numéro de Série": item.serialNumber || 'N/A',
      "Quantité": item.quantity,
      "État": item.condition,
      "Emplacement": item.location,
      "Seuil Min": item.minThreshold,
      "Valeur Estimée": item.estimatedValue || 0,
      "Date Acquisition": item.acquiredDate || 'N/A',
      "Dernier Inventaire": item.lastInventoryDate || 'N/A'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventaire");
    XLSX.writeFile(workbook, `rapport_inventaire_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher un article ou numéro de série..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <select 
            className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900"
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
          >
            <option value="All">Toutes les Organisations</option>
            <option value="Ministère de la Défense">MDH</option>
            <option value="Forces Armées d'Haïti">FAd'H</option>
            <option value="Conjoint (Ministère & FAd'H)">Conjoint</option>
          </select>
          <button 
            onClick={exportToPDF}
            className="bg-white text-slate-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            title="Exporter en PDF"
          >
            <FileText className="w-5 h-5" />
            <span className="hidden md:inline">PDF</span>
          </button>
          <button 
            onClick={exportToExcel}
            className="bg-white text-slate-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            title="Exporter en Excel"
          >
            <Table className="w-5 h-5" />
            <span className="hidden md:inline">Excel</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => setIsAddingItem(true)}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              Nouvel Article
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Article</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Organisation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Quantité</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">État</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Emplacement</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                        <IconRenderer name={item.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{item.serialNumber || 'S/N: N/A'}</p>
                        {item.munitions && item.munitions.type && (
                          <p className="text-[10px] text-blue-600 font-bold mt-1 bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                            Mun: {item.munitions.type} ({item.munitions.quantity})
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      item.organization === 'Ministère de la Défense' ? "bg-slate-100 text-slate-700" : 
                      item.organization === 'Forces Armées d\'Haïti' ? "bg-red-50 text-red-700" :
                      "bg-indigo-50 text-indigo-700"
                    )}>
                      {item.organization === 'Ministère de la Défense' ? 'MDH' : 
                       item.organization === 'Forces Armées d\'Haïti' ? 'FAd\'H' : 'CONJOINT'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 font-mono font-bold">{item.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1.5 text-sm font-medium",
                      item.condition === 'Neuf' || item.condition === 'Bon' ? "text-emerald-600" : 
                      item.condition === 'Usagé' ? "text-amber-600" : "text-red-600"
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.condition === 'Neuf' || item.condition === 'Bon' ? "bg-emerald-500" : 
                        item.condition === 'Usagé' ? "bg-amber-500" : "bg-red-500"
                      )} />
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditingItem(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-all text-xs font-bold"
                      >
                        <Settings className="w-4 h-4" />
                        Modifier
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-slate-400">
                    Aucun article trouvé.
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
