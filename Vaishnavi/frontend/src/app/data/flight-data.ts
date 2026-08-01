import { Airline, Airport, Flight } from '../models/flight.model';

export const AIRPORTS: Airport[] = [
  { id: 1, code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India' },
  { id: 2, code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
  { id: 3, code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India' },
  { id: 4, code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India' },
  { id: 5, code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India' },
  { id: 6, code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', country: 'India' }
];

export const AIRLINES: Airline[] = [
  { id: 1, code: '6E', name: 'IndiGo' },
  { id: 2, code: 'AI', name: 'Air India' },
  { id: 3, code: 'UK', name: 'Vistara' },
  { id: 4, code: 'SG', name: 'SpiceJet' },
  { id: 5, code: 'QP', name: 'Akasa Air' }
];

export const MOCK_FLIGHT_DATA: Flight[] = [
  {
    id: 1,
    flightNumber: '6E-204',
    airline: AIRLINES[0],
    originAirport: AIRPORTS[0],
    destinationAirport: AIRPORTS[1],
    departureTime: new Date(Date.now() + 86400000).toISOString(),
    arrivalTime: new Date(Date.now() + 86400000 + 7800000).toISOString(),
    basePrice: 4899,
    availableSeats: 45,
    cabinClass: 'ECONOMY',
    status: 'SCHEDULED'
  },
  {
    id: 2,
    flightNumber: 'AI-502',
    airline: AIRLINES[1],
    originAirport: AIRPORTS[0],
    destinationAirport: AIRPORTS[1],
    departureTime: new Date(Date.now() + 94000000).toISOString(),
    arrivalTime: new Date(Date.now() + 94000000 + 8100000).toISOString(),
    basePrice: 5460,
    availableSeats: 18,
    cabinClass: 'ECONOMY',
    status: 'SCHEDULED'
  },
  {
    id: 3,
    flightNumber: 'UK-815',
    airline: AIRLINES[2],
    originAirport: AIRPORTS[0],
    destinationAirport: AIRPORTS[2],
    departureTime: new Date(Date.now() + 100000000).toISOString(),
    arrivalTime: new Date(Date.now() + 100000000 + 9900000).toISOString(),
    basePrice: 6200,
    availableSeats: 12,
    cabinClass: 'BUSINESS',
    status: 'SCHEDULED'
  },
  {
    id: 4,
    flightNumber: 'SG-401',
    airline: AIRLINES[3],
    originAirport: AIRPORTS[1],
    destinationAirport: AIRPORTS[3],
    departureTime: new Date(Date.now() + 110000000).toISOString(),
    arrivalTime: new Date(Date.now() + 110000000 + 7200000).toISOString(),
    basePrice: 4100,
    availableSeats: 30,
    cabinClass: 'ECONOMY',
    status: 'SCHEDULED'
  },
  {
    id: 5,
    flightNumber: 'QP-112',
    airline: AIRLINES[4],
    originAirport: AIRPORTS[2],
    destinationAirport: AIRPORTS[4],
    departureTime: new Date(Date.now() + 120000000).toISOString(),
    arrivalTime: new Date(Date.now() + 120000000 + 5400000).toISOString(),
    basePrice: 3850,
    availableSeats: 52,
    cabinClass: 'ECONOMY',
    status: 'SCHEDULED'
  }
];
