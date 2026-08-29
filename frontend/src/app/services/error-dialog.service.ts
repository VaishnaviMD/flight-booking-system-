import { Injectable, signal } from '@angular/core';

export interface ErrorDialogData {
  title: string;
  message: string;
}

/** App-wide error dialog state — rendered once by ErrorDialogContainerComponent. */
@Injectable({ providedIn: 'root' })
export class ErrorDialogService {
  readonly current = signal<ErrorDialogData | null>(null);

  show(title: string, message: string): void {
    this.current.set({ title, message });
  }

  close(): void {
    this.current.set(null);
  }
}
