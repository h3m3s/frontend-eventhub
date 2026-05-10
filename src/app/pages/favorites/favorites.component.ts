import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Event } from '../../models/event.model';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favoriteEvents: Event[] = [];
  isLoading: boolean = true;
  isEmpty: boolean = false;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.router.navigate(['/']);
      }
    });

    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading = true;

    this.eventService.getUserFavorites().subscribe({
      next: (favorites: Event[]) => {
        // Reload full event data for each favorite to get correct available spaces
        if (favorites.length > 0) {
          const eventRequests = favorites.map(event =>
            this.eventService.getEventById(event.id).pipe(
              map(fullEvent => ({
                ...fullEvent,
                available: fullEvent.available ?? fullEvent.limit - (fullEvent.registered ?? 0)
              }))
            )
          );

          forkJoin(eventRequests).subscribe({
            next: (eventsWithData: Event[]) => {
              this.favoriteEvents = eventsWithData;
              this.isEmpty = false;
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error loading event details:', err);
              // Fallback to original favorites
              this.favoriteEvents = favorites;
              this.isEmpty = favorites.length === 0;
              this.isLoading = false;
            }
          });
        } else {
          this.favoriteEvents = favorites;
          this.isEmpty = true;
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.isLoading = false;
      }
    });
  }

  removeFromFavorites(eventId: number): void {
    this.eventService.removeFromFavorites(eventId).subscribe({
      next: () => {
        this.favoriteEvents = this.favoriteEvents.filter(e => e.id !== eventId);
        if (this.favoriteEvents.length === 0) {
          this.isEmpty = true;
        }
      },
      error: (error) => {
        console.error('Error removing from favorites:', error);
      }
    });
  }

  goToEvent(eventId: number): void {
    this.router.navigate(['/event', eventId]);
  }
}
