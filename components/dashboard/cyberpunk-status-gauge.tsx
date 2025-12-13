'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface StatusGaugeProps {
  statuses: Array<{
    status: string;
    count: number;
  }>;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  'PRODUCTION': '#00FF41',
  'SCALING': '#00ff88',
  'PILOT': '#00cc33',
  'PLANNING': '#66ff99',
  'PAUSED': '#33ff66',
  'COMPLETED': '#00ffaa',
  'CANCELLED': '#ff0040',
};

export function CyberpunkStatusGauge({ statuses, className }: StatusGaugeProps) {
  const total = statuses.reduce((sum, s) => sum + s.count, 0);
  
  const data = statuses.map(status => ({
    name: status.status.toLowerCase().replace(/_/g, ' '),
    value: status.count,
    fill: STATUS_COLORS[status.status] || '#00FF41',
  }));

  // Create semi-circle gauge using PieChart
  return (
    <div className={cn('space-y-4', className)}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="90%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill}
                style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 65, 0.5))' }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(0, 255, 65, 0.3)',
              borderRadius: '8px',
              color: '#00FF41',
            }}
            labelStyle={{ color: '#ffffff' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Status List */}
      <div className="space-y-2">
        {statuses.map((status) => {
          const percentage = total > 0 ? ((status.count / total) * 100).toFixed(1) : '0';
          const color = STATUS_COLORS[status.status] || '#00FF41';
          
          return (
            <div key={status.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 w-2 rounded-full"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}`,
                  }}
                />
                <span className="text-sm capitalize text-white">
                  {status.status.toLowerCase().replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#00FF41]/70">{percentage}%</span>
                <span className="text-sm font-medium text-white">{status.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
