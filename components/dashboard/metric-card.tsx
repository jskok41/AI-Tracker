import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import type { TrendDirection } from '@/lib/types';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: TrendDirection;
  format?: 'number' | 'currency' | 'percentage';
  isPositiveGood?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  format = 'number',
  isPositiveGood = true,
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    if (format === 'currency') {
      return formatCurrency(val);
    }
    if (format === 'percentage') {
      return formatPercentage(val);
    }
    return formatNumber(val);
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'neutral') return 'text-gray-600';
    if (isPositiveGood) {
      return trend === 'up' ? 'text-green-600' : 'text-red-600';
    }
    return trend === 'up' ? 'text-red-600' : 'text-green-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs mt-1">
            <span className={cn('font-medium flex items-center gap-0.5', getTrendColor())}>
              {getTrendIcon()}
              {change > 0 ? '+' : ''}{change}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

