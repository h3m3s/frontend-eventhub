import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild('loginModal') loginModal!: TemplateRef<any>;

  searchQuery: string = '';
  searchResults: Event[] = [];
  isSearching: boolean = false;
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  showLoginModal: boolean = false;
  isLoginMode: boolean = true;
  showUserMenu: boolean = false;
  showMobileUserMenu: boolean = false;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {}

  onSearch(query: string): void {
    this.searchQuery = query;
    if (query.length > 2) {
      this.isSearching = true;
      this.eventService.searchEvents(query).subscribe({
        next: (results) => {
          this.searchResults = results;
          this.isSearching = false;
        },
        error: () => {
          this.isSearching = false;
          this.searchResults = [];
        }
      });
    } else {
      this.searchResults = [];
    }
  }

  selectEvent(event: Event): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.router.navigate(['/event', event.id]);
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  openLoginModal(): void {
    this.showLoginModal = true;
    this.isLoginMode = true;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToFavorites(): void {
    this.router.navigate(['/favorites']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  goToAddEvent(): void {
    this.router.navigate(['/event/add']);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  toggleMobileUserMenu(): void {
    this.showMobileUserMenu = !this.showMobileUserMenu;
  }

  closeMobileUserMenu(): void {
    this.showMobileUserMenu = false;
  }
}
