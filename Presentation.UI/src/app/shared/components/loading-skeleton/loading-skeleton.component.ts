import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';


export interface LoadingSkeletonConfig {
  type: 'text' | 'rect' | 'circle' | 'card';
  width?: string;
  height?: string;
  lines?: number;
  animated?: boolean;
}

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [],
  template: `
    <div class="skeleton-container" [class.animate-pulse]="config.animated !== false">
      <!-- Text Skeleton -->
      @if (config.type === 'text') {
        <div
          class="space-y-2"
          >
          @for (line of textLines(); track line) {
            <div
              class="skeleton h-4 rounded"
              [style.width]="line.width"
            ></div>
          }
        </div>
      }
    
      <!-- Rectangle Skeleton -->
      @if (config.type === 'rect') {
        <div
          class="skeleton rounded"
          [style.width]="config.width || '100%'"
          [style.height]="config.height || '200px'"
        ></div>
      }
    
      <!-- Circle Skeleton -->
      @if (config.type === 'circle') {
        <div
          class="skeleton rounded-full"
          [style.width]="config.width || '40px'"
          [style.height]="config.height || '40px'"
        ></div>
      }
    
      <!-- Card Skeleton -->
      @if (config.type === 'card') {
        <div
          class="card p-6 space-y-4"
          >
          <div class="flex items-center gap-3">
            <div class="skeleton w-10 h-10 rounded-full"></div>
            <div class="space-y-2 flex-1">
              <div class="skeleton h-4 w-3/4 rounded"></div>
              <div class="skeleton h-3 w-1/2 rounded"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="skeleton h-4 w-full rounded"></div>
            <div class="skeleton h-4 w-5/6 rounded"></div>
            <div class="skeleton h-4 w-4/6 rounded"></div>
          </div>
          <div class="flex gap-2">
            <div class="skeleton h-8 w-20 rounded"></div>
            <div class="skeleton h-8 w-16 rounded"></div>
          </div>
        </div>
      }
    </div>
    `,
  styles: [`
    .skeleton-container {
      @apply relative overflow-hidden;
    }
    
    .skeleton {
      @apply bg-surface-variant;
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() config: LoadingSkeletonConfig = { type: 'text' };

  textLines() {
    const lines = this.config.lines || 3;
    const widths = ['100%', '85%', '70%', '90%', '60%'];

    return Array.from({ length: lines }, (_, i) => ({
      width: widths[i % widths.length]
    }));
  }
}
