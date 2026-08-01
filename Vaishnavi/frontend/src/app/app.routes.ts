import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FlightSearchComponent } from './pages/flight-search/flight-search.component';
import { FlightDetailComponent } from './pages/flight-detail/flight-detail.component';
import { BookingComponent } from './pages/booking/booking.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AiAssistantComponent } from './pages/ai-assistant/ai-assistant.component';
import { adminGuard, authGuard } from './guards/auth.guard';

// Additional modular flight components
import { SearchWithFiltersComponent } from './flights/components/search-with-filters/search-with-filters.component';
import { MyTripsComponent } from './flights/components/my-trips/my-trips.component';
import { FlightSearchComponent as ModularFlightSearchComponent } from './flights/components/flight-search/flight-search.component';
import { MyBookingsComponent as ModularMyBookingsComponent } from './flights/components/my-bookings/my-bookings.component';

export const routes: Routes = [
  // Primary Original Page Routes
  { path: '', component: HomeComponent },
  { path: 'search', component: FlightSearchComponent },
  { path: 'flight/:id', component: FlightDetailComponent, canActivate: [authGuard] },
  { path: 'booking/:id', component: BookingComponent, canActivate: [authGuard] },
  { path: 'my-bookings', component: MyBookingsComponent },
  { path: 'assistant', component: AiAssistantComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },

  // Additional Feature Routes (Modular components)
  { path: 'flights/search-with-filters', component: SearchWithFiltersComponent },
  { path: 'flights/my-trips', component: MyTripsComponent },
  { path: 'flights/components/search', component: ModularFlightSearchComponent },
  { path: 'flights/components/my-bookings', component: ModularMyBookingsComponent },

  { path: '**', redirectTo: '' }
];
