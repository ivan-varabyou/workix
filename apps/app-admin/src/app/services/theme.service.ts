import { computed, effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // State signal
  private darkModeSignal = signal(false);

  // Read-only signals
  readonly darkMode = this.darkModeSignal.asReadonly();

  // Computed colors
  readonly colors = computed(() => {
    const isDark = this.darkModeSignal();
    return {
      primary: isDark ? '#bb86fc' : '#3f51b5',
      accent: isDark ? '#03dac6' : '#ff4081',
      background: isDark ? '#121212' : '#ffffff',
      surface: isDark ? '#1e1e1e' : '#f5f5f5',
      textPrimary: isDark ? '#ffffff' : '#212121',
      textSecondary: isDark ? '#b3b3b3' : '#757575',
      border: isDark ? '#333333' : '#e0e0e0',
    };
  });

  constructor() {
    const saved = localStorage.getItem('adminDarkMode');
    if (saved) {
      this.darkModeSignal.set(JSON.parse(saved));
    }

    // Effect to apply theme on change
    effect(() => {
      this.applyTheme(this.darkModeSignal());
    });
  }

  isDarkMode(): boolean {
    return this.darkModeSignal();
  }

  setDarkMode(isDark: boolean): void {
    this.darkModeSignal.set(isDark);
    localStorage.setItem('adminDarkMode', JSON.stringify(isDark));
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.darkModeSignal());
  }

  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;

    if (isDark) {
      htmlElement.classList.add('dark-theme');
      htmlElement.style.colorScheme = 'dark';
    } else {
      htmlElement.classList.remove('dark-theme');
      htmlElement.style.colorScheme = 'light';
    }

    this.applyThemeVariables(isDark);
  }

  private applyThemeVariables(_isDark: boolean): void {
    const root = document.documentElement;
    const colors = this.colors();

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }
}
