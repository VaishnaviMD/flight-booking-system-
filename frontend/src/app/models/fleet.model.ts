export interface Aircraft {
  id: number;
  tailNumber: string;
  model: string;
  status: 'Operational' | 'In Maintenance' | 'Scheduled';
  lastInspection: string;
  totalHoursFlown: number;
}

export interface FleetStats {
  totalAircraft: number;
  operationalCount: number;
  maintenanceCount: number;
  fleetReadiness: number;
}
