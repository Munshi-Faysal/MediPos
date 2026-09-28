import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import JsBarcode from 'jsbarcode';
import { prescriptionBarcodeCode } from '../../../../../core/utils/prescription-barcode';

@Component({
  selector: 'app-prescription-barcode',
  standalone: true,
  template: `
    <div class="barcode-card">
      <svg #barcodeSvg class="barcode-svg" role="img" aria-label="Scan barcode to view this prescription" preserveAspectRatio="none"></svg>
      <p class="caption">SCAN IN MEDIPOS</p>
      <p class="code">{{ barcodeCode }}</p>
    </div>
  `,
  styles: [`
    :host { display: block; width: 104px; max-width: 100%; }
    .barcode-card { width: 100%; padding: 2px 0; background: #fff; text-align: center; break-inside: avoid; }
    .barcode-svg { display: block; width: 100%; height: 29px; background: #fff; }
    .caption { margin: 3px 0 0; color: #334155; font-size: 7px; font-weight: 800; letter-spacing: .11em; }
    .code { margin: 2px 0 0; color: #64748b; font: 7px ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: .04em; }
    @media print {
      .caption, .code { color: #111; }
    }
  `]
})
export class PrescriptionBarcodeComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) scanToken = '';
  @ViewChild('barcodeSvg') private barcodeSvg?: ElementRef<SVGElement>;

  get barcodeCode(): string {
    return prescriptionBarcodeCode(this.scanToken);
  }

  ngAfterViewInit(): void {
    this.renderBarcode();
  }

  ngOnChanges(): void {
    this.renderBarcode();
  }

  renderBarcode(): void {
    if (!this.barcodeCode || !this.barcodeSvg) return;

    JsBarcode(this.barcodeSvg.nativeElement, this.barcodeCode, {
      format: 'CODE128',
      width: 2,
      height: 40,
      margin: 0,
      marginLeft: 16,
      marginRight: 16,
      displayValue: false,
      lineColor: '#0f172a',
      background: '#ffffff'
    });
  }
}
