import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, CheckCircle, Inbox, User, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { getRelativeTime, getSandboxName } from '@/lib/utils';
import type { ScanRecord } from '@shared/schema';

interface ScanHistoryProps {
  currentSandbox?: string;
}

export function ScanHistory({ currentSandbox }: ScanHistoryProps) {
  const [filter, setFilter] = useState<'current' | 'my-scans' | 'all'>(currentSandbox ? 'current' : 'all');
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: records = [], isLoading } = useQuery<ScanRecord[]>({
    queryKey: ['/api/scan-records', filter, currentSandbox],
    queryFn: async () => {
      let url = '/api/scan-records?';
      const params = new URLSearchParams();
      
      if (filter === 'my-scans') {
        params.append('filter', 'my-scans');
      } else if (filter === 'current' && currentSandbox) {
        params.append('filter', 'sandbox');
        params.append('sandbox', currentSandbox);
      }
      
      return fetch(url + params.toString()).then(res => res.json());
    },
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium flex items-center">
            <History className="mr-2 text-gray-600" size={20} />
            掃描歷史
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">共 {records.length} 筆記錄</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </div>
        
        {/* Filter Controls - 手機優化版本 */}
        <div className="flex gap-1">
          {currentSandbox && (
            <Button
              variant={filter === 'current' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('current')}
              className="flex-1 text-xs px-2"
            >
              本區域
            </Button>
          )}
          <Button
            variant={filter === 'my-scans' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('my-scans')}
            className="flex-1 text-xs px-2"
          >
            <User className="mr-1" size={12} />
            我的
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="flex-1 text-xs px-2"
          >
            <Users className="mr-1" size={12} />
            全部
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-72 overflow-y-auto">
          {records.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Inbox className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm">尚無掃描記錄</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {(isExpanded ? records : records.slice(0, 3)).map((record) => {
                const date = new Date(record.timestamp);
                const relativeTime = getRelativeTime(date);

                return (
                  <div key={record.id} className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <CheckCircle className="text-green-500 flex-shrink-0" size={14} />
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-sm font-medium text-gray-900">{record.uid}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {getSandboxName(record.sandbox)} • {relativeTime}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-700 flex-shrink-0">
                        成功
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {!isExpanded && records.length > 3 && (
                <div className="p-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(true)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    顯示更多 ({records.length - 3} 筆)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
