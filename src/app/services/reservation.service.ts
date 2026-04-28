import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, CreateReservationRequest } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly API_URL = 'http://localhost:3000/reservations';

  constructor(private http: HttpClient) {}

  // Create new reservation
  createReservation(eventId: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.API_URL}`, { event_id: eventId });
  }

  // Get user reservations
  getUserReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.API_URL}/my-reservations`);
  }

  // Get single reservation
  getReservation(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.API_URL}/${id}`);
  }

  // Cancel reservation
  cancelReservation(id: number): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/cancel`, {});
  }

  // Get available spaces for event
  getAvailableSpaces(eventId: number): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/events/${eventId}/available`);
  }
}
