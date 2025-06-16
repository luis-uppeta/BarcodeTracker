import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit2, Check, X } from 'lucide-react';
import { Link } from 'wouter';
import { sandboxOptions, getSandboxName } from '@/lib/utils';
import { getUsername, setUsername, getClientIP, getMachineName } from '@/lib/user-info';

export default function Settings() {
  const [selectedSandbox, setSelectedSandbox] = useState<string>(
    localStorage.getItem('selectedSandbox') || 'vigenair'
  );
  const [username, setUsernameState] = useState<string>(getUsername());
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState<string>('');
  const [clientIP, setClientIP] = useState<string>('loading...');
  const [machineName, setMachineName] = useState<string>(getMachineName());

  useEffect(() => {
    localStorage.setItem('selectedSandbox', selectedSandbox);
  }, [selectedSandbox]);

  useEffect(() => {
    // 獲取客戶端IP
    getClientIP().then(setClientIP);
  }, []);

  const handleEditUsername = () => {
    setTempUsername(username);
    setIsEditingUsername(true);
  };

  const handleSaveUsername = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      setUsernameState(tempUsername.trim());
      setIsEditingUsername(false);
    }
  };

  const handleCancelEdit = () => {
    setTempUsername('');
    setIsEditingUsername(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-xl font-semibold">設定</h1>
        </div>

        {/* Sandbox Selection */}
        <Card>
          <CardHeader>
            <CardTitle>預設 Sandbox</CardTitle>
            <CardDescription>
              選擇預設的 Sandbox 環境
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedSandbox} onValueChange={setSelectedSandbox}>
              <SelectTrigger>
                <SelectValue>{getSandboxName(selectedSandbox)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sandboxOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>用戶資訊</CardTitle>
            <CardDescription>
              當前用戶識別和設備信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">用戶名:</span>
                <div className="flex items-center space-x-2">
                  {isEditingUsername ? (
                    <>
                      <Input
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        className="w-24 h-8 text-sm"
                        placeholder="輸入用戶名"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSaveUsername}
                        className="p-1 h-8 w-8"
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="p-1 h-8 w-8"
                      >
                        <X size={14} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium">{username}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditUsername}
                        className="p-1 h-8 w-8"
                      >
                        <Edit2 size={14} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">IP 地址:</span>
                <span className="text-sm font-medium">{clientIP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">設備:</span>
                <span className="text-sm font-medium">{machineName}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Selection Display */}
        <Card>
          <CardHeader>
            <CardTitle>目前設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sandbox:</span>
                <span className="text-sm font-medium">{getSandboxName(selectedSandbox)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}