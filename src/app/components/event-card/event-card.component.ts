import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Event } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent implements OnChanges {
  @Input() event!: Event;
  @Output() favoriteToggle = new EventEmitter<number>();
  @Output() cardClick = new EventEmitter<Event>();

  isFavorite = false;
  isAuthenticated = false;

  constructor(
    private eventService: EventService,
    private authService: AuthService
  ) {
    this.authService.isAuthenticated$.subscribe(auth => {
      this.isAuthenticated = auth;
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.event?.id != null) {
      this.isFavorite = this.eventService.isFavorite(this.event.id);
    }
  }

  // ----------------------------
  toggleFavorite(e: MouseEvent): void {
    e.stopPropagation();

    if (!this.isAuthenticated) {
      this.favoriteToggle.emit(-1);
      return;
    }

    if (this.isFavorite) {
      this.eventService.removeFromFavorites(this.event.id);
    } else {
      this.eventService.addToFavorites(this.event.id);
    }

    this.isFavorite = !this.isFavorite;
  }

  onCardClick(): void {
    this.cardClick.emit(this.event);
  }

  get formattedPrice(): string {
    const price = Number(this.event?.price ?? 0);
    return price === 0 ? 'Darmowe' : `${price.toFixed(2)} PLN`;
  }

  get eventDate(): string {
    if (!this.event?.dateStart) return '';

    return new Date(this.event.dateStart).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  get availableSpaces(): number {
    return this.event?.available ?? 0;
  }

  get isSoldOut(): boolean {
    return this.availableSpaces <= 0;
  }

  get occupancyPercent(): number {
    return this.event?.occupancyPercent ?? 0;
  }
}