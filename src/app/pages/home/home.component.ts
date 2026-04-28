import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { SeoService } from '../../services/seo.service';
import { Event, PaginatedEvents } from '../../models/event.model';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  events: Event[] = [];
  isLoading: boolean = true;
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 0;
  totalEvents: number = 0;
  showLoginModal: boolean = false;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.seoService.createDefaultHomeMeta();
    this.seoService.setOrganizationSchema();
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getUpcomingEvents(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: PaginatedEvents) => {
        this.events = response.events;
        this.totalEvents = response.total;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadEvents();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToEventDetail(event: Event): void {
    this.router.navigate(['/event', event.id]);
  }

  onFavoriteToggle(eventId: number): void {
    if (eventId === -1) {
      this.showLoginModal = true;
    }
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
