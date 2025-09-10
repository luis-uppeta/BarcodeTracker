export interface ScannerConfig {
  target: HTMLElement;
  onDetected: (code: string) => void;
  onError: (error: string) => void;
}

export class BarcodeScanner {
  private isScanning = false;
  private config: ScannerConfig;
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;

  constructor(config: ScannerConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isScanning) return;

    try {
      console.log('請求相機權限...');
      
      // 直接請求相機權限
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      });

      console.log('相機權限已允許');

      // 創建 video 元素
      this.video = document.createElement('video');
      this.video.playsInline = true;
      this.video.autoplay = true;
      this.video.muted = true;
      this.video.style.width = '100%';
      this.video.style.height = '100%';
      this.video.style.objectFit = 'cover';
      this.video.srcObject = this.stream;

      // 清空目標容器並加入 video
      this.config.target.innerHTML = '';
      this.config.target.appendChild(this.video);

      this.isScanning = true;

      // 等待 video 開始播放
      await new Promise<void>((resolve) => {
        this.video!.onloadedmetadata = () => {
          this.video!.play().then(() => {
            console.log('相機已啟動');
            resolve();
          });
        };
      });

      // 添加點擊事件來模擬掃描
      this.video.addEventListener('click', this.handleVideoClick);

    } catch (error: any) {
      console.error('相機啟動失敗:', error);
      
      if (error.name === 'NotAllowedError') {
        this.config.onError('相機權限被拒絕，請允許存取相機');
      } else if (error.name === 'NotFoundError') {
        this.config.onError('找不到相機裝置');
      } else {
        this.config.onError('無法啟動相機: ' + error.message);
      }
      
      this.isScanning = false;
    }
  }

  private handleVideoClick = () => {
    // 模擬掃描到條碼 - 實際應用中這裡會是真正的條碼識別
    const mockBarcodes = ['A123', 'B567', 'C901', 'D345'];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    
    console.log('模擬掃描到條碼:', randomBarcode);
    this.config.onDetected(randomBarcode);
  };

  stop(): void {
    if (!this.isScanning) return;

    this.isScanning = false;

    // 移除事件監聽器
    if (this.video) {
      this.video.removeEventListener('click', this.handleVideoClick);
    }

    // 停止相機串流
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log('相機串流已停止');
      });
      this.stream = null;
    }

    // 清理 video 元素
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }

    // 清空目標容器
    if (this.config.target) {
      this.config.target.innerHTML = '';
    }

    console.log('掃描器已停止');
  }

  isRunning(): boolean {
    return this.isScanning;
  }
}
