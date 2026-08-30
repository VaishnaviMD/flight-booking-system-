import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Aircraft, FleetStats } from '../models/fleet.model';

let MOCK_FLEET: Aircraft[] = [
  { id: 1, tailNumber: 'VT-IFG', model: 'Airbus A320neo', status: 'Operational', lastInspection: 'Aug 15, 2026', totalHoursFlown: 3120 },
  { id: 2, tailNumber: 'VT-AIC', model: 'Boeing 787-9 Dreamliner', status: 'Operational', lastInspection: 'Aug 20, 2026', totalHoursFlown: 4500 },
  { id: 3, tailNumber: 'VT-SGJ', model: 'Boeing 737 MAX 8', status: 'In Maintenance', lastInspection: 'Aug 28, 2026 (Ongoing)', totalHoursFlown: 6890 },
  { id: 4, tailNumber: 'VT-VIS', model: 'Airbus A321neo', status: 'Operational', lastInspection: 'Jul 22, 2026', totalHoursFlown: 2980 },
  { id: 5, tailNumber: 'VT-AKA', model: 'Boeing 737-8', status: 'Operational', lastInspection: 'Aug 01, 2026', totalHoursFlown: 1800 },
  { id: 6, tailNumber: 'VT-AIX', model: 'Airbus A350-900', status: 'In Maintenance', lastInspection: 'Aug 25, 2026', totalHoursFlown: 5430 }
];

@Injectable({
  providedIn: 'root'
})
export class FleetService {
  getFleet(): Observable<Aircraft[]> {
    return of([...MOCK_FLEET]);
  }

  getFleetStats(): Observable<FleetStats> {
    const total = MOCK_FLEET.length;
    const operational = MOCK_FLEET.filter(a => a.status === 'Operational').length;
    const maintenance = MOCK_FLEET.filter(a => a.status === 'In Maintenance').length;
    return of({
      totalAircraft: total,
      operationalCount: operational,
      maintenanceCount: maintenance,
      fleetReadiness: Math.round((operational / total) * 1000) / 10
    });
  }

  addAircraft(aircraft: Partial<Aircraft>): Observable<Aircraft> {
    const newPlane: Aircraft = {
      id: MOCK_FLEET.length + 1,
      tailNumber: aircraft.tailNumber || 'VT-NEW',
      model: aircraft.model || 'Airbus A320neo',
      status: aircraft.status || 'Operational',
      lastInspection: 'Just now (' + new Date().toLocaleDateString() + ')',
      totalHoursFlown: 0
    };
    MOCK_FLEET.unshift(newPlane);
    return of(newPlane);
  }

  toggleStatus(id: number): Observable<Aircraft | null> {
    const plane = MOCK_FLEET.find(p => p.id === id);
    if (plane) {
      plane.status = plane.status === 'Operational' ? 'In Maintenance' : 'Operational';
      plane.lastInspection = 'Updated on ' + new Date().toLocaleDateString();
      return of(plane);
    }
    return of(null);
  }
}
