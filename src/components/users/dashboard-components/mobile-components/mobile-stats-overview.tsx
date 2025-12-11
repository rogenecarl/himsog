import React from 'react';
import { CalendarClock, CheckCircle2, LayoutGrid, AlertCircle } from 'lucide-react';

interface StatsData {
  upcoming?: number;
  completed?: number;
  total?: number;
  cancelled?: number;
}

interface StatsOverviewProps {
  stats: StatsData | undefined;
}

const MobileStatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const statItems = [
    { type: 'upcoming', label: 'Upcoming', value: stats?.upcoming || 0, subtext: 'Scheduled ahead' },
    { type: 'completed', label: 'Completed', value: stats?.completed || 0, subtext: 'Successfully completed' },
    { type: 'total', label: 'Total', value: stats?.total || 0, subtext: 'All appointments' },
    { type: 'cancelled', label: 'Cancelled', value: stats?.cancelled || 0, subtext: 'Cancelled visits' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'upcoming': return <CalendarClock className="text-amber-500" size={20} />;
      case 'completed': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'total': return <LayoutGrid className="text-blue-500" size={20} />;
      case 'cancelled': return <AlertCircle className="text-red-500" size={20} />;
      default: return <CalendarClock size={20} />;
    }
  };

  const getBorderColor = (type: string) => {
     switch (type) {
      case 'upcoming': return 'border-amber-200';
      case 'completed': return 'border-emerald-200';
      case 'total': return 'border-blue-200';
      case 'cancelled': return 'border-red-200';
      default: return 'border-gray-100';
    }
  };

  const getBgColor = (type: string) => {
     switch (type) {
      case 'upcoming': return 'bg-amber-50';
      case 'completed': return 'bg-emerald-50';
      case 'total': return 'bg-blue-50';
      case 'cancelled': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 px-5 pt-4 pb-2">
      {statItems.map((stat, index) => (
        <div
          key={index}
          className={`p-4 rounded-2xl bg-white border ${getBorderColor(stat.type)} shadow-sm flex flex-col justify-between h-32 transition-transform active:scale-[0.98] duration-200`}
        >
          <div className="flex justify-between items-start">
             <div className={`p-2 rounded-full ${getBgColor(stat.type)}`}>
               {getIcon(stat.type)}
             </div>
             <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">{stat.label}</p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{stat.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileStatsOverview;