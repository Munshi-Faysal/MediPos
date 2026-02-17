import { Component, OnInit, signal, inject } from '@angular/core';

import { RouterOutlet } from '@angular/router';

import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { RealtimeService } from './core/services/realtime.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-background text-on-background transition-colors duration-300">
      <!-- Loading Screen -->
      @if (isLoading()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4">
              <div class="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center animate-bounce-subtle">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <h2 class="text-xl font-semibold text-on-surface mb-2">MediPOS</h2>
            <p class="text-on-surface-variant">Loading your workspace...</p>
          </div>
        </div>
      }
    
      <!-- Main App -->
      @if (!isLoading()) {
        <div>
          <router-outlet></router-outlet>
        </div>
      }
    </div>
    `,
  styles: []
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private realtimeService = inject(RealtimeService);

  public isLoading = signal(true);

  ngOnInit(): void {
    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    try {
      // Initialize theme
      this.themeService.setTheme(this.themeService.getTheme());

      // Initialize authentication
      const user = this.authService.getCurrentUser();
      if (user) {
        
      }

      // Initialize notifications with error handling
      try {
        this.notificationService.fetchNotifications();
      } catch (error) {
      }

      // Initialize realtime connection with error handling
      try {
        this.realtimeService.connect();
      } catch (error) {
      }

      // Reduce loading time to prevent unresponsive behavior
      await new Promise(resolve => setTimeout(resolve, 500));

      this.isLoading.set(false);
    } catch (error) {
      this.isLoading.set(false);
    }
  }
}