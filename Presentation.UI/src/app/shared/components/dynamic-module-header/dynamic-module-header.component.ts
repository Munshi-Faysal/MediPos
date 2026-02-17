import { Component, Input, computed } from '@angular/core';


export interface ModuleHeaderStatCard {
  label: string;
  value: string | number;
  icon?: string; // SVG path data
  iconColor?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  valueColor?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  bgColor?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export interface ModuleHeaderConfig {
  title: string;
  description?: string;
  stats?: ModuleHeaderStatCard[];
}

@Component({
  selector: 'app-dynamic-module-header',
  standalone: true,
  imports: [],
  template: `
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-on-surface">{{ config.title }}</h1>
        @if (config.description) {
          <p class="text-on-surface-variant mt-1">{{ config.description }}</p>
        }
      </div>
    </div>
    
    <!-- Stats Cards -->
    @if (config.stats && config.stats.length > 0) {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        @for (stat of config.stats; track $index) {
          <div
            class="bg-surface border border-border rounded-lg p-6"
            >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-on-surface-variant">{{ stat.label }}</p>
                <p
                  class="text-2xl font-bold"
                  [class]="getValueColorClass(stat.valueColor)"
                  >
                  {{ stat.value }}
                </p>
              </div>
              @if (stat.icon) {
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center"
                  [class]="getIconBgClass(stat.iconColor || 'primary')"
                  >
                  <svg
                    class="h-6 w-6"
                    [class]="getIconColorClass(stat.iconColor || 'primary')"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      [attr.d]="stat.icon"
                    ></path>
                  </svg>
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
    `,
  styles: []
})
export class DynamicModuleHeaderComponent {
  @Input() config!: ModuleHeaderConfig;

  getIconBgClass(color: 'primary' | 'success' | 'warning' | 'error' | 'info'): string {
    const colorMap = {
      primary: 'bg-primary-100',
      success: 'bg-success-100',
      warning: 'bg-warning-100',
      error: 'bg-error-100',
      info: 'bg-info-100'
    };
    return colorMap[color] || colorMap.primary;
  }

  getIconColorClass(color: 'primary' | 'success' | 'warning' | 'error' | 'info'): string {
    const colorMap = {
      primary: 'text-primary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      error: 'text-error-600',
      info: 'text-info-600'
    };
    return colorMap[color] || colorMap.primary;
  }

  getValueColorClass(color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default'): string {
    if (!color || color === 'default') {
      return 'text-on-surface';
    }
    const colorMap = {
      primary: 'text-primary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      error: 'text-error-600',
      info: 'text-info-600',
      default: 'text-on-surface'
    };
    return colorMap[color] || colorMap.default;
  }
}

