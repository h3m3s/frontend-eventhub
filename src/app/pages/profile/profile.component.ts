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
        this.successMessage = 'Profil zaktualizowany pomyślnie!';
        this.isEditMode = false;
        this.isSaving = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Nie udało się zaktualizować profilu';
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

  cancelReservation(reservationId: number): void {
    if (confirm('Czy na pewno chcesz anulować rezerwację?')) {
      this.reservationService.cancelReservation(reservationId).subscribe({
        next: () => {
          this.loadUserData();
          alert('Rezerwacja anulowana');
        },
        error: (error) => {
          alert(error.error?.message || 'Nie udało się anulować rezerwacji');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
