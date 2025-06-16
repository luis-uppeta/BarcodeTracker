import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { sandboxOptions, getSandboxName } from '@/lib/utils';

export default function Settings() {
  const [selectedSandbox, setSelectedSandbox] = useState<string>(
    localStorage.getItem('selectedSandbox') || 'vigenair'
  );

  useEffect(() => {
    localStorage.setItem('selectedSandbox', selectedSandbox);
  }, [selectedSandbox]);

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