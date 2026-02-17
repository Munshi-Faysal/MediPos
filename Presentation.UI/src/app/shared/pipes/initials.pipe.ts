import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength = 2): string {
    if (!value) return '';

    const words = value.trim().split(/\s+/);
    
    if (words.length === 1) {
      return words[0].substring(0, maxLength).toUpperCase();
    }

    let initials = '';
    for (let i = 0; i < Math.min(words.length, maxLength); i++) {
      initials += words[i].charAt(0);
    }

    return initials.toUpperCase();
  }
}
