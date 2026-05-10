import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { Reservation } from '../../models/reservation.model';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm!: FormGroup;
  reservations: Reservation[] = [];
  isLoading: boolean = true;
  isSaving: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  isEditMode: boolean = false;

  constructor(
    private authService: AuthService,
    private reservationService: ReservationService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/']);
      } else {
        this.currentUser = user;
        this.initializeForm();
      }
    });

    this.loadUserData();
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      name: [this.currentUser?.name || '', [Validators.required, Validators.minLength(3)]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]]
    });
  }

  loadUserData(): void {
    this.reservationService.getUserReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { name, email } = this.profileForm.value;
    this.authService.updateProfile(name, email).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.successMessage = 'Profile updated successfully!';
        this.isEditMode = false;
        this.isSaving = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update profile';
        this.isSaving = false;
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.successMessage = '';
    this.errorMessage = '';
    if (!this.isEditMode) {
      this.initializeForm();
    }
  }

  cancelReservation(reservation: Reservation): void {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.reservationService.cancelReservation(reservation.event.id).subscribe({
        next: () => {
          this.reservations = this.reservations.filter(r => r.id !== reservation.id);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to cancel reservation';
        }
      });
    }
  }

  getEventDate(dateStart: string): string {
    return new Date(dateStart).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getEventTime(dateStart: string): string {
    return new Date(dateStart).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToEvent(eventId: number): void {
    this.router.navigate(['/event', eventId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
