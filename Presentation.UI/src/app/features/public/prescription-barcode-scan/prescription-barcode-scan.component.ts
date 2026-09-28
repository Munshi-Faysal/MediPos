import { Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import type { IScannerControls } from '@zxing/browser';

@Component({
  selector: 'app-prescription-barcode-scan',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './prescription-barcode-scan.component.html',
  styleUrls: ['./prescription-barcode-scan.component.scss']
})
export class PrescriptionBarcodeScanComponent implements OnDestroy {
  private router = inject(Router);
  @ViewChild('cameraPreview') private cameraPreview?: ElementRef<HTMLVideoElement>;

  code = '';
  scanning = false;
  error = '';
  private controls?: IScannerControls;

  async startCamera(): Promise<void> {
    if (this.scanning) return;
    if (!navigator.mediaDevices?.getUserMedia || !this.cameraPreview) {
      this.error = 'Camera is unavailable. Enter the printed barcode number below.';
      return;
    }

    this.error = '';
    this.scanning = true;
    try {
      const { BrowserMultiFormatOneDReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatOneDReader();
      const controls = await reader.decodeFromVideoDevice(undefined, this.cameraPreview.nativeElement, (result, _error, scannerControls) => {
        if (result && this.scanning) this.openCode(result.getText(), scannerControls);
      });
      if (!this.scanning) controls.stop();
      else this.controls = controls;
    } catch {
      this.stopCamera();
      this.error = 'Could not start the camera. Allow camera access or enter the printed number below.';
    }
  }

  stopCamera(): void {
    this.scanning = false;
    this.controls?.stop();
    this.controls = undefined;
    const stream = this.cameraPreview?.nativeElement.srcObject;
    if (stream instanceof MediaStream) stream.getTracks().forEach(track => track.stop());
  }

  submitCode(): void {
    this.openCode(this.code);
  }

  private openCode(value: string, scannerControls?: IScannerControls): void {
    const code = value.trim();
    if (!/^\d{16}$/.test(code)) {
      this.error = 'Enter the 16-digit number printed under the prescription barcode.';
      return;
    }

    scannerControls?.stop();
    this.stopCamera();
    this.router.navigate(['/p/code', code]);
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }
}
