import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: ReactNode;
}

export const StatCard = ({ title, value, trend, icon }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-xl">
        {icon}
      </div>
      {trend && (
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-bold",
          trend.startsWith('+') ? "bg-emerald-100 text-emerald-700" : 
          trend === 'Critique' ? "bg-red-100 text-red-700" :
          trend === 'Normal' ? "bg-emerald-100 text-emerald-700" :
          "bg-slate-100 text-slate-700"
        )}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-black text-slate-900">{value}</p>
  </div>
);
