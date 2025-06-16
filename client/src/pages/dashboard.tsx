import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, QrCode, Clock, BarChart3, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import type { ScanRecord } from '@shared/schema';
import { getSandboxName } from '@/lib/utils';

interface DashboardStats {
  totalScans: number;
  last5min: number;
  last10min: number;
  last30min: number;
  hourlyData: Array<{ hour: string; count: number }>;
  sandboxData: Array<{ name: string; count: number; color: string }>;
  userStats: Array<{ username: string; count: number }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const { data: records = [], isLoading } = useQuery<ScanRecord[]>({
    queryKey: ['/api/scan-records'],
    refetchInterval: 30000, // 每30秒刷新數據
  });

  const calculateStats = (): DashboardStats => {
    const now = new Date();
    const last5min = new Date(now.getTime() - 5 * 60 * 1000);
    const last10min = new Date(now.getTime() - 10 * 60 * 1000);
    const last30min = new Date(now.getTime() - 30 * 60 * 1000);

    // 計算時間區間統計
    const stats = {
      totalScans: records.length,
      last5min: records.filter(r => new Date(r.timestamp) > last5min).length,
      last10min: records.filter(r => new Date(r.timestamp) > last10min).length,
      last30min: records.filter(r => new Date(r.timestamp) > last30min).length,
      hourlyData: [] as Array<{ hour: string; count: number }>,
      sandboxData: [] as Array<{ name: string; count: number; color: string }>,
      userStats: [] as Array<{ username: string; count: number }>
    };

    // 計算過去24小時的每小時數據
    const hourlyMap = new Map<string, number>();
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = hour.getHours().toString().padStart(2, '0') + ':00';
      hourlyMap.set(hourKey, 0);
    }

    records.forEach(record => {
      const recordTime = new Date(record.timestamp);
      if (recordTime > new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
        const hourKey = recordTime.getHours().toString().padStart(2, '0') + ':00';
        hourlyMap.set(hourKey, (hourlyMap.get(hourKey) || 0) + 1);
      }
    });

    stats.hourlyData = Array.from(hourlyMap.entries()).map(([hour, count]) => ({
      hour,
      count
    }));

    // 計算 Sandbox 分布
    const sandboxMap = new Map<string, number>();
    records.forEach(record => {
      sandboxMap.set(record.sandbox, (sandboxMap.get(record.sandbox) || 0) + 1);
    });

    stats.sandboxData = Array.from(sandboxMap.entries()).map(([sandbox, count], index) => ({
      name: getSandboxName(sandbox),
      count,
      color: COLORS[index % COLORS.length]
    }));

    // 計算用戶統計
    const userMap = new Map<string, number>();
    records.forEach(record => {
      const username = record.username || '未知用戶';
      userMap.set(username, (userMap.get(username) || 0) + 1);
    });

    stats.userStats = Array.from(userMap.entries())
      .map(([username, count]) => ({ username, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 只顯示前10名

    return stats;
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">數據儀表板</h1>
              <p className="text-sm text-gray-600">掃描活動統計與分析</p>
            </div>
          </div>
          <Select value={timeRange} onValueChange={(value: '24h' | '7d' | '30d') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24小時</SelectItem>
              <SelectItem value="7d">7天</SelectItem>
              <SelectItem value="30d">30天</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總掃描數</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScans}</div>
              <p className="text-xs text-muted-foreground">累計掃描次數</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">最近5分鐘</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last5min}</div>
              <p className="text-xs text-muted-foreground">最近活動</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">最近10分鐘</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last10min}</div>
              <p className="text-xs text-muted-foreground">中期活動</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">最近30分鐘</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last30min}</div>
              <p className="text-xs text-muted-foreground">長期活動</p>
            </CardContent>
          </Card>
        </div>

        {/* 圖表區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 24小時趨勢圖 */}
          <Card>
            <CardHeader>
              <CardTitle>24小時掃描趨勢</CardTitle>
              <CardDescription>過去24小時每小時的掃描數量</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sandbox 分布圓餅圖 */}
          <Card>
            <CardHeader>
              <CardTitle>Sandbox 分布</CardTitle>
              <CardDescription>各個 Sandbox 的使用情況</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.sandboxData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.sandboxData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 用戶活動排行 */}
          <Card>
            <CardHeader>
              <CardTitle>活躍用戶排行</CardTitle>
              <CardDescription>掃描次數最多的用戶</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.userStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="username" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sandbox 詳細統計 */}
          <Card>
            <CardHeader>
              <CardTitle>Sandbox 活動統計</CardTitle>
              <CardDescription>各個 Sandbox 的詳細數據</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.sandboxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}