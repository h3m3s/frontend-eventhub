import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

import {
  Event,
  EventsListResponse,
  PaginatedEvents
} from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private readonly API_URL = 'http://localhost:3000/events';

  /**
   * We store only favorite event IDs
   * to easily check isFavorite()
   */
  private favoriteEventsSubject = new BehaviorSubject<number[]>([]);

  favoriteEvents$ = this.favoriteEventsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFavorites();
  }

  /**
   * GET ALL EVENTS
   */
  getEvents(
    page: number = 1,
    perPage: number = 12,
    search?: string
  ): Observable<PaginatedEvents> {

    return this.http.get<Event[]>(`${this.API_URL}`).pipe(
      map((events: Event[]) => {

        let filteredEvents = events;

        // local search filtering
        if (search?.trim()) {
          const query = search.toLowerCase();

          filteredEvents = events.filter(event =>
            event.name.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query) ||
            event.category.toLowerCase().includes(query)
          );
        }

        const startIndex = (page - 1) * perPage;
        const endIndex = page * perPage;

        return {
          events: filteredEvents.slice(startIndex, endIndex),
          total: filteredEvents.length,
          page,
          perPage,
          totalPages: Math.ceil(filteredEvents.length / perPage)
        };
      }),
      catchError(error => {
        console.error('Error loading events:', error);

        return of({
          events: [],
          total: 0,
          page: 1,
          perPage: 12,
          totalPages: 0
        });
      })
    );
  }

  /**
   * POPULAR EVENTS
   */
  getPopularEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.API_URL}/popular`).pipe(
      tap(events => console.log('Fetched popular events:', events)),
      catchError(error => {
        console.error('Error fetching top 5:', error);
        return throwError(() => error);
      })
    );
  }
  getUpcomingEvents(
    page: number = 1,
    perPage: number = 12
  ): Observable<PaginatedEvents> {

    return this.getEvents(page, perPage).pipe(
      map(response => {

        const now = new Date();

        const upcoming = response.events.filter(event =>
          new Date(event.dateStart) > now
        );

        return {
          ...response,
          events: upcoming
        };
      })
    );
  }

  /**
   * SINGLE EVENT
   */
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.API_URL}/id/${id}`);
  }

  /**
   * SEARCH EVENTS
   */
  searchEvents(query: string): Observable<Event[]> {

    if (!query.trim()) {
      return of([]);
    }

    const params = new HttpParams().set('q', query);

    return this.http.get<Event[]>(
      `${this.API_URL}/search`,
      { params }
    ).pipe(
      catchError(error => {
        console.error('Search error:', error);
        return of([]);
      })
    );
  }

  /**
   * EVENTS BY CATEGORY
   */
  getEventsByCategory(
    category: string,
    page: number = 1,
    perPage: number = 12
  ): Observable<PaginatedEvents> {

    return this.http.get<Event[]>(`${this.API_URL}`).pipe(
      map((events: Event[]) => {

        const filtered = events.filter(
          event => event.category === category
        );

        const startIndex = (page - 1) * perPage;
        const endIndex = page * perPage;

        return {
          events: filtered.slice(startIndex, endIndex),
          total: filtered.length,
          page,
          perPage,
          totalPages: Math.ceil(filtered.length / perPage)
        };
      }),
      catchError(error => {
        console.error('Category filter error:', error);

        return of({
          events: [],
          total: 0,
          page: 1,
          perPage,
          totalPages: 0
        });
      })
    );
  }

  /**
   * ADD TO FAVORITES
   */
  addToFavorites(eventId: number): Observable<any> {

    return this.http.post(
      `${this.API_URL}/${eventId}/favorites`,
      {}
    ).pipe(
      tap(() => {

        const favorites = this.favoriteEventsSubject.value;

        if (!favorites.includes(eventId)) {

          const updated = [...favorites, eventId];

          this.favoriteEventsSubject.next(updated);

          localStorage.setItem(
            'favorites',
            JSON.stringify(updated)
          );
        }
      }),
      catchError(error => {
        console.error('Error adding to favorites:', error);
        return of(null);
      })
    );
  }

  /**
   * REMOVE FROM FAVORITES
   */
  removeFromFavorites(eventId: number): Observable<any> {

    return this.http.delete(
      `${this.API_URL}/${eventId}/favorites`
    ).pipe(
      tap(() => {

        const updated = this.favoriteEventsSubject.value
          .filter(id => id !== eventId);

        this.favoriteEventsSubject.next(updated);

        localStorage.setItem(
          'favorites',
          JSON.stringify(updated)
        );
      }),
      catchError(error => {
        console.error('Error removing from favorites:', error);
        return of(null);
      })
    );
  }

  /**
   * CREATE NEW EVENT
   * Sends a new event to backend
   * Description will be preserved in full with formatting
   * Backend expects camelCase with dates without Z (local time)
   * Converts line breaks to escape sequence \n
   */
  createEvent(eventData: any): Observable<Event> {
    const dateStart = this.formatDateToISO(eventData.dateStart);
    const dateEnd = this.formatDateToISO(eventData.dateEnd);
    
    const payload = {
      name: eventData.name,
      description: eventData.description.replace(/\n/g, '\\n'),
      dateStart: dateStart,
      dateEnd: dateEnd,
      location: eventData.location,
      adress: eventData.adress,
      limit: parseInt(eventData.limit),
      price: parseFloat(eventData.price).toFixed(2),
      category: eventData.category,
      photoPath: eventData.photoPath || null
    };

    console.log('Sending event to backend:', payload);

    return this.http.post<Event>(
      `${this.API_URL}`,
      payload
    ).pipe(
      tap(event => {
        console.log('Event created:', event);
      }),
      catchError(error => {
        console.error('Error creating event:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Formats date from datetime-local to ISO 8601 without Z
   * datetime-local returns: "2026-05-20T18:00"
   * Send without Z so backend treats it as local time
   */
  private formatDateToISO(dateString: string): string {
    if (!dateString) return '';
    
    // Simple solution - construct ISO string without Z (local time)
    // datetime-local: "2026-05-20T18:00" → ISO: "2026-05-20T18:00:00"
    return dateString + ':00';
  }

  /**
   * GET USER FAVORITES
   * Backend returns full Event[]
   */
  getUserFavorites(): Observable<Event[]> {

    return this.http.get<Event[]>(
      `${this.API_URL}/favorites/my`
    ).pipe(

      tap((favorites: Event[]) => {

        const favoriteIds = favorites.map(f => f.id);

        this.favoriteEventsSubject.next(favoriteIds);

        localStorage.setItem(
          'favorites',
          JSON.stringify(favoriteIds)
        );
      }),

      catchError(error => {

        console.error('Error loading favorites:', error);

        this.favoriteEventsSubject.next([]);

        return of([]);
      })
    );
  }

  /**
   * CHECK FAVORITE
   */
  isFavorite(eventId: number): boolean {
    return this.favoriteEventsSubject.value.includes(eventId);
  }

  /**
   * INITIAL FAVORITES LOAD
   */
  private loadFavorites(): void {

    // szybki load z localStorage
    const stored = localStorage.getItem('favorites');

    if (stored) {
      try {

        const favoriteIds: number[] = JSON.parse(stored);

        this.favoriteEventsSubject.next(favoriteIds);

      } catch (error) {

        console.error(
          'Error parsing favorites from localStorage',
          error
        );
      }
    }

    // sync z backendem
    this.getUserFavorites().subscribe();
  }
}