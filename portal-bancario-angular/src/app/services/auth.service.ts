import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  usuario: string;
  secreto: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrls.auth;
  
  // Signal para el estado de autenticación
  currentUser = signal<any>(null);

  constructor() {
    const token = localStorage.getItem('bank_token');
    if (token) {
      this.currentUser.set(this.decodeToken(token));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/CuentaUsuario/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.token) {
          localStorage.setItem('bank_token', response.token);
          this.currentUser.set(this.decodeToken(response.token));
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('bank_token');
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('bank_token');
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}
