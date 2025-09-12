import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const StatsCard = React.memo(({ title, value, icon, trend, trendValue, colorCode, sparklineData }) => {
  // Determine color based on value type and colorCode prop
  const getValueColor = () => {
    if (!colorCode) return 'text-white';
    
    if (typeof value === 'string' && value.includes('$')) {
      const numValue = parseFloat(value.replace('$', ''));
      if (numValue > 0) return 'text-green-400';
      if (numValue < 0) return 'text-red-400';
    }
    return 'text-white';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return <FiTrendingUp className="text-green-400" />;
    if (trend === 'down') return <FiTrendingDown className="text-red-400" />;
    return <FiMinus className="text-gray-400" />;
  };

  return (
    <div className="card bg-slate-800 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
          <div className="text-2xl text-gray-500">
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <p className={`text-2xl font-bold ${getValueColor()} mb-1`}>{value}</p>
            {trend && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                {trendValue && (
                  <span className={`text-xs ${
                    trend === 'up' ? 'text-green-400' : 
                    trend === 'down' ? 'text-red-400' : 
                    'text-gray-400'
                  }`}>
                    {trendValue}
                  </span>
                )}
              </div>
            )}
          </div>
          {sparklineData && sparklineData.length > 0 && (
            <div className="flex items-end gap-0.5 h-8 ml-4">
              {sparklineData.slice(-7).map((val, idx) => {
                const maxVal = Math.max(...sparklineData.slice(-7));
                const minVal = Math.min(...sparklineData.slice(-7));
                const range = maxVal - minVal || 1;
                const height = ((val - minVal) / range) * 100;
                return (
                  <div
                    key={idx}
                    className="w-1 bg-blue-500 opacity-60 hover:opacity-100 transition-opacity"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`$${val}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;