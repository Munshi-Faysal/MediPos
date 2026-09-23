import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { installGlobalSweetAlerts } from './app/core/utils/app-alert';

installGlobalSweetAlerts();

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
