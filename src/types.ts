export type Status = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';

export interface BookingRecord {
  id: string;
  occupant: string;
  reference: string;
  checkIn: string;
  checkOut: string;
}

export interface AccommodationSet {
  id: string;
  name: string;
  description: string;
  status: Status;
  floor: string;
  view: string;
  capacity: number;
  bookings: BookingRecord[];
}

export interface ForestRestHouse {
  id: string;
  name: string;
  location: string;
  description: string;
  heroImage: string;
  altitude?: string;
  elevation?: string;
  accommodationSets: AccommodationSet[];
  tags?: string[];
}
