import React, { useState } from 'react';
import { Filter, Download } from 'lucide-react';
import { InventoryItem, MilitaryUnit } from '../types';

interface ReportsProps {
  items: InventoryItem[];
  units: MilitaryUnit[];
}

export const Reports = ({ items, units }: ReportsProps) => {
  const [reportFilters, setReportFilters] = useState({
    category: 'All',
    unit: 'All',
    militaryUnitId: 'All',
    service: '',
    direction: '',
    deptDirection: '',
    section: '',
    status: 'All',
    dateFrom: '',
    dateTo: ''
  });

  const filteredItems = items.filter(i => {
    const catMatch = reportFilters.category === 'All' || i.category === reportFilters.category;
    const unitMatch = reportFilters.unit === 'All' || i.organization === reportFilters.unit;
    const milUnitMatch = reportFilters.militaryUnitId === 'All' || i.militaryUnitId === reportFilters.militaryUnitId;
    const serviceMatch = !reportFilters.service || i.service?.toLowerCase().includes(reportFilters.service.toLowerCase());
    const directionMatch = !reportFilters.direction || i.direction?.toLowerCase().includes(reportFilters.direction.toLowerCase());
    const deptDirMatch = !reportFilters.deptDirection || i.deptDirection?.toLowerCase().includes(reportFilters.deptDirection.toLowerCase());
    const sectionMatch = !reportFilters.section || i.section?.toLowerCase().includes(reportFilters.section.toLowerCase());
    const statusMatch = reportFilters.status === 'All' || i.condition === reportFilters.status;
    const dateFromMatch = !reportFilters.dateFrom || (i.acquiredDate && i.acquiredDate >= reportFilters.dateFrom);
    const dateToMatch = !reportFilters.dateTo || (i.acquiredDate && i.acquiredDate <= reportFilters.dateTo);
    return catMatch && unitMatch && milUnitMatch && serviceMatch && directionMatch && deptDirMatch && sectionMatch && statusMatch && dateFromMatch && dateToMatch;
  });

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtres de Rapport
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Catégorie</label>
            <select 
              className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              value={reportFilters.category}
              onChange={e => setReportFilters({...reportFilters, category: e.target.value})}
            >
              <option value="All">Toutes</option>
              <option value="Matériel">Matériel</option>
              <option value="Mobilier">Mobilier</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Organisation</label>
            <select 
              className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              value={reportFilters.unit}
              onChange={e => setReportFilters({...reportFilters, unit: e.target.value, militaryUnitId: 'All'})}
            >
              <option value="All">Toutes</option>
              <option value="Ministère de la Défense">Ministère</option>
              <option value="Forces Armées d'Haïti">FAd'H</option>
              <option value="Conjoint (Ministère & FAd'H)">Conjoint</option>
            </select>
          </div>
          {reportFilters.unit === "Forces Armées d'Haïti" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Unité Militaire</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
                value={reportFilters.militaryUnitId}
                onChange={e => setReportFilters({...reportFilters, militaryUnitId: e.target.value})}
              >
                <option value="All">Toutes les unités</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Service</label>
            <input 
              type="text" 
              placeholder="Filtrer par service..."
              className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              value={reportFilters.service}
              onChange={e => setReportFilters({...reportFilters, service: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Direction</label>
            <input 
              type="text" 
              placeholder="Filtrer par direction..."
              className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              value={reportFilters.direction}
              onChange={e => setReportFilters({...reportFilters, direction: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Dir. Départementale</label>
            <input 
              type="text" 
              placeholder="Filtrer par dir. dép..."
              className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              value={reportFilters.deptDirection}
              onChange={e => setReportFilters({...reportFilters, deptDirection: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Section</label>
            <input 
              type="text" 
              placeholder="Filtrer par section..."
              className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              value={reportFilters.section}
              onChange={e => setReportFilters({...reportFilters, section: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Statut</label>
            <select 
              className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              value={reportFilters.status}
              onChange={e => setReportFilters({...reportFilters, status: e.target.value})}
            >
              <option value="All">Tous</option>
              <option value="Bon">En stock (Bon)</option>
              <option value="En réparation">En réparation</option>
              <option value="Endommagé">Hors service</option>
              <option value="Usagé">Usagé</option>
              <option value="Neuf">Neuf</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Date de début</label>
            <input 
              type="date" 
              className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              value={reportFilters.dateFrom}
              onChange={e => setReportFilters({...reportFilters, dateFrom: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Date de fin</label>
            <input 
              type="date" 
              className="w-full p-3 rounded-xl border border-slate-200 outline-none"
              value={reportFilters.dateTo}
              onChange={e => setReportFilters({...reportFilters, dateTo: e.target.value})}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-slate-800 transition-all active:scale-95">
            <Download className="w-5 h-5" />
            Exporter PDF / Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Article</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Quantité</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valeur Est.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date d'Acq.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Localisation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="text-sm border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold">{item.name}</td>
                  <td className="px-6 py-4 text-slate-500">{item.description || 'N/A'}</td>
                  <td className="px-6 py-4 font-mono">{item.quantity}</td>
                  <td className="px-6 py-4 font-mono text-emerald-600">${item.estimatedValue?.toLocaleString() || '0'}</td>
                  <td className="px-6 py-4 text-slate-500">{item.acquiredDate || 'N/A'}</td>
                  <td className="px-6 py-4">{item.location}</td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Aucun résultat pour ces filtres.
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
