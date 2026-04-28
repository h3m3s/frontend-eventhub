export interface Reservation {
  id: number;
  user_id: number;
  event_id: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at?: string;
}

export interface CreateReservationRequest {
  event_id: number;
}
