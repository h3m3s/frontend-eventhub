import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
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
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      }),
      map(response => response.user)
    );
  }

  register(name: string, email: string, password: string, passwordConfirmation: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
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
    return this.http.get<User>(`${this.API_URL}/profile`);
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
