import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | null | undefined, format = 'short'): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) return '';

    const options: Intl.DateTimeFormatOptions = this.getFormatOptions(format);
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  private getFormatOptions(format: string): Intl.DateTimeFormatOptions {
    switch (format) {
      case 'short':
        return { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
      case 'long':
        return { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        };
      case 'date':
        return { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        };
      case 'time':
        return { 
          hour: '2-digit',
          minute: '2-digit'
        };
      case 'relative':
        return { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        };
      default:
        return { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
    }
  }
}
