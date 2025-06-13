import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, QrCode } from 'lucide-react';
import { BarcodeScanner } from '@/lib/barcode-scanner';

interface BarcodeScannerProps {
  onCodeDetected: (code: string) => void;
}

export function BarcodeScannerComponent({ onCodeDetected }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<BarcodeScanner | null>(null);

  const checkCameraPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('此瀏覽器不支援相機功能');
        return false;
      }

      // Check current permission status
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log('Camera permission status:', result.state);
        
        if (result.state === 'granted') {
          setHasPermission(true);
          return true;
        } else if (result.state === 'denied') {
          setError('相機權限已被拒絕，請在瀏覽器設定中重新允許');
          setHasPermission(false);
          return false;
        }
      }

      // Test camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error: any) {
      console.error('Camera permission check failed:', error);
      setHasPermission(false);
      
      if (error.name === 'NotAllowedError') {
        setError('需要相機權限才能掃描條碼');
      } else {
        setError('無法存取相機，請檢查裝置設定');
      }
      return false;
    }
  };

  const startScanning = async () => {
    if (!scannerRef.current) return;

    setError('');
    
    // First check/request camera permission
    const hasAccess = await checkCameraPermission();
    if (!hasAccess) {
      return;
    }

    setIsScanning(true);

    try {
      // Create scanner and attempt to start
      const scanner = new BarcodeScanner({
        target: scannerRef.current,
        onDetected: (code: string) => {
          console.log('Code detected in component:', code);
          onCodeDetected(code);
          stopScanning();
        },
        onError: (errorMsg: string) => {
          console.error('Scanner error:', errorMsg);
          setError(errorMsg);
          setIsScanning(false);
        }
      });

      scannerInstanceRef.current = scanner;
      
      // Show loading state while requesting permission
      console.log('Starting scanner...');
      await scanner.start();
      
    } catch (error: any) {
      console.error('Failed to start scanner:', error);
      let errorMessage = '無法啟動掃描器';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = '相機權限被拒絕，請在瀏覽器設定中允許相機存取';
      } else if (error.name === 'NotFoundError') {
        errorMessage = '找不到相機裝置';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = '瀏覽器不支援相機功能';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop();
    }
    setIsScanning(false);
    setError('');
  };

  useEffect(() => {
    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.stop();
      }
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h2 className="text-lg font-medium flex items-center">
          <QrCode className="mr-2" size={20} />
          掃描條碼
        </h2>
      </div>
      
      <CardContent className="p-0">
        <div className="relative">
          {isScanning ? (
            <div className="relative w-full h-64 bg-black overflow-hidden">
              <div ref={scannerRef} className="w-full h-full cursor-pointer" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-32 border-2 border-white border-dashed rounded-lg"></div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
                <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                  點擊畫面來模擬掃描條碼
                </p>
              </div>
              <Button
                onClick={stopScanning}
                size="sm"
                variant="destructive"
                className="absolute top-4 right-4 rounded-full p-2"
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
              <div className="text-center p-4">
                <Camera className="mx-auto mb-3 text-gray-400" size={48} />
                <p className="text-gray-600 mb-2">準備開始掃描條碼</p>
                <p className="text-sm text-gray-500 mb-3">點擊下方按鈕啟動相機</p>
                {error && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                    {error}
                    {error.includes('權限') && (
                      <div className="mt-2 text-xs">
                        提示：請點擊瀏覽器位址列旁的相機圖示來允許權限
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-2">
          {!isScanning ? (
            <>
              {hasPermission === false ? (
                <Button 
                  onClick={checkCameraPermission}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Camera className="mr-2" size={20} />
                  請求相機權限
                </Button>
              ) : (
                <Button 
                  onClick={startScanning}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <QrCode className="mr-2" size={20} />
                  開始掃描
                </Button>
              )}
              <Button 
                onClick={() => onCodeDetected('A1234')}
                variant="outline"
                className="w-full text-sm"
              >
                測試模式 (模擬掃描 A1234)
              </Button>
            </>
          ) : (
            <Button 
              onClick={stopScanning}
              variant="outline"
              className="w-full"
            >
              停止掃描
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
