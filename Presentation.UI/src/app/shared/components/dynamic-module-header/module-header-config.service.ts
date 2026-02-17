import { Injectable } from '@angular/core';
import { ModuleHeaderConfig, ModuleHeaderStatCard } from './dynamic-module-header.component';

@Injectable({
  providedIn: 'root'
})
export class ModuleHeaderConfigService {
  /**
   * Create a module header configuration with reactive values
   * @param title - Module title (can be a function that returns string)
   * @param description - Module description (optional, can be a function)
   * @param statsFactory - Function that returns array of stat cards (optional)
   * @returns Function that returns ModuleHeaderConfig (to be used with computed)
   */
  createConfig(
    title: string | (() => string),
    description?: string | (() => string),
    statsFactory?: () => ModuleHeaderStatCard[]
  ): () => ModuleHeaderConfig {
    return () => {
      const actualTitle = typeof title === 'function' ? title() : title;
      const actualDescription = typeof description === 'function' ? description() : description;
      const actualStats = statsFactory ? statsFactory() : undefined;

      return {
        title: actualTitle,
        description: actualDescription,
        stats: actualStats
      };
    };
  }

  /**
   * Create a stat card configuration
   * @param label - Stat card label
   * @param valueGetter - Function that returns the stat value (for reactive values)
   * @param icon - SVG path data for icon
   * @param iconColor - Icon background color
   * @param valueColor - Value text color
   * @returns ModuleHeaderStatCard
   */
  createStatCard(
    label: string,
    valueGetter: () => string | number,
    icon?: string,
    iconColor: 'primary' | 'success' | 'warning' | 'error' | 'info' = 'primary',
    valueColor: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default' = 'default'
  ): ModuleHeaderStatCard {
    return {
      label,
      value: valueGetter(),
      icon,
      iconColor,
      valueColor
    };
  }

  /**
   * Create multiple stat cards at once
   * @param statCardConfigs - Array of stat card configurations
   * @returns Array of ModuleHeaderStatCard
   */
  createStatCards(
    statCardConfigs: {
      label: string;
      valueGetter: () => string | number;
      icon?: string;
      iconColor?: 'primary' | 'success' | 'warning' | 'error' | 'info';
      valueColor?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';
    }[]
  ): ModuleHeaderStatCard[] {
    return statCardConfigs.map(config => 
      this.createStatCard(
        config.label,
        config.valueGetter,
        config.icon,
        config.iconColor,
        config.valueColor
      )
    );
  }
}

