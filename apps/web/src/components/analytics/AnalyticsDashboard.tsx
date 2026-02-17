'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Calendar, 
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ path: string; views: number; percentage: number }>;
  topTemplates: Array<{ name: string; uses: number; percentage: number }>;
  dailyStats: Array<{ date: string; views: number; visitors: number }>;
  userAgents: Array<{ browser: string; percentage: number }>;
  devices: Array<{ device: string; percentage: number }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    pageViews: 15420,
    uniqueVisitors: 3280,
    bounceRate: 32.5,
    avgSessionDuration: 245,
    topPages: [
      { path: '/templates', views: 5420, percentage: 35.2 },
      { path: '/generate', views: 3890, percentage: 25.2 },
      { path: '/projects', views: 2890, percentage: 18.7 },
      { path: '/', views: 2220, percentage: 14.4 },
      { path: '/settings', views: 1000, percentage: 6.5 },
    ],
    topTemplates: [
      { name: 'Navigation Bar', uses: 342, percentage: 28.5 },
      { name: 'Hero Section', uses: 289, percentage: 24.1 },
      { name: 'Contact Form', uses: 198, percentage: 16.5 },
      { name: 'Pricing Card', uses: 156, percentage: 13.0 },
      { name: 'Modal Dialog', uses: 215, percentage: 17.9 },
    ],
    dailyStats: [
      { date: '2026-02-10', views: 2100, visitors: 450 },
      { date: '2026-02-11', views: 2350, visitors: 480 },
      { date: '2026-02-12', views: 2680, visitors: 520 },
      { date: '2026-02-13', views: 2420, visitors: 490 },
      { date: '2026-02-14', views: 2890, visitors: 580 },
      { date: '2026-02-15', views: 2980, visitors: 760 },
    ],
    userAgents: [
      { browser: 'Chrome', percentage: 65.2 },
      { browser: 'Safari', percentage: 18.5 },
      { browser: 'Firefox', percentage: 8.3 },
      { browser: 'Edge', percentage: 5.8 },
      { browser: 'Other', percentage: 2.2 },
    ],
    devices: [
      { device: 'Desktop', percentage: 58.7 },
      { device: 'Mobile', percentage: 35.2 },
      { device: 'Tablet', percentage: 6.1 },
    ],
  });

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const exportData = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Page Views', data.pageViews],
      ['Unique Visitors', data.uniqueVisitors],
      ['Bounce Rate', `${data.bounceRate}%`],
      ['Avg Session Duration', formatDuration(data.avgSessionDuration)],
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Monitor your app's performance and user engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Page Views</p>
              <p className="text-2xl font-bold">{data.pageViews.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+12.5%</span>
              </div>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unique Visitors</p>
              <p className="text-2xl font-bold">{data.uniqueVisitors.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+8.3%</span>
              </div>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bounce Rate</p>
              <p className="text-2xl font-bold">{data.bounceRate}%</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600">+2.1%</span>
              </div>
            </div>
            <MousePointer className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Session</p>
              <p className="text-2xl font-bold">{formatDuration(data.avgSessionDuration)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+15s</span>
              </div>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Pages</h3>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {data.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-12">
                    #{index + 1}
                  </span>
                  <span className="text-sm">{page.path}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {page.views.toLocaleString()}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {page.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Templates */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Templates</h3>
            <PieChart className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {data.topTemplates.map((template, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-12">
                    #{index + 1}
                  </span>
                  <span className="text-sm">{template.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {template.uses} uses
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {template.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* User Agents */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Browsers</h3>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {data.userAgents.map((browser, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{browser.browser}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${browser.percentage}%` }}
                    />
                  </div>
                  <Badge variant="outline" className="text-xs w-12 justify-center">
                    {browser.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Devices */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Devices</h3>
            <PieChart className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {data.devices.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{device.device}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                  <Badge variant="outline" className="text-xs w-12 justify-center">
                    {device.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}