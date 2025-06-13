import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, Globe, QrCode, History as HistoryIcon, Cog } from 'lucide-react';
import { BarcodeScannerComponent } from '@/components/barcode-scanner';
import { ScanHistory } from '@/components/scan-history';
import { sandboxOptions } from '@/lib/utils';

export default function Scanner() {
  const [currentUID, setCurrentUID] = useState('');
  const [currentSandbox, setCurrentSandbox] = useState('notebook-lm');
  const [currentLanguage, setCurrentLanguage] = useState('zh');
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'settings'>('scan');
  
  const [location, navigate] = useLocation();
  const [match, params] = useRoute('/scanner/:sandbox?');

  // Set sandbox from URL params on mount
  useEffect(() => {
    if (params?.sandbox) {
      const validSandbox = sandboxOptions.find(option => option.value === params.sandbox);
      if (validSandbox) {
        setCurrentSandbox(params.sandbox);
      }
    } else {
      // If no sandbox in URL, update URL with current sandbox
      navigate(`/scanner/${currentSandbox}`, { replace: true });
    }
  }, [params?.sandbox, currentSandbox, navigate]);

  const handleSandboxChange = (value: string) => {
    setCurrentSandbox(value);
    navigate(`/scanner/${value}`, { replace: true });
  };



  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg relative">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium">條碼掃描器</h1>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-blue-700 text-white"
            >
              <Globe size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-full hover:bg-blue-700 text-white"
            >
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Sandbox Selector */}
      <div className="p-4 bg-blue-50 border-b">
        <Label className="block text-sm font-medium text-gray-700 mb-2">選擇 Sandbox</Label>
        <Select value={currentSandbox} onValueChange={handleSandboxChange}>
          <SelectTrigger className="w-full bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sandboxOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {activeTab === 'scan' && (
          <div className="space-y-6">
            {/* Combined Scanner and UID Input */}
            <BarcodeScannerComponent 
              uid={currentUID}
              onUidChange={setCurrentUID}
              sandbox={currentSandbox}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <ScanHistory />
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Cog className="mr-2" size={20} />
              設定
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">語言設定</Label>
                <p className="text-sm text-gray-600 mt-1">
                  當前語言: {currentLanguage === 'zh' ? '繁體中文' : 'English'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="mt-2"
                >
                  切換語言
                </Button>
              </div>
              <div>
                <Label className="text-sm font-medium">當前 Sandbox</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {sandboxOptions.find(opt => opt.value === currentSandbox)?.label}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('scan')}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === 'scan' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
            }`}
          >
            <QrCode size={20} className="mb-1" />
            <span className="text-xs">掃描</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === 'history' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
            }`}
          >
            <HistoryIcon size={20} className="mb-1" />
            <span className="text-xs">歷史</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === 'settings' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
            }`}
          >
            <Cog size={20} className="mb-1" />
            <span className="text-xs">設定</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
