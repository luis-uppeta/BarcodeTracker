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

  constructor(config: ScannerConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isScanning) return;

    try {
      // Load QuaggaJS dynamically
      if (!window.Quagga) {
        await this.loadQuaggaJS();
      }

      this.isScanning = true;

      const quaggaConfig = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: this.config.target,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          }
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_93_reader"
          ]
        },
        locate: true
      };

      window.Quagga.init(quaggaConfig, (err: any) => {
        if (err) {
          console.error('Scanner initialization failed:', err);
          this.config.onError('Scanner initialization failed');
          this.isScanning = false;
          return;
        }
        window.Quagga.start();
      });

      window.Quagga.onDetected((result: any) => {
        const code = result.codeResult.code;
        this.config.onDetected(code);
        this.stop();
      });

    } catch (error) {
      this.config.onError('Failed to start scanner');
      this.isScanning = false;
    }
  }

  stop(): void {
    if (!this.isScanning) return;

    try {
      if (window.Quagga) {
        window.Quagga.stop();
      }
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }

    this.isScanning = false;
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
