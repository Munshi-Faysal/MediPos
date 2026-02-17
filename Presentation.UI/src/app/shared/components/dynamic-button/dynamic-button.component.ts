import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation, ElementRef, Renderer2, AfterViewInit, OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewChecked, OnDestroy, inject } from '@angular/core';


export interface DynamicButtonConfig {
  label: string;
  action: string; // Unique identifier for the action
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  icon?: string; // SVG path or icon class
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  visible?: boolean;
  loading?: boolean;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
  customClass?: string;
  showOnlyIcon?: boolean; // Show only icon on small screens
  customColor?: string; // Custom color code (hex, rgb, etc.) from ActionColor field
  isSelected?: boolean; // If true, button requires row selection to be enabled
}

@Component({
  selector: 'app-dynamic-button',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <button
      type="button"
      [class]="getButtonClasses()"
      [class.has-custom-color]="hasCustomColor()"
      [attr.data-custom-color]="hasCustomColor() ? (config.customColor?.trim() || null) : null"
      [style.--custom-bg]="getBackgroundColor()"
      [style.--custom-border]="getBorderColor()"
      [style.--custom-text]="getTextColor()"
      [attr.style]="getInlineStyleString()"
      [disabled]="config.disabled || config.loading"
      [title]="config.tooltip || config.label"
      (click)="onClick.emit(config.action)"
      >
      <!-- Loading Spinner -->
      @if (config.loading) {
        <svg
          class="animate-spin h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      }
    
      <!-- Font Awesome Icon (Left) -->
      @if (config.icon && config.iconPosition !== 'right' && !config.loading && isFontAwesomeIcon()) {
        <i
          [class]="config.icon"
          [class.mr-2]="!config.showOnlyIcon && config.label"
          [class.sm:mr-2]="config.showOnlyIcon && config.label"
        ></i>
      }
    
      <!-- SVG Icon (Left) -->
      @if (config.icon && config.iconPosition !== 'right' && !config.loading && !isFontAwesomeIcon() && getIconPath()) {
        <svg
          class="h-4 w-4 sm:h-5 sm:w-5"
          [class.mr-2]="!config.showOnlyIcon && config.label"
          [class.sm:mr-2]="config.showOnlyIcon && config.label"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            [attr.d]="getIconPath()"
          ></path>
        </svg>
      }
    
      <!-- Label -->
      <span
        [class.hidden]="config.showOnlyIcon"
        class="sm:inline"
        >
        {{ config.label }}
      </span>
    
      <!-- Font Awesome Icon (Right) -->
      @if (config.icon && config.iconPosition === 'right' && !config.loading && isFontAwesomeIcon()) {
        <i
          [class]="config.icon"
          class="ml-2"
        ></i>
      }
    
      <!-- SVG Icon (Right) -->
      @if (config.icon && config.iconPosition === 'right' && !config.loading && !isFontAwesomeIcon() && getIconPath()) {
        <svg
          class="h-4 w-4 sm:h-5 sm:w-5 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            [attr.d]="getIconPath()"
          ></path>
        </svg>
      }
    </button>
    `,
  styles: [`
    /* Force override ALL Tailwind color classes when customColor is present */
    /* Use very specific selectors to override Tailwind */
    app-dynamic-button button.has-custom-color,
    app-dynamic-button button[data-custom-color],
    app-dynamic-button button.has-custom-color.bg-error-600,
    app-dynamic-button button.has-custom-color.bg-success-600,
    app-dynamic-button button.has-custom-color.bg-primary-600,
    app-dynamic-button button.has-custom-color.bg-secondary-600,
    app-dynamic-button button.has-custom-color.bg-primary-700,
    app-dynamic-button button.has-custom-color.bg-error-700,
    app-dynamic-button button.has-custom-color.bg-success-700,
    app-dynamic-button button[data-custom-color].bg-error-600,
    app-dynamic-button button[data-custom-color].bg-success-600,
    app-dynamic-button button[data-custom-color].bg-primary-600,
    app-dynamic-button button[data-custom-color].bg-secondary-600,
    app-dynamic-button button[data-custom-color].bg-primary-700,
    app-dynamic-button button[data-custom-color].bg-error-700,
    app-dynamic-button button[data-custom-color].bg-success-700,
    /* Override text colors */
    app-dynamic-button button.has-custom-color.text-white,
    app-dynamic-button button.has-custom-color.text-on-surface,
    app-dynamic-button button[data-custom-color].text-white,
    app-dynamic-button button[data-custom-color].text-on-surface {
      background-color: var(--custom-bg) !important;
      border-color: var(--custom-border) !important;
      color: var(--custom-text) !important;
    }
    app-dynamic-button button.has-custom-color:hover,
    app-dynamic-button button[data-custom-color]:hover {
      opacity: 0.9 !important;
      filter: brightness(0.9) !important;
    }
  `]
})
export class DynamicButtonComponent implements AfterViewInit, OnChanges, AfterViewChecked, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private cdr = inject(ChangeDetectorRef);

  @Input() config!: DynamicButtonConfig;
  @Output() onClick = new EventEmitter<string>();

  private buttonElement?: HTMLElement;
  private lastCustomColor?: string;
  private lastDisabled?: boolean;
  private lastLoading?: boolean;
  private mutationObserver?: MutationObserver;

  /**
   * Check if button has a valid custom color
   * Always return true if customColor exists - color should always be applied from database
   * Disabled/loading state should not affect the color application
   */
  hasCustomColor(): boolean {
    const customColor = this.config?.customColor?.trim();
    return !!customColor && customColor !== '';
  }

  ngAfterViewInit(): void {
    this.buttonElement = this.el.nativeElement.querySelector('button');
    
    // Set up MutationObserver to watch for class changes and re-apply colors
    if (this.buttonElement) {
      this.setupMutationObserver();
    }
    
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
      this.applyCustomColors();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  /**
   * Set up MutationObserver to watch for class changes and re-apply custom colors
   */
  private setupMutationObserver(): void {
    if (!this.buttonElement) return;

    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldReapply = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // Class was changed, check if we need to re-apply colors
          const customColor = this.config?.customColor?.trim();
          if (customColor && customColor !== '') {
            shouldReapply = true;
          }
        }
      });

      if (shouldReapply) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          this.applyCustomColors();
        });
      }
    });

    // Observe class attribute changes
    this.mutationObserver.observe(this.buttonElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      // Force change detection
      this.cdr.markForCheck();
      // Re-find button element if needed
      if (!this.buttonElement) {
        this.buttonElement = this.el.nativeElement.querySelector('button');
      }
      // Apply colors with a small delay to ensure DOM is updated
      setTimeout(() => {
        this.applyCustomColors();
      }, 0);
    }
  }

  ngAfterViewChecked(): void {
    // Check if customColor, disabled, or loading state changed
    // Only re-apply if something actually changed to avoid performance issues
    if (!this.config) return;
    
    // Ensure button element is found
    if (!this.buttonElement) {
      this.buttonElement = this.el.nativeElement.querySelector('button');
      if (!this.buttonElement) return;
    }
    
    const currentCustomColor = this.config.customColor;
    const currentDisabled = this.config.disabled;
    const currentLoading = this.config.loading;
    
    // Only re-apply if values actually changed
    if (this.lastCustomColor !== currentCustomColor ||
        this.lastDisabled !== currentDisabled ||
        this.lastLoading !== currentLoading) {
      this.lastCustomColor = currentCustomColor;
      this.lastDisabled = currentDisabled;
      this.lastLoading = currentLoading;
      // Apply colors immediately
      this.applyCustomColors();
    }
  }

  /**
   * Apply custom colors directly to the button element using Renderer2
   * This ensures styles override Tailwind classes with !important
   */
  private applyCustomColors(): void {
    // Re-find button element if not found
    if (!this.buttonElement) {
      this.buttonElement = this.el.nativeElement.querySelector('button');
    }
    
    if (!this.buttonElement || !this.config) return;

    // Get and validate custom color
    // Always apply customColor if it exists from database - don't check disabled/loading state
    const customColor = this.config.customColor?.trim();
    const hasCustomColor = !!customColor && customColor !== '';

    if (hasCustomColor) {
      const bgColor = customColor;
      const borderColor = customColor;
      const textColor = '#ffffff'; // Always white text for all buttons

      // Debug: Log to verify color is being applied
      console.log(`[DynamicButton] Applying custom color for "${this.config.label}": ${customColor}`);

      // First, remove ANY existing Tailwind color classes by manipulating the classList
      // This is more aggressive than just relying on CSS
      // Remove ALL possible Tailwind color classes - iterate through all classes and remove color-related ones
      const classList = this.buttonElement.classList;
      const allClasses = Array.from(classList);
      
      // Remove any class that starts with bg-, text-, border- (except border itself), or hover:bg-
      allClasses.forEach(cls => {
        if (cls.startsWith('bg-') || 
            cls.startsWith('text-') || 
            (cls.startsWith('border-') && cls !== 'border') ||
            cls.startsWith('hover:bg-') ||
            cls.startsWith('hover:text-') ||
            cls.startsWith('hover:border-')) {
          this.renderer.removeClass(this.buttonElement!, cls);
        }
      });
      
      // Also remove classes that might have been added by Angular's class binding
      // Force remove by directly manipulating classList
      const remainingClasses = Array.from(this.buttonElement.classList);
      remainingClasses.forEach(cls => {
        if (cls.startsWith('bg-') || 
            cls.startsWith('text-') || 
            (cls.startsWith('border-') && cls !== 'border') ||
            cls.startsWith('hover:bg-') ||
            cls.startsWith('hover:text-') ||
            cls.startsWith('hover:border-')) {
          this.buttonElement!.classList.remove(cls);
        }
      });

      // Set CSS variables (for CSS rules)
      this.renderer.setStyle(this.buttonElement, '--custom-bg', bgColor, 2);
      this.renderer.setStyle(this.buttonElement, '--custom-border', borderColor, 2);
      this.renderer.setStyle(this.buttonElement, '--custom-text', textColor, 2);
      
      // Set styles directly with Renderer2 AND native element for maximum control
      // Use both methods to ensure styles are applied
      this.renderer.setStyle(this.buttonElement, 'background-color', bgColor, 2);
      this.renderer.setStyle(this.buttonElement, 'border-color', borderColor, 2);
      this.renderer.setStyle(this.buttonElement, 'border-width', '1px', 2);
      this.renderer.setStyle(this.buttonElement, 'border-style', 'solid', 2);
      this.renderer.setStyle(this.buttonElement, 'color', textColor, 2);
      
      // Also set directly on native element to bypass any Angular interference
      (this.buttonElement as any).style.setProperty('background-color', bgColor, 'important');
      (this.buttonElement as any).style.setProperty('border-color', borderColor, 'important');
      (this.buttonElement as any).style.setProperty('border-width', '1px', 'important');
      (this.buttonElement as any).style.setProperty('border-style', 'solid', 'important');
      (this.buttonElement as any).style.setProperty('color', textColor, 'important');

      // Use setAttribute with style string to apply !important
      // This is the most reliable way to override Tailwind
      const styleString = this.getInlineStyleString();
      if (styleString) {
        // Directly set the style attribute - this will override all CSS
        // Use nativeElement to bypass Angular's renderer for maximum control
        (this.buttonElement as any).style.cssText = styleString;
        
        // Also set via renderer as backup
        this.renderer.setAttribute(this.buttonElement, 'style', styleString);
      }
      
      // Force re-application after a short delay to ensure it sticks
      setTimeout(() => {
        if (this.buttonElement && hasCustomColor) {
          // Re-remove any classes that might have been re-added
          const allClasses = Array.from(this.buttonElement.classList);
          allClasses.forEach(cls => {
            if (cls.startsWith('bg-') || 
                cls.startsWith('text-') || 
                (cls.startsWith('border-') && cls !== 'border') ||
                cls.startsWith('hover:bg-') ||
                cls.startsWith('hover:text-') ||
                cls.startsWith('hover:border-')) {
              this.renderer.removeClass(this.buttonElement!, cls);
            }
          });
          
          // Re-apply styles
          if (styleString) {
            (this.buttonElement as any).style.cssText = styleString;
          }
        }
      }, 10);
    } else {
      // Remove custom colors if not applicable
      // Only remove if we previously had custom colors
      if (this.lastCustomColor) {
        this.renderer.removeAttribute(this.buttonElement, 'style');
        this.renderer.removeStyle(this.buttonElement, '--custom-bg');
        this.renderer.removeStyle(this.buttonElement, '--custom-border');
        this.renderer.removeStyle(this.buttonElement, '--custom-text');
        this.renderer.removeStyle(this.buttonElement, 'background-color');
        this.renderer.removeStyle(this.buttonElement, 'border-color');
        this.renderer.removeStyle(this.buttonElement, 'color');
      }
    }
  }

  getButtonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center rounded-md transition-colors font-medium min-h-[44px] sm:min-h-[40px]';

    // Size classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs min-h-[36px]',
      md: 'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm',
      lg: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base'
    };

    // Variant classes - completely exclude ALL color classes if customColor is provided
    const customColor = this.config.customColor?.trim();
    const hasCustomColor = !!customColor && customColor !== '' && !this.config.disabled && !this.config.loading;
    
    let variantClasses = '';
    if (!hasCustomColor) {
      // Apply full variant classes when no custom color
      const variantClassMap = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed',
        outline: 'border border-border text-on-surface hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed',
        ghost: 'text-on-surface hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed',
        danger: 'bg-error-600 text-white hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed',
        success: 'bg-success-600 text-white hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed'
      };
      const variant = this.config.variant || 'outline';
      variantClasses = variantClassMap[variant] || variantClassMap['outline'];
    } else {
      // When custom color is present, use ONLY structural classes - NO color classes at all
      // Completely remove all bg-*, text-*, border-* color classes
      // Only keep disabled states and structural classes
      // Always add border for custom color (color comes from inline style)
      variantClasses = 'disabled:opacity-50 disabled:cursor-not-allowed border';
    }

    const size = this.config.size || 'md';

    const classes = [
      baseClasses,
      sizeClasses[size],
      variantClasses,
      this.config.customClass || ''
    ].filter(c => c).join(' ');

    return classes;
  }

  getIconPath(): string {
    if (!this.config.icon) return '';  
    // Otherwise, treat it as an SVG path
    return this.config.icon;
  }

  /**
   * Check if icon is a Font Awesome class
   */
  isFontAwesomeIcon(): boolean {
    if (!this.config.icon) return false;
    return this.config.icon.startsWith('fa ') || 
           this.config.icon.startsWith('fas ') || 
           this.config.icon.startsWith('far ') || 
           this.config.icon.startsWith('fab ');
  }

  /**
   * Get background color - use customColor from database ActionColor field
   * Always apply if customColor exists, regardless of disabled/loading state
   */
  getBackgroundColor(): string | null {
    const customColor = this.config.customColor?.trim();
    if (customColor && customColor !== '') {
      // Always use custom color as background (from ActionColor field)
      return customColor;
    }
    return null;
  }

  /**
   * Get border color - use customColor from database ActionColor field
   * Always apply if customColor exists, regardless of disabled/loading state
   */
  getBorderColor(): string | null {
    const customColor = this.config.customColor?.trim();
    if (customColor && customColor !== '') {
      // Always use custom color for border (from ActionColor field)
      return customColor;
    }
    return null;
  }

  /**
   * Get text color - always white for all buttons with custom colors
   * Always apply if customColor exists, regardless of disabled/loading state
   */
  getTextColor(): string | null {
    const customColor = this.config.customColor?.trim();
    if (customColor && customColor !== '') {
      // Always use white text color for all buttons
      return '#ffffff';
    }
    return null;
  }

  /**
   * Get inline style string with !important to override Tailwind classes
   * This is the most direct way to ensure custom colors from ActionColor field are applied
   * Also sets CSS variables for the CSS rules
   */
  getInlineStyleString(): string | null {
    const customColor = this.config.customColor?.trim();
    // Always apply customColor if it exists from database - don't check disabled/loading state
    if (!customColor || customColor === '') {
      return null;
    }

    const styles: string[] = [];
    const bgColor = customColor;
    const borderColor = customColor;
    const textColor = '#ffffff'; // Always white text for all buttons

    // Set CSS variables first (for CSS rules)
    if (bgColor) {
      styles.push(`--custom-bg: ${bgColor}`);
      styles.push(`background-color: ${bgColor} !important`);
    }
    if (borderColor) {
      styles.push(`--custom-border: ${borderColor}`);
      styles.push(`border-color: ${borderColor} !important`);
      styles.push(`border-width: 1px !important`);
      styles.push(`border-style: solid !important`);
    }
    if (textColor) {
      styles.push(`--custom-text: ${textColor}`);
      styles.push(`color: ${textColor} !important`);
    }

    return styles.length > 0 ? styles.join('; ') : null;
  }

  /**
   * Get contrast color (white or black) based on background color
   */
  getContrastColor(hexColor: string): string {
    if (!hexColor) return '#ffffff';
    
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Handle 3-digit hex colors
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000000' : '#ffffff';
    }
    
    // Handle 6-digit hex colors
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000000' : '#ffffff';
    }
    
    return '#ffffff'; // Default to white
  }
}

