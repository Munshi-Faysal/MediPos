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
  private systemPrefersDark = signal(false);
  
  // Signals for reactive programming
  public theme = signal<ThemeMode>(this.DEFAULT_THEME);
  public isDark = computed(() => {
    const currentTheme = this.theme();
    if (currentTheme === 'system') {
      return this.systemPrefersDark();
    }
    return currentTheme === 'dark';
  });

  constructor() {
    this.systemPrefersDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
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
    // Toggle from the effective theme so the first click also works when the
    // saved preference is "system".
    const newTheme: ThemeMode = this.isDark() ? 'light' : 'dark';
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

    htmlElement.dataset['theme'] = isDark ? 'dark' : 'light';
    htmlElement.style.colorScheme = isDark ? 'dark' : 'light';
  }

  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (event) => {
      this.systemPrefersDark.set(event.matches);
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


