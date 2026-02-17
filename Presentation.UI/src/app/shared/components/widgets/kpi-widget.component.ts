import { Component, Input, Output, EventEmitter, signal } from '@angular/core';


export interface KPIData {
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  label?: string;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-kpi-widget',
  standalone: true,
  imports: [],
  templateUrl: './kpi-widget.component.html',
  styleUrls: ['./kpi-widget.component.scss']
})
export class KpiWidgetComponent {
  @Input() data: KPIData | null = null;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() isLoading = false;
  @Input() showTrend = true;
  @Input() showChange = true;
  
  @Output() refresh = new EventEmitter<void>();
  @Output() drillThrough = new EventEmitter<any>();

  // Make Math available in template
  public Math = Math;

  public formatValue(value: number | string): string {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value.toString();
  }

  public getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'M7 11l5-5m0 0l5 5m-5-5v12';
      case 'down': return 'M17 13l-5 5m0 0l-5-5m5 5V6';
      default: return 'M20 12H4';
    }
  }

  public getTrendColor(trend: string): string {
    switch (trend) {
      case 'up': return 'text-success-600';
      case 'down': return 'text-error-600';
      default: return 'text-on-surface-variant';
    }
  }

  public getColorClass(color: string): string {
    switch (color) {
      case 'primary': return 'text-primary-600';
      case 'success': return 'text-success-600';
      case 'warning': return 'text-warning-600';
      case 'error': return 'text-error-600';
      default: return 'text-on-surface';
    }
  }

  public onRefresh(): void {
    this.refresh.emit();
  }

  public onDrillThrough(): void {
    this.drillThrough.emit();
  }
}
