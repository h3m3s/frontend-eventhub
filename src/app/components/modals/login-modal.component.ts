import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  isLoginMode: boolean = true;
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForms();
  }

  initializeForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirmation: ['', [Validators.required]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.successMessage = 'Zalogowano pomyślnie!';
        this.isLoading = false;
        setTimeout(() => {
          this.closeModal();
        }, 1000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Logowanie nie powiodło się';
        this.isLoading = false;
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password, passwordConfirmation } = this.registerForm.value;
    this.authService.register(name, email, password, passwordConfirmation).subscribe({
      next: () => {
        this.successMessage = 'Rejestracja pomyślna! Zaraz się zalogujemy...';
        this.isLoading = false;
        setTimeout(() => {
          this.closeModal();
        }, 1000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Rejestracja nie powiodła się';
        this.isLoading = false;
      }
    });
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeModal(): void {
    this.isLoginMode = true;
    this.loginForm.reset();
    this.registerForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
