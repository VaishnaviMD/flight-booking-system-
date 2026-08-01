import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Aircraft, FleetStats } from '../models/fleet.model';

const MOCK_FLEET: Aircraft[] = [
  { id: 1, tailNumber: 'N789SF', model: 'Boeing 787-9', status: 'Operational', lastInspection: 'Oct 12, 2023', totalHoursFlown: 4120 },
  { id: 2, tailNumber: 'N350SF', model: 'Airbus A350-1000', status: 'Operational', lastInspection: 'Nov 05, 2023', totalHoursFlown: 3200 },
  { id: 3, tailNumber: 'N320SF', model: 'Airbus A320neo', status: 'In Maintenance', lastInspection: 'Jan 18, 2024 (Ongoing)', totalHoursFlown: 6890 },
  { id: 4, tailNumber: 'N737SF', model: 'Boeing 737 MAX 8', status: 'Operational', lastInspection: 'Dec 22, 2023', totalHoursFlown: 2980 },
  { id: 5, tailNumber: 'N380SF', model: 'Airbus A380-800', status: 'Operational', lastInspection: 'Feb 01, 2024', totalHoursFlown: 8100 },
  { id: 6, tailNumber: 'N777SF', model: 'Boeing 777-300ER', status: 'In Maintenance', lastInspection: 'Mar 10, 2024', totalHoursFlown: 5430 }
];

@Injectable({
  providedIn: 'root'
})
export class FleetService {
  getFleet(): Observable<Aircraft[]> {
    return of(MOCK_FLEET);
  }

  getFleetStats(): Observable<FleetStats> {
    const total = MOCK_FLEET.length;
    const operational = MOCK_FLEET.filter(a => a.status === 'Operational').length;
    const maintenance = MOCK_FLEET.filter(a => a.status === 'In Maintenance').length;
    return of({
      totalAircraft: 42,
      operationalCount: 38,
      maintenanceCount: 4,
      fleetReadiness: Math.round((operational / total) * 1000) / 10
    });
  }
}
