
import React from 'react';
import { StatCardProps } from '../types';

export const StatsCard: React.FC<StatCardProps> = ({ 
  title, value, subtitle, trend, trendType, icon, colorClass 
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start hover:shadow-md transition-shadow">
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-xs font-bold ${trendType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trendType === 'up' ? '↑' : '↓'} {trend}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">vs bulan lepas</span>
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-blue-600 font-medium mt-2">{subtitle}</p>
        )}
      </div>
      <div className={`p-4 rounded-xl ${colorClass}`}>
        {icon}
      </div>
    </div>
  );
};
