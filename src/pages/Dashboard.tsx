import React from 'react';
import { Package, Shield, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { InventoryItem } from '../types';
import { StatCard } from '../components/ui/StatCard';

interface DashboardProps {
  items: InventoryItem[];
}

export const Dashboard = ({ items }: DashboardProps) => {
  const stats = {
    total: items.length,
    mdh: items.filter(i => i.organization === 'Ministère de la Défense').length,
    fadh: items.filter(i => i.organization === 'Forces Armées d\'Haïti').length,
    conjoint: items.filter(i => i.organization === 'Conjoint (Ministère & FAd\'H)').length,
    damaged: items.filter(i => i.condition === 'Critique' || i.condition === 'Endommagé').length
  };

  const lowStockItems = items.filter(i => i.quantity <= i.minThreshold);

  const chartData = [
    { name: 'MDH', count: stats.mdh },
    { name: 'FAd\'H', count: stats.fadh },
    { name: 'Conjoint', count: stats.conjoint }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Articles" value={stats.total} icon={<Package className="text-blue-600" />} />
        <StatCard title="Ministère (MDH)" value={stats.mdh} icon={<Shield className="text-slate-900" />} />
        <StatCard title="Forces Armées (FAd'H)" value={stats.fadh} icon={<Shield className="text-red-600" />} />
        <StatCard title="Conjoint (MDH/FAd'H)" value={stats.conjoint} icon={<Shield className="text-indigo-600" />} />
        <StatCard title="Alertes Stock Bas" value={lowStockItems.length} icon={<AlertCircle className="text-red-600" />} trend={lowStockItems.length > 0 ? "Critique" : "Normal"} />
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600 w-6 h-6" />
            <h3 className="text-lg font-bold text-red-900">Alertes de Stock Bas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.organization}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{item.quantity}</p>
                  <p className="text-[10px] text-slate-400 uppercase">Seuil: {item.minThreshold}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Répartition par Organisation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">État du Matériel</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Bon', value: items.filter(i => i.condition === 'Bon' || i.condition === 'Neuf').length },
                    { name: 'Usagé', value: items.filter(i => i.condition === 'Usagé').length },
                    { name: 'Critique', value: stats.damaged }
                  ]}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
