
import React from 'react';
import { RackData } from '../types';
import { STATUS_COLORS, STATUS_DOTS } from '../constants';

interface DashboardProps {
  racks: RackData[];
  onSelectRack: (rack: RackData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ racks, onSelectRack }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3">
      {racks.map((rack) => (
        <button
          key={rack.id}
          onClick={() => onSelectRack(rack)}
          className={`
            relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-3 transition-all duration-200
            hover:scale-105 hover:shadow-lg active:scale-95 group
            ${STATUS_COLORS[rack.status]}
          `}
        >
          <span className="text-[10px] font-black opacity-30 absolute top-2 right-2 group-hover:opacity-60 transition-opacity">
            #{rack.id.toString().padStart(2, '0')}
          </span>
          
          <div className="mb-2 text-current opacity-80 group-hover:opacity-100 transition-opacity">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          
          <div className="w-full text-center px-1">
            <div className="text-[9px] font-black uppercase truncate leading-tight tracking-tighter">
              {rack.status === 'FREE' ? 'Livre' : (rack.customerName || 'Ocupado')}
            </div>
            {rack.orderNumber && (
              <div className="text-[8px] font-bold opacity-60 truncate">
                OS: {rack.orderNumber}
              </div>
            )}
          </div>

          <div className={`absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full ${STATUS_DOTS[rack.status]} shadow-sm`} />
        </button>
      ))}
    </div>
  );
};

export default Dashboard;
