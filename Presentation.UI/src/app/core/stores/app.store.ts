import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { signal, computed } from '@angular/core';

export interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;

  // User preferences
  language: string;
  timezone: string;

  // Notifications
  notificationsEnabled: boolean;
  unreadNotifications: number;

  // Error handling
  error: string | null;
  errorType: 'error' | 'warning' | 'info' | null;
}

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  // Initial state
  private initialState: AppState = {
    sidebarOpen: true,
    theme: 'light',
    loading: false,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notificationsEnabled: true,
    unreadNotifications: 0,
    error: null,
    errorType: null
  };

  // BehaviorSubject for RxJS compatibility
  private stateSubject = new BehaviorSubject<AppState>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  // Signals for Angular reactive programming
  private stateSignal = signal<AppState>(this.initialState);

  // Computed signals
  public sidebarOpen = computed(() => this.stateSignal().sidebarOpen);
  public theme = computed(() => this.stateSignal().theme);
  public loading = computed(() => this.stateSignal().loading);
  public language = computed(() => this.stateSignal().language);
  public timezone = computed(() => this.stateSignal().timezone);
  public notificationsEnabled = computed(() => this.stateSignal().notificationsEnabled);
  public unreadNotifications = computed(() => this.stateSignal().unreadNotifications);
  public error = computed(() => this.stateSignal().error);
  public errorType = computed(() => this.stateSignal().errorType);

  // Computed: Has error
  public hasError = computed(() => this.error() !== null);

  constructor() {
    // Load preferences from localStorage
    this.loadPreferences();
  }

  // State getters (RxJS)
  getState(): Observable<AppState> {
    return this.state$;
  }

  // UI State setters
  toggleSidebar(): void {
    const current = this.stateSignal();
    this.updateState({ sidebarOpen: !current.sidebarOpen });
    this.savePreferences();
  }

  setSidebarOpen(open: boolean): void {
    this.updateState({ sidebarOpen: open });
    this.savePreferences();
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.updateState({ theme });
    this.savePreferences();
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const current = this.stateSignal();
    const newTheme = current.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  // User preferences setters
  setLanguage(language: string): void {
    this.updateState({ language });
    this.savePreferences();
  }

  setTimezone(timezone: string): void {
    this.updateState({ timezone });
    this.savePreferences();
  }

  // Notification setters
  setNotificationsEnabled(enabled: boolean): void {
    this.updateState({ notificationsEnabled: enabled });
    this.savePreferences();
  }

  setUnreadNotifications(count: number): void {
    this.updateState({ unreadNotifications: count });
  }

  incrementUnreadNotifications(): void {
    const current = this.stateSignal();
    this.updateState({ unreadNotifications: current.unreadNotifications + 1 });
  }

  decrementUnreadNotifications(): void {
    const current = this.stateSignal();
    const newCount = Math.max(0, current.unreadNotifications - 1);
    this.updateState({ unreadNotifications: newCount });
  }

  clearUnreadNotifications(): void {
    this.updateState({ unreadNotifications: 0 });
  }

  // Error handling
  setError(error: string | null, type: 'error' | 'warning' | 'info' = 'error'): void {
    this.updateState({ error, errorType: error ? type : null });
  }

  clearError(): void {
    this.updateState({ error: null, errorType: null });
  }

  // Helper method to update state
  private updateState(partial: Partial<AppState>): void {
    const current = this.stateSignal();
    const newState = { ...current, ...partial };
    this.stateSignal.set(newState);
    this.stateSubject.next(newState);
  }

  // Load preferences from localStorage
  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('app_preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.updateState({
          sidebarOpen: preferences.sidebarOpen ?? this.initialState.sidebarOpen,
          theme: preferences.theme ?? this.initialState.theme,
          language: preferences.language ?? this.initialState.language,
          timezone: preferences.timezone ?? this.initialState.timezone,
          notificationsEnabled: preferences.notificationsEnabled ?? this.initialState.notificationsEnabled
        });
        this.applyTheme(preferences.theme ?? this.initialState.theme);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  // Save preferences to localStorage
  private savePreferences(): void {
    try {
      const current = this.stateSignal();
      const preferences = {
        sidebarOpen: current.sidebarOpen,
        theme: current.theme,
        language: current.language,
        timezone: current.timezone,
        notificationsEnabled: current.notificationsEnabled
      };
      localStorage.setItem('app_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  // Apply theme to document
  private applyTheme(theme: 'light' | 'dark'): void {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Reset state
  reset(): void {
    this.stateSignal.set(this.initialState);
    localStorage.removeItem('app_preferences');
    this.applyTheme('light');
  }
}
