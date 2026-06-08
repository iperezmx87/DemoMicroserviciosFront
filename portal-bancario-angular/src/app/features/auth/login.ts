import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Portal Bancario</mat-card-title>
          <mat-card-subtitle>Ingresa tus credenciales</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <input matInput formControlName="usuario" placeholder="Ej. jperez">
              <mat-error *ngIf="loginForm.get('usuario')?.hasError('required')">
                El usuario es requerido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput formControlName="secreto" type="password">
              <mat-error *ngIf="loginForm.get('secreto')?.hasError('required')">
                La contraseña es requerida
              </mat-error>
            </mat-form-field>

            <div *ngIf="errorMessage()" class="error-message">
              {{ errorMessage() }}
            </div>

            <button mat-flat-button color="primary" class="full-width" 
                    [disabled]="loginForm.invalid || loading()">
              {{ loading() ? 'Iniciando sesión...' : 'Entrar' }}
            </button>
          </form>
        </mat-card-content>
        
        <mat-progress-bar *ngIf="loading()" mode="indeterminate"></mat-progress-bar>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #1a237e 0%, #000000 100%);
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .error-message {
      color: #ff5252;
      margin-bottom: 16px;
      text-align: center;
      font-size: 0.9rem;
    }
    :host ::ng-deep .mat-mdc-form-field-label {
      color: rgba(255, 255, 255, 0.7) !important;
    }
    :host ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    usuario: ['', [Validators.required]],
    secreto: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set(null);
      
      this.authService.login(this.loginForm.value as any).subscribe({
        next: (res) => {
          if (res.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage.set(res.mensaje || 'Error al iniciar sesión');
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Error de conexión con el servidor');
          this.loading.set(false);
        }
      });
    }
  }
}
