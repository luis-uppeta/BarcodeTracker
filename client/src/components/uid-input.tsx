import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Send, Keyboard } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UIDInputProps {
  value: string;
  onChange: (value: string) => void;
  sandbox: string;
}

export function UIDInput({ value, onChange, sandbox }: UIDInputProps) {
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    message: string;
    isEmpty: boolean;
  }>({ isValid: false, message: '', isEmpty: true });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uidPattern = /^[A-Za-z]\d{3}$/;

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
      onChange('');
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

  useEffect(() => {
    validateUID(value);
  }, [value]);

  const validateUID = (uid: string) => {
    if (uid === '') {
      setValidationState({
        isValid: false,
        message: '格式: 英文字母 + 3個數字 (例如: A123)',
        isEmpty: true
      });
      return;
    }

    const isValid = uidPattern.test(uid);
    setValidationState({
      isValid,
      message: isValid ? 'UID 格式正確' : 'UID 格式錯誤，請輸入英文字母 + 3個數字',
      isEmpty: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = e.target.value.toUpperCase();
    onChange(upperValue);
  };

  const handleSubmit = () => {
    if (validationState.isValid && !submitMutation.isPending) {
      submitMutation.mutate({ uid: value, sandbox });
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4">
          <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Keyboard className="mr-1" size={16} />
            手動輸入 UID
          </Label>
          <div className="relative">
            <Input
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder="例如: A123"
              maxLength={4}
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
          <p className={`text-sm mt-1 min-h-5 ${
            validationState.isEmpty 
              ? 'text-gray-500' 
              : validationState.isValid 
                ? 'text-green-600' 
                : 'text-red-600'
          }`}>
            {validationState.message}
          </p>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!validationState.isValid || submitMutation.isPending}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
        >
          <Send className="mr-2" size={16} />
          {submitMutation.isPending ? '提交中...' : '提交記錄'}
        </Button>
      </CardContent>
    </Card>
  );
}
