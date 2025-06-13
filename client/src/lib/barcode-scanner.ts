declare global {
  interface Window {
    Quagga: any;
  }
}

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
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;

  constructor(config: ScannerConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isScanning) return;

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('不支援相機功能');
      }

      // Request camera permission and stream
      console.log('Requesting camera permission...');
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 }
        },
        audio: false
      });
      
      console.log('Camera permission granted');

      // Create video element
      this.video = document.createElement('video');
      this.video.style.width = '100%';
      this.video.style.height = '100%';
      this.video.style.objectFit = 'cover';
      this.video.autoplay = true;
      this.video.playsInline = true;
      this.video.muted = true;
      this.video.srcObject = this.stream;

      // Create canvas for frame capture
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');

      // Clear target and add video
      this.config.target.innerHTML = '';
      this.config.target.appendChild(this.video);

      this.isScanning = true;

      // Load QuaggaJS for barcode detection
      if (!window.Quagga) {
        await this.loadQuaggaJS();
      }

      // Start video and begin scanning
      await this.video.play();
      this.startBarcodeDetection();

    } catch (error) {
      console.error('Camera access error:', error);
      this.config.onError('無法存取相機，請在瀏覽器設定中允許相機權限');
      this.isScanning = false;
    }
  }

  private startBarcodeDetection(): void {
    if (!this.video || !this.canvas || !this.context) return;

    const detectFrame = () => {
      if (!this.isScanning || !this.video || !this.canvas || !this.context) return;

      // Only process if video is ready
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        // Set canvas size to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Draw current video frame to canvas
        this.context.drawImage(this.video, 0, 0);

        // Get image data for barcode detection
        const imageData = this.canvas.toDataURL('image/jpeg', 0.5);

        // Use QuaggaJS to detect barcode
        try {
          window.Quagga.decodeSingle({
            decoder: {
              readers: [
                "code_128_reader",
                "ean_reader",
                "ean_8_reader",
                "code_39_reader",
                "code_93_reader"
              ]
            },
            locate: true,
            src: imageData
          }, (result: any) => {
            if (result && result.codeResult && result.codeResult.code) {
              const code = result.codeResult.code;
              console.log('Barcode detected:', code);
              this.config.onDetected(code);
              return;
            }
            
            // Continue scanning after a short delay
            setTimeout(() => {
              if (this.isScanning) {
                this.animationId = requestAnimationFrame(detectFrame);
              }
            }, 100);
          });
        } catch (error) {
          // Continue scanning on error
          setTimeout(() => {
            if (this.isScanning) {
              this.animationId = requestAnimationFrame(detectFrame);
            }
          }, 200);
        }
      } else {
        // Continue scanning if video not ready
        this.animationId = requestAnimationFrame(detectFrame);
      }
    };

    // Start detection loop with a small delay
    setTimeout(() => {
      if (this.isScanning) {
        this.animationId = requestAnimationFrame(detectFrame);
      }
    }, 500);
  }

  stop(): void {
    if (!this.isScanning) return;

    this.isScanning = false;

    // Stop animation frame
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Stop video stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Clean up video element
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }

    // Clean up canvas
    this.canvas = null;
    this.context = null;

    // Clear target element
    if (this.config.target) {
      this.config.target.innerHTML = '';
    }
  }

  private async loadQuaggaJS(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load QuaggaJS'));
      document.head.appendChild(script);
    });
  }

  isRunning(): boolean {
    return this.isScanning;
  }
}
