import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, X, QrCode, CheckCircle, XCircle, Send, Keyboard } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  uid: string;
  onUidChange: (uid: string) => void;
  sandbox?: string;
}

export function BarcodeScannerComponent({ uid, onUidChange, sandbox }: BarcodeScannerProps) {
  // Use provided sandbox or get from localStorage
  const currentSandbox: string = sandbox || localStorage.getItem('selectedSandbox') || 'vigenair';
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    message: string;
    isEmpty: boolean;
  }>({ isValid: false, message: '', isEmpty: true });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const uidPattern = /^[A-Za-z]\d{4}$/;

  const submitMutation = useMutation({
    mutationFn: async (data: { uid: string, sandbox: string }) => {
      const response = await apiRequest('POST', '/api/scan-records', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "記錄成功！",
        description: `UID: ${data.uid} 已成功記錄`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
      onUidChange('');
      queryClient.invalidateQueries({ queryKey: ['/api/scan-records'] });
    },
    onError: (error: any) => {
      toast({
        title: "提交失敗",
        description: error.message || "請稍後再試",
        variant: "destructive",
      });
    },
  });

  const validateUID = (uidValue: string) => {
    if (uidValue === '') {
      setValidationState({
        isValid: false,
        message: '格式: 英文字母 + 4個數字 (例如: A1234)',
        isEmpty: true
      });
      return;
    }

    const isValid = uidPattern.test(uidValue);
    setValidationState({
      isValid,
      message: isValid ? 'UID 格式正確' : 'UID 格式錯誤，請輸入英文字母 + 4個數字',
      isEmpty: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = e.target.value.toUpperCase();
    onUidChange(upperValue);
  };

  const handleSubmit = () => {
    if (validationState.isValid && !submitMutation.isPending) {
      submitMutation.mutate({ uid, sandbox: currentSandbox });
    }
  };

  useEffect(() => {
    validateUID(uid);
  }, [uid]);

  const startCamera = async () => {
    try {
      setError('');
      setCameraPermissionDenied(false);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920, min: 640 },
          height: { ideal: 720, max: 1080, min: 480 },
          aspectRatio: { ideal: 16/9 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // 設定視頻屬性以提高掃描品質
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        videoRef.current.style.objectFit = 'cover';
        
        await videoRef.current.play();

        // 等待視頻完全載入
        await new Promise<void>((resolve) => {
          const video = videoRef.current;
          if (video && (video as HTMLVideoElement).readyState >= 2) {
            resolve();
          } else if (video) {
            video.addEventListener('loadeddata', () => resolve(), { once: true });
          } else {
            resolve();
          }
        });

        // 初始化條碼掃描器，設定最大兼容性
        readerRef.current = new BrowserMultiFormatReader();
        
        // 使用連續掃描模式，頻繁嘗試識別
        const scanInterval = setInterval(async () => {
          if (!readerRef.current || !videoRef.current) return;
          
          try {
            // 快速連續嘗試掃描
            const result = await readerRef.current.decodeOnceFromVideoDevice(undefined, videoRef.current);
            if (result) {
              const text = result.getText().trim();
              console.log('條碼掃描成功:', text);
              onUidChange(text.toUpperCase());
              clearInterval(scanInterval);
              stopCamera();
            }
          } catch (err) {
            // 掃描失敗，繼續下一次
          }
        }, 100); // 每100ms掃描一次，提高識別頻率
        
        // 儲存interval用於清理
        (videoRef.current as any).scanInterval = scanInterval;
      }
    } catch (err: any) {
      console.error('相機啟動失敗:', err);
      setIsScanning(false);
      
      if (err.name === 'NotAllowedError') {
        setCameraPermissionDenied(true);
        setError('需要相機權限才能自動掃描');
      } else if (err.name === 'NotFoundError') {
        setCameraPermissionDenied(true);
        setError('找不到相機裝置');
      } else {
        setCameraPermissionDenied(true);
        setError('無法啟動相機，請使用手動輸入');
      }
    }
  };

  // 組件載入時自動嘗試啟動相機
  useEffect(() => {
    if (!cameraPermissionDenied && !isScanning) {
      startCamera();
    }
  }, []);

  const stopCamera = () => {
    // 停止掃描間隔
    if (videoRef.current && (videoRef.current as any).scanInterval) {
      clearInterval((videoRef.current as any).scanInterval);
      (videoRef.current as any).scanInterval = null;
    }

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
              <button
                onClick={stopCamera}
                className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-80 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
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
        
        <div className="p-4 space-y-4">
          {/* 相機控制圓點 - 隱藏在右上角 */}
          {cameraPermissionDenied && !isScanning && (
            <div className="flex justify-end">
              <button
                onClick={startCamera}
                className="w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white opacity-70 hover:opacity-100 transition-opacity"
                title="啟動相機掃描"
              >
                <Camera size={12} />
              </button>
            </div>
          )}

          {/* 手動輸入區域 */}
          <div>
            <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Keyboard className="mr-1" size={16} />
              手動輸入 UID
            </Label>
            <div className="relative mb-2">
              <Input
                type="text"
                value={uid}
                onChange={handleInputChange}
                placeholder="例如: A1234"
                maxLength={5}
                className="pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {!validationState.isEmpty && (
                  validationState.isValid ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-red-500" size={20} />
                  )
                )}
              </div>
            </div>
            <p className={`text-sm mb-3 min-h-5 ${
              validationState.isEmpty 
                ? 'text-gray-500' 
                : validationState.isValid 
                  ? 'text-green-600' 
                  : 'text-red-600'
            }`}>
              {validationState.message}
            </p>
            
            <Button
              onClick={handleSubmit}
              disabled={!validationState.isValid || submitMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
            >
              <Send className="mr-2" size={16} />
              {submitMutation.isPending ? '提交中...' : '提交記錄'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
