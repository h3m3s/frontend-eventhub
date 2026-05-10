import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-event-add',
  templateUrl: './event-add.component.html',
  styleUrls: ['./event-add.component.scss']
})
export class EventAddComponent implements OnInit {
  
  eventForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  categories = ['Muzyka', 'Sport', 'Edukacja', 'Rozrywka', 'Biznes', 'Kultura', 'Technologia', 'Inne'];

  constructor(
    private formBuilder: FormBuilder,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {
    this.eventForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dateStart: ['', Validators.required],
      dateEnd: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      adress: ['', [Validators.required, Validators.minLength(5)]],
      limit: ['', [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      photoPath: ['']
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare data - description preserves formatting
    const formValue = this.eventForm.value;
    const eventData = {
      ...formValue,
      price: parseFloat(formValue.price),
      limit: parseInt(formValue.limit)
    };

    this.eventService.createEvent(eventData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Event has been successfully added!';
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error adding event:', error);
        this.errorMessage = error?.error?.message || 'Error adding event. Please try again.';
      }
    });
  }

  get name() {
    return this.eventForm.get('name');
  }

  get description() {
    return this.eventForm.get('description');
  }

  get dateStart() {
    return this.eventForm.get('dateStart');
  }

  get dateEnd() {
    return this.eventForm.get('dateEnd');
  }

  get location() {
    return this.eventForm.get('location');
  }

  get adress() {
    return this.eventForm.get('adress');
  }

  get limit() {
    return this.eventForm.get('limit');
  }

  get price() {
    return this.eventForm.get('price');
  }

  get category() {
    return this.eventForm.get('category');
  }

  get photoPath() {
    return this.eventForm.get('photoPath');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  cancelForm(): void {
    this.router.navigate(['/']);
  }
}
