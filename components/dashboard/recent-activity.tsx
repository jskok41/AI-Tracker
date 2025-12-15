'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';
import { ActivityType } from '@prisma/client';
import {
  FolderKanban,
  FileText,
  AlertTriangle,
  UserCog,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Calendar,
  Trash2,
  Edit,
  Plus,
} from 'lucide-react';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
  } | null;
}

interface RecentActivityProps {
  activities: Activity[];
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'PROJECT_CREATED':
      return <Plus className="h-4 w-4" />;
    case 'PROJECT_UPDATED':
      return <Edit className="h-4 w-4" />;
    case 'PROJECT_DELETED':
      return <Trash2 className="h-4 w-4" />;
    case 'PROJECT_STATUS_CHANGED':
      return <FolderKanban className="h-4 w-4" />;
    case 'PROMPT_CREATED':
    case 'PROMPT_UPDATED':
    case 'PROMPT_DELETED':
      return <FileText className="h-4 w-4" />;
    case 'RISK_CREATED':
    case 'RISK_UPDATED':
    case 'RISK_DELETED':
      return <AlertTriangle className="h-4 w-4" />;
    case 'USER_ROLE_CHANGED':
      return <UserCog className="h-4 w-4" />;
    case 'PROJECT_MEMBER_ADDED':
    case 'PROJECT_MEMBER_REMOVED':
      return <Users className="h-4 w-4" />;
    case 'METRIC_ADDED':
      return <TrendingUp className="h-4 w-4" />;
    case 'ROI_CALCULATED':
      return <DollarSign className="h-4 w-4" />;
    case 'MILESTONE_COMPLETED':
      return <CheckCircle className="h-4 w-4" />;
    case 'PHASE_UPDATED':
      return <Calendar className="h-4 w-4" />;
    default:
      return <FolderKanban className="h-4 w-4" />;
  }
};

const getActivityColor = (type: ActivityType) => {
  if (type.includes('CREATED')) {
    return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 cyberpunk:bg-[#00FF41]/20 cyberpunk:text-[#00FF41]';
  }
  if (type.includes('DELETED')) {
    return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 cyberpunk:bg-red-900/30 cyberpunk:text-red-400';
  }
  if (type.includes('UPDATED') || type.includes('CHANGED')) {
    return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 cyberpunk:bg-blue-900/30 cyberpunk:text-blue-400';
  }
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 cyberpunk:bg-[#00FF41]/10 cyberpunk:text-[#00FF41]/70';
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card className="cyberpunk:bg-black/80 cyberpunk:backdrop-blur-md cyberpunk:border-[#00FF41]/50 cyberpunk:shadow-[0_0_20px_rgba(0,255,65,0.2)]">
        <CardHeader>
          <CardTitle className="cyberpunk:text-white cyberpunk:drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]">
            Recent Activity
          </CardTitle>
          <CardDescription className="cyberpunk:text-[#00FF41]/70">
            Latest updates from your AI projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground cyberpunk:text-[#00FF41]/70">
            No recent activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cyberpunk:bg-black/80 cyberpunk:backdrop-blur-md cyberpunk:border-[#00FF41]/50 cyberpunk:shadow-[0_0_20px_rgba(0,255,65,0.2)]">
      <CardHeader>
        <CardTitle className="cyberpunk:text-white cyberpunk:drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]">
          Recent Activity
        </CardTitle>
        <CardDescription className="cyberpunk:text-[#00FF41]/70">
          Latest updates from your AI projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0 cyberpunk:border-[#00FF41]/20"
            >
              <div
                className={`mt-1 rounded-full p-2 ${getActivityColor(activity.type)}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium cyberpunk:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap cyberpunk:text-[#00FF41]/70">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
                {activity.description && (
                  <p className="text-sm text-muted-foreground cyberpunk:text-[#00FF41]/70">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground cyberpunk:text-[#00FF41]/70">
                  <span>by {activity.user.name}</span>
                  {activity.project && (
                    <>
                      <span>•</span>
                      <span>Project: {activity.project.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

