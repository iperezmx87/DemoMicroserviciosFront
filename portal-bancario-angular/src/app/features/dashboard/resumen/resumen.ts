import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AccountService, SaldoResponse } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule],
  template: `
    <div class="resumen-container">
      <h2 class="welcome-text">¡Hola, {{ authService.currentUser()?.Propietario }}!</h2>
      
      <div class="cards-grid">
        <mat-card class="balance-card">
          <mat-card-content>
            <div class="card-header">
              <span class="label">Saldo Disponible</span>
              <mat-icon color="primary">account_balance_wallet</mat-icon>
            </div>
            <div class="balance-amount">
              {{ saldo() | currency:'USD':'symbol':'1.2-2' }}
            </div>
            <mat-divider></mat-divider>
            <div class="card-footer">
              Última actualización: {{ fechaActualizacion() | date:'medium' }}
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="info-card">
          <mat-card-content>
            <div class="card-header">
              <span class="label">Cuenta Asociada</span>
              <mat-icon color="accent">credit_card</mat-icon>
            </div>
            <div class="info-value">
              {{ authService.currentUser()?.IdCuenta }}
            </div>
            <div class="info-sub">Cuenta Corriente Personal</div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .resumen-container {
      max-width: 900px;
    }
    .welcome-text {
      margin-bottom: 24px;
      font-weight: 300;
      font-size: 2rem;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }
    .balance-card {
      background: linear-gradient(135deg, #161b22 0%, #21262d 100%) !important;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .label {
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 1px;
    }
    .balance-amount {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 16px;
      color: #7c4dff;
    }
    .card-footer {
      margin-top: 12px;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
    }
    .info-card {
      background: #161b22 !important;
    }
    .info-value {
      font-family: monospace;
      font-size: 1.1rem;
      margin-bottom: 8px;
    }
    .info-sub {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.6);
    }
  `]
})
export class ResumenComponent implements OnInit {
  accountService = inject(AccountService);
  authService = inject(AuthService);
  
  saldo = signal<number>(0);
  fechaActualizacion = signal<Date>(new Date());

  ngOnInit() {
    const user = this.authService.currentUser();
    console.log('Usuario actual:', user); // Debug
    if (user && user.IdCuenta) {
      this.accountService.getSaldo(user.IdCuenta).subscribe({
        next: (data) => {
          this.saldo.set(data);
          this.fechaActualizacion.set(new Date());
        },
        error: (err) => console.error('Error al obtener saldo', err)
      });
    }
  }
}
