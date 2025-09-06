import React from 'react';

const StatsCard = React.memo(({ title, value, icon }) => {
  return (
    <div className="card bg-slate-800 shadow-lg">
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className="text-3xl text-gray-500">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;