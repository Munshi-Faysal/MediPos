import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Input() placeholder = 'Search...';
  @Input() debounceTime = 300;
  @Input() showClearButton = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchSubmit = new EventEmitter<string>();

  searchQuery = signal<string>('');
  private debounceTimer: any;

  onInput(value: string): void {
    this.searchQuery.set(value);
    
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer for debounce
    this.debounceTimer = setTimeout(() => {
      this.searchChange.emit(value);
    }, this.debounceTime);
  }

  onClear(): void {
    this.searchQuery.set('');
    this.searchChange.emit('');
  }

  onSubmit(): void {
    this.searchSubmit.emit(this.searchQuery());
  }

  getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-5 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  }
}
