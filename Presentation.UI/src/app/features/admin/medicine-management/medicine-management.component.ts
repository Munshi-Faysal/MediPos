import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MedicineListComponent } from './medicine-list/medicine-list.component';

@Component({
  selector: 'app-medicine-management',
  standalone: true,
  imports: [RouterModule, MedicineListComponent],
  template: `
    <router-outlet></router-outlet>
  `
})
export class MedicineManagementComponent {
  constructor() {}
}
