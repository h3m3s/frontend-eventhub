import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Event, EventsListResponse, PaginatedEvents } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = 'http://localhost:3000/events';
  private favoriteEventsSubject = new BehaviorSubject<number[]>([]);
  favoriteEvents$ = this.favoriteEventsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFavorites();
  }

  // Get all events with optional pagination and filters
  getEvents(page: number = 1, perPage: number = 12, search?: string): Observable<PaginatedEvents> {
    return this.http.get<Event[]>(`${this.API_URL}`).pipe(
      map(response => {
        // Backend returns array directly, not wrapped response
        const events = Array.isArray(response) ? response : [];
        return {
          events: events.slice((page - 1) * perPage, page * perPage),
          total: events.length,
          page: page,
          perPage: perPage,
          totalPages: Math.ceil(events.length / perPage)
        };
      })
    );
  }

  // Get top 5 popular events (by registrations)
  getPopularEvents(): Observable<Event[]> {
    return this.getEvents(1, 5).pipe(
      map(response => response.events)
    );
  }

  // Get upcoming events
  getUpcomingEvents(page: number = 1, perPage: number = 12): Observable<PaginatedEvents> {
    return this.getEvents(page, perPage);
    // Note: Backend doesn't filter by date, so we get all events
    // Frontend can filter locally if needed
  }

  // Get single event by ID
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.API_URL}/id/${id}`);
  }

  // Search events
  searchEvents(query: string): Observable<Event[]> {
    let params = new HttpParams().set('q', query);
    return this.http.get<Event[]>(`${this.API_URL}/search`, { params });
  }

  // Get event by category
  getEventsByCategory(category: string, page: number = 1): Observable<PaginatedEvents> {
    let params = new HttpParams()
      .set('category', category)
      .set('page', page.toString());

    return this.http.get<EventsListResponse>(`${this.API_URL}`, { params }).pipe(
      map(response => ({
        events: response.data,
        total: response.total,
        page: response.page,
        perPage: response.per_page,
        totalPages: response.total_pages
      }))
    );
  }

  // Favorites management
  addToFavorites(eventId: number): void {
    const favorites = this.favoriteEventsSubject.value;
    if (!favorites.includes(eventId)) {
      this.favoriteEventsSubject.next([...favorites, eventId]);
      localStorage.setItem('favorites', JSON.stringify(this.favoriteEventsSubject.value));
    }
  }

  removeFromFavorites(eventId: number): void {
    const favorites = this.favoriteEventsSubject.value.filter(id => id !== eventId);
    this.favoriteEventsSubject.next(favorites);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  isFavorite(eventId: number): boolean {
    return this.favoriteEventsSubject.value.includes(eventId);
  }

  private loadFavorites(): void {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      try {
        this.favoriteEventsSubject.next(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading favorites', e);
      }
    }
  }
}
