import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-page',
  templateUrl: './contact.component.html',
  styleUrls: ['./info-pages.component.scss'],
  standalone: false
})
export class ContactPageComponent {
  contactForm: FormGroup;
  isSending: boolean = false;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) return;

    this.isSending = true;
    // TODO: Implement backend contact form submission
    setTimeout(() => {
      alert('Dziękuję za wiadomość! Odezwiemy się wkrótce.');
      this.contactForm.reset();
      this.isSending = false;
    }, 1000);
  }
}
