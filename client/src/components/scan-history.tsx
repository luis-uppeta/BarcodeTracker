import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, CheckCircle, Inbox } from 'lucide-react';
import { getRelativeTime, getSandboxName } from '@/lib/utils';
import type { ScanRecord } from '@shared/schema';

export function ScanHistory() {
  const { data: records = [], isLoading } = useQuery<ScanRecord[]>({
    queryKey: ['/api/scan-records'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium flex items-center">
              <History className="mr-2 text-gray-600" size={20} />
              掃描歷史
            </h2>
            <span className="text-sm text-gray-500">載入中...</span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium flex items-center">
            <History className="mr-2 text-gray-600" size={20} />
            掃描歷史
          </h2>
          <span className="text-sm text-gray-500">共 {records.length} 筆記錄</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {records.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Inbox className="mx-auto mb-3 text-gray-400" size={48} />
              <p>尚無掃描記錄</p>
              <p className="text-sm">開始掃描條碼來建立記錄</p>
            </div>
          ) : (
            records.map((record) => {
              const date = new Date(record.timestamp);
              const relativeTime = getRelativeTime(date);
              const fullTime = date.toLocaleString('zh-TW');

              return (
                <div key={record.id} className="p-4 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">{record.uid}</div>
                      <div className="text-sm text-gray-500">{getSandboxName(record.sandbox)}</div>
                      {record.deviceInfo && (
                        <div className="text-xs text-blue-600 mt-1">{record.deviceInfo}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        <span>{relativeTime}</span> • <span>{fullTime}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="mr-1" size={12} />
                        成功
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
