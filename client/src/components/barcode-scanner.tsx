import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, QrCode } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
  onCodeDetected: (code: string) => void;
}

export function BarcodeScannerComponent({ onCodeDetected }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const startCamera = async () => {
    try {
      setError('');
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();

        // 初始化條碼掃描器
        readerRef.current = new BrowserMultiFormatReader();
        
        // 開始掃描條碼
        readerRef.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          if (result) {
            console.log('條碼掃描成功:', result.getText());
            onCodeDetected(result.getText());
            stopCamera();
          }
          if (err && !(err.name === 'NotFoundException')) {
            console.error('掃描錯誤:', err);
          }
        });
      }
    } catch (err: any) {
      setError('無法啟動相機: ' + err.message);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    // 停止條碼掃描器
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    
    // 停止相機串流
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setError('');
  };

  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-32 border-2 border-white border-dashed rounded-lg"></div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
                <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                  將條碼對準掃描框內
                </p>
              </div>
              <Button
                onClick={stopCamera}
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
                onClick={startCamera}
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
              onClick={stopCamera}
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
