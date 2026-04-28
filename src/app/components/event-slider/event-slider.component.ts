import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  standalone: false,
  selector: 'app-event-slider',
  templateUrl: './event-slider.component.html',
  styleUrls: ['./event-slider.component.scss']
})
export class EventSliderComponent implements OnInit {
  popularEvents: Event[] = [];
  isLoading: boolean = true;
  currentSlide: number = 0;
  slidesToShow: number = 1;

  constructor(
    private eventService: EventService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.updateSlidesToShow();
    window.addEventListener('resize', () => this.updateSlidesToShow());
    this.loadPopularEvents();
  }

  loadPopularEvents(): void {
    this.eventService.getPopularEvents().subscribe({
      next: (events) => {
        this.popularEvents = events.slice(0, 5);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  updateSlidesToShow(): void {
    const width = window.innerWidth;
    if (width < 576) {
      this.slidesToShow = 1;
    } else if (width < 992) {
      this.slidesToShow = 2;
    } else if (width < 1400) {
      this.slidesToShow = 3;
    } else {
      this.slidesToShow = 4;
    }
    // Set CSS variable for grid calculation
    this.elementRef.nativeElement.style.setProperty('--slides-to-show', this.slidesToShow.toString());
  }

  nextSlide(): void {
    if (this.currentSlide < this.popularEvents.length - this.slidesToShow) {
      this.currentSlide++;
    }
  }

  prevSlide(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  goToEvent(event: Event): void {
    this.router.navigate(['/event', event.id]);
  }

  getTransform(): string {
    const cardWidth = 100 / this.slidesToShow;
    return `translateX(-${this.currentSlide * cardWidth}%)`;
  }
}
