import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<ThemeMode>('dark');

  constructor() {
    const saved = localStorage.getItem('skyflow_theme') as ThemeMode;
    if (saved === 'light' || saved === 'dark') {
      this.setTheme(saved);
    } else {
      this.setTheme('dark');
    }
  }

  toggleTheme() {
    const next = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(theme: ThemeMode) {
    this.currentTheme.set(theme);
    localStorage.setItem('skyflow_theme', theme);

    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
