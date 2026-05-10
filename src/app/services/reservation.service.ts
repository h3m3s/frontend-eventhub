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

  /**
   * Create a new reservation for an event
   * @param eventId - The ID of the event to reserve
   * @returns Observable with the created reservation
   */
  createReservation(eventId: number): Observable<Reservation> {
    const request: CreateReservationRequest = { eventId };
    return this.http.post<Reservation>(`${this.API_URL}`, request);
  }

  /**
   * Get all reservations for the current user
   * @returns Observable with array of user's reservations
   */
  getUserReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.API_URL}/my-reservations`);
  }

  /**
   * Cancel a reservation
   * @param eventId - The ID of the event reservation to cancel
   * @returns Observable with the cancellation response
   */
  cancelReservation(eventId: number): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/cancel/${eventId}`, {});
  }
}
