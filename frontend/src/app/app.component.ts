import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { GlobalSpinnerComponent } from './components/global-spinner/global-spinner.component';
import { ErrorDialogContainerComponent } from './components/error-dialog-container/error-dialog-container.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    ToastContainerComponent,
    GlobalSpinnerComponent,
    ErrorDialogContainerComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-toast-container></app-toast-container>
    <app-error-dialog-container></app-error-dialog-container>
    <app-global-spinner></app-global-spinner>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
    }
  `]
})
export class AppComponent {
  title = 'SkyFlow Flight Booking System';

  // Ensure the persisted theme is applied at startup (dark is the default).
  private themeService = inject(ThemeService);
}
