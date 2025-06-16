import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { BarcodeScannerComponent } from '@/components/barcode-scanner';
import { ScanHistory } from '@/components/scan-history';
import { Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSandboxName } from '@/lib/utils';

export default function Checkin() {
  const { sandboxname } = useParams<{ sandboxname: string }>();
  const [uid, setUid] = useState('');

  // 驗證 sandbox 是否有效
  const validSandboxes = ['vigenair', 'videomate', 'feedgen', 'advatars', 'sandbox5', 'sandbox6', 'sandbox7', 'sandbox8'];
  const isValidSandbox = sandboxname && validSandboxes.includes(sandboxname);

  if (!isValidSandbox) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center py-8">
            <h1 className="text-xl font-semibold mb-2">無效的 Sandbox</h1>
            <p className="text-gray-600 mb-4">找不到指定的 Sandbox: {sandboxname}</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="mr-2" size={16} />
                返回首頁
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">簽到系統</h1>
              <p className="text-sm text-gray-600">{getSandboxName(sandboxname!)}</p>
            </div>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <Settings size={16} />
            </Button>
          </Link>
        </div>

        {/* Scanner Component */}
        <BarcodeScannerComponent 
          uid={uid} 
          onUidChange={setUid} 
          sandbox={sandboxname!} 
        />

        {/* Scan History */}
        <ScanHistory currentSandbox={sandboxname!} />
      </div>
    </div>
  );
}