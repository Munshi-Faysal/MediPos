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
            <img
              src="assets/medipos-logo.png"
              alt="MediPOS"
              class="w-56 max-w-[70vw] h-auto mx-auto mb-4 animate-bounce-subtle"
            />
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
