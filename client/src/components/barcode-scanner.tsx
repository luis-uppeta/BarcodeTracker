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
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<BarcodeScanner | null>(null);

  const startScanning = async () => {
    if (!scannerRef.current) return;

    setError('');
    setIsScanning(true);

    try {
      const scanner = new BarcodeScanner({
        target: scannerRef.current,
        onDetected: (code: string) => {
          onCodeDetected(code);
          stopScanning();
        },
        onError: (errorMsg: string) => {
          setError(errorMsg);
          setIsScanning(false);
        }
      });

      scannerInstanceRef.current = scanner;
      await scanner.start();
    } catch (error) {
      setError('無法啟動掃描器，請確認相機權限');
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
              <div ref={scannerRef} className="w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-32 border-2 border-white border-dashed rounded-lg"></div>
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
                <p className="text-sm text-gray-500">需要允許相機權限</p>
                {error && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-2">
          {!isScanning ? (
            <>
              <Button 
                onClick={startScanning}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <QrCode className="mr-2" size={20} />
                開始掃描
              </Button>
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
