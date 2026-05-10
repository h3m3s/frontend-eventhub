import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { SeoService } from '../../services/seo.service';
import { Event } from '../../models/event.model';

@Component({
  standalone: false,
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {

  event: Event | null = null;
  isLoading: boolean = true;
  isFavorite: boolean = false;
  isAuthenticated: boolean = false;
  showLoginModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(auth => {
      this.isAuthenticated = auth;
    });

    this.route.params.subscribe(params => {
      const eventId = Number(params['id']);
      if (eventId) {
        this.loadEvent(eventId);
      }
    });
  }

  // ----------------------------
  // NAVIGATION
  // ----------------------------
  navigateToEvent(): void {
    if (!this.event) return;

    const query = encodeURIComponent(
      `${this.event.location} ${this.event.adress}`
    );

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      '_blank'
    );
  }

  // ----------------------------
  // LOAD EVENT
  // ----------------------------
  loadEvent(id: number): void {
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.isFavorite = this.eventService.isFavorite(event.id);
        this.isLoading = false;

        // SEO
        this.seoService.setPageTitle(event.name);
        this.seoService.setPageDescription(event.description.substring(0, 160));
        this.seoService.setPageKeywords(
          `${event.name}, ${event.location}, ${event.category}`
        );
        this.seoService.setOgTags(
          event.name,
          event.description,
          `http://localhost:3000/${event.photoPath}`
        );
        this.seoService.setEventStructuredData(event);
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      }
    });
  }

  // ----------------------------
  // FAVORITES
  // ----------------------------
  toggleFavorite(): void {
    if (!this.isAuthenticated) {
      this.showLoginModal = true;
      return;
    }

    if (!this.event) return;

    if (this.isFavorite) {
      this.eventService.removeFromFavorites(this.event.id).subscribe({
        next: () => {
          this.isFavorite = false;
        },
        error: (error) => {
          console.error('Error removing from favorites:', error);
        }
      });
    } else {
      this.eventService.addToFavorites(this.event.id).subscribe({
        next: () => {
          this.isFavorite = true;
        },
        error: (error) => {
          console.error('Error adding to favorites:', error);
        }
      });
    }
  }

  // ----------------------------
  // RESERVATION
  // ----------------------------
  onReserve(): void {
    if (!this.isAuthenticated) {
      this.showLoginModal = true;
      return;
    }

    if (!this.event || this.availableSpaces <= 0) return;

    this.reservationService.createReservation(this.event.id).subscribe({
      next: () => {
        this.loadEvent(this.event!.id);
        alert('Reservation added successfully!');
      },
      error: (error) => {
        console.error('Reservation error:', error);
        alert(error?.error?.message || 'Failed to create reservation');
      }
    });
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
  get isSoldOut(): boolean {
  return (this.event?.available ?? 0) <= 0;
}

  // ----------------------------
  // PRICE
  // ----------------------------
  get formattedPrice(): string {
    if (!this.event) return '';

    const price = Number(this.event.price);
    return price === 0 ? 'Free' : `${price.toFixed(2)} PLN`;
  }

  // ----------------------------
  // DATE
  // ----------------------------
  get eventDate(): string {
    if (!this.event) return '';

    const date = new Date(this.event.dateStart);

    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ----------------------------
  // AVAILABLE SPACES (FROM RESERVATIONS)
  // ----------------------------
  get availableSpaces(): number {
    return this.event?.available ?? 0;
  }

  get availabilityPercent(): number {
    return this.event?.occupancyPercent ?? 0;
  }

  // ----------------------------
  // FORMATTED DESCRIPTION
  // ----------------------------
  get formattedDescription(): string {
    if (!this.event?.description) return '';
    // Converts \n (escape sequence) to actual line breaks
    return this.event.description.replace(/\\n/g, '\n');
  }
}