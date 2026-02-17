# Dynamic Module Header Component

A reusable component for creating consistent module headers with title, description, and optional statistics cards.

## Usage

### Basic Example

```typescript
import { ModuleHeaderConfigService } from '../../../shared/components/dynamic-module-header/module-header-config.service';
import { DynamicModuleHeaderComponent } from '../../../shared/components/dynamic-module-header/dynamic-module-header.component';

@Component({
  // ...
  imports: [DynamicModuleHeaderComponent],
  // ...
})
export class MyComponent {
  constructor(private moduleHeaderConfigService: ModuleHeaderConfigService) {}

  // Simple header without stats
  public moduleHeaderConfig = computed(() => {
    return this.moduleHeaderConfigService.createConfig(
      'My Module Title',
      'My module description'
    )();
  });
}
```

### With Stats Cards

```typescript
export class MyComponent {
  public totalItems = signal(100);
  public activeItems = computed(() => this.items().filter(i => i.isActive).length);
  public inactiveItems = computed(() => this.items().filter(i => !i.isActive).length);

  public moduleHeaderConfig = computed(() => {
    return this.moduleHeaderConfigService.createConfig(
      'My Module Title',
      'My module description',
      () => this.moduleHeaderConfigService.createStatCards([
        {
          label: 'Total Items',
          valueGetter: () => this.totalItems(),
          icon: 'M13 10V3L4 14h7v7l9-11h-7z',
          iconColor: 'primary',
          valueColor: 'default'
        },
        {
          label: 'Active Items',
          valueGetter: () => this.activeItems(),
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
          iconColor: 'success',
          valueColor: 'success'
        },
        {
          label: 'Inactive Items',
          valueGetter: () => this.inactiveItems(),
          icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
          iconColor: 'warning',
          valueColor: 'warning'
        }
      ])
    )();
  });
}
```

### In Template

```html
<app-dynamic-module-header [config]="moduleHeaderConfig()"></app-dynamic-module-header>
```

## Available Icon Colors

- `primary` - Primary color
- `success` - Success/green color
- `warning` - Warning/yellow color
- `error` - Error/red color
- `info` - Info/blue color

## Available Value Colors

- `default` - Default text color
- `primary` - Primary color
- `success` - Success/green color
- `warning` - Warning/yellow color
- `error` - Error/red color
- `info` - Info/blue color

## Icon SVG Paths

The `icon` property accepts SVG path data (the `d` attribute of an SVG path element). Common icons:

- **Lightning/Flash**: `M13 10V3L4 14h7v7l9-11h-7z`
- **Check Circle**: `M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z`
- **Ban/Block**: `M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636`
- **Info Circle**: `M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z`
- **Exclamation**: `M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z`

