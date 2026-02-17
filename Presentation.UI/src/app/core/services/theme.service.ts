import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'hrm_theme';
  private readonly DEFAULT_THEME: ThemeMode = 'system';

  private themeSubject = new BehaviorSubject<ThemeMode>(this.DEFAULT_THEME);
  
  // Signals for reactive programming
  public theme = signal<ThemeMode>(this.DEFAULT_THEME);
  public isDark = computed(() => {
    const currentTheme = this.theme();
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return currentTheme === 'dark';
  });

  constructor() {
    this.initializeTheme();
    this.setupSystemThemeListener();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode;
    const theme = savedTheme || this.DEFAULT_THEME;
    
    this.setTheme(theme);
  }

  setTheme(theme: ThemeMode): void {
    this.theme.set(theme);
    this.themeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    
    this.applyTheme();
  }

  getTheme(): ThemeMode {
    return this.theme();
  }

  getThemeObservable(): BehaviorSubject<ThemeMode> {
    return this.themeSubject;
  }

  toggleTheme(): void {
    const currentTheme = this.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private applyTheme(): void {
    const isDark = this.isDark();
    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', () => {
      if (this.theme() === 'system') {
        this.applyTheme();
      }
    });
  }

  // Theme color utilities
  getPrimaryColor(): string {
    return 'rgb(59 130 246)'; // blue-500
  }

  getSecondaryColor(): string {
    return 'rgb(100 116 139)'; // slate-500
  }

  getSuccessColor(): string {
    return 'rgb(34 197 94)'; // green-500
  }

  getWarningColor(): string {
    return 'rgb(245 158 11)'; // amber-500
  }

  getErrorColor(): string {
    return 'rgb(239 68 68)'; // red-500
  }
}


