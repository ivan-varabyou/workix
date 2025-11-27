import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeSignal = signal(false);

  constructor() {
    const saved = localStorage.getItem('clientAppDarkMode');
    if (saved) {
      this.darkModeSignal.set(JSON.parse(saved));
    }
    this.applyTheme();
  }

  isDarkMode(): boolean {
    return this.darkModeSignal();
  }

  getDarkModeSignal() {
    return this.darkModeSignal;
  }

  setDarkMode(isDark: boolean): void {
    this.darkModeSignal.set(isDark);
    localStorage.setItem('clientAppDarkMode', JSON.stringify(isDark));
    this.applyTheme();
  }

  private applyTheme(): void {
    const htmlElement = document.documentElement;
    const isDark = this.darkModeSignal();

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
    // TODO: Apply CSS custom properties for theme
    void _isDark;
  }
}
