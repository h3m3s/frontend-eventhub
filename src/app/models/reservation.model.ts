import { Event } from './event.model';

export interface Reservation {
  id: number;
  event: Event;
  registeredAt: string;
  status: 'REGISTERED' | 'CANCELLED' | 'PENDING';
  user_id?: number;
  event_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReservationRequest {
  eventId: number;
}
