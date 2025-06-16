import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, QrCode, BarChart3 } from 'lucide-react';
import { sandboxOptions } from '@/lib/utils';

export default function Scanner() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">簽到系統</h1>
          <div className="flex space-x-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <BarChart3 size={16} />
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings size={16} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Sandbox Options */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-gray-700">選擇 Sandbox</h2>
          <div className="space-y-2">
            {sandboxOptions.map((option) => (
              <Link key={option.value} href={`/checkin/${option.value}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{option.label}</span>
                      <QrCode size={20} className="text-blue-600" />
                    </CardTitle>
                    <CardDescription>
                      點擊進入 {option.label} 簽到頁面
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">快速存取</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2" size={16} />
                數據儀表板
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2" size={16} />
                設定
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
