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
  sandbox: string;
}

export function BarcodeScannerComponent({ uid, onUidChange, sandbox }: BarcodeScannerProps) {
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
      submitMutation.mutate({ uid, sandbox });
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
            onUidChange(result.getText().toUpperCase());
            stopCamera();
          }
          if (err && !(err.name === 'NotFoundException')) {
            console.error('掃描錯誤:', err);
          }
        });
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
        
        <div className="p-4 space-y-4">
          {/* 掃描按鈕 - 只在相機權限被拒絕或掃描停止時顯示 */}
          {cameraPermissionDenied && !isScanning && (
            <Button 
              onClick={startCamera}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <QrCode className="mr-2" size={20} />
              重新啟動相機掃描
            </Button>
          )}
          
          {isScanning && (
            <Button 
              onClick={stopCamera}
              variant="outline"
              className="w-full"
            >
              停止掃描
            </Button>
          )}

          {/* 分隔線 - 只在有掃描按鈕時顯示 */}
          {(cameraPermissionDenied || isScanning) && (
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-sm text-gray-500">或</span>
              <div className="flex-1 border-t border-gray-200"></div>
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
