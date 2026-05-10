import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<any>(`${this.API_URL}/login`, { email, password }).pipe(
      tap(response => {
        // Backend returns token instead of access_token
        const token = response.token || response.access_token;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      }),
      map(response => response.user)
    );
  }

  register(name: string, email: string, password: string, passwordConfirmation: string): Observable<User> {
    // Backend does not expect password_confirmation in request body
    // Check if passwords match on frontend
    if (password !== passwordConfirmation) {
      return throwError(() => new Error('Passwords do not match'));
    }

    const body = {
      name,
      email,
      password
    };

    console.log('Register request body:', body);

    return this.http.post<any>(`${this.API_URL}/register`, body).pipe(
      tap(response => {
        // Backend returns token instead of access_token
        const token = response.token || response.access_token;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      }),
      map(response => response.user)
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (e) {
        console.error('Error loading stored user', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }

  // Get user profile
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/profile`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  // Update user profile
  updateProfile(name: string, email: string): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/profile`, { name, email }).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }
}
