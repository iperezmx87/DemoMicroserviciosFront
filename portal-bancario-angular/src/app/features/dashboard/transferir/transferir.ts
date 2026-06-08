import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AccountService } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';

// Validador de formato GUID
function guidValidator(control: AbstractControl): { [key: string]: any } | null {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (control.value && !guidRegex.test(control.value)) {
    return { 'invalidGuid': true };
  }
  return null;
}

@Component({
  selector: 'app-transferir',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="transfer-container">
      <div class="header-section">
        <h2 class="title">Realizar Transferencia</h2>
        <p class="subtitle">Envía dinero de forma segura e instantánea a otras cuentas</p>
      </div>

      <div class="cards-layout">
        <!-- Tarjeta de Saldo Rápido -->
        <mat-card class="balance-card">
          <mat-card-content>
            <div class="balance-label">Tu Saldo Disponible</div>
            <div class="balance-amount">
              {{ saldo() | currency:'USD':'symbol':'1.2-2' }}
            </div>
            <div class="balance-footer">
              <mat-icon>security</mat-icon>
              <span>Transacciones encriptadas</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Formulario de Transferencia -->
        <mat-card class="form-card">
          <mat-card-content class="form-content">
            <form [formGroup]="transferForm" (ngSubmit)="onSubmit()">
              
              <!-- Fila: Origen (Solo lectura) -->
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width disabled-field">
                  <mat-label>Cuenta de Origen</mat-label>
                  <input matInput formControlName="cuentaOrigenId" readonly>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width disabled-field">
                  <mat-label>Ordenante</mat-label>
                  <input matInput formControlName="propietarioOrigen" readonly>
                </mat-form-field>
              </div>

              <!-- Fila: Destino -->
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>ID de la Cuenta Destino (GUID)</mat-label>
                  <input matInput formControlName="cuentaDestinoId" placeholder="Ej. 12345678-1234-1234-1234-123456789abc" id="input-destino-id">
                  <mat-error *ngIf="transferForm.get('cuentaDestinoId')?.hasError('required')">
                    El ID de la cuenta destino es requerido
                  </mat-error>
                  <mat-error *ngIf="transferForm.get('cuentaDestinoId')?.hasError('invalidGuid')">
                    El formato del ID de la cuenta no es válido (Debe ser un GUID)
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nombre del Beneficiario</mat-label>
                  <input matInput formControlName="propietarioDestino" placeholder="Ej. María López" id="input-beneficiario">
                  <mat-error *ngIf="transferForm.get('propietarioDestino')?.hasError('required')">
                    El nombre del beneficiario es requerido
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Fila: Monto -->
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Monto a Transferir</mat-label>
                  <input matInput type="number" formControlName="monto" placeholder="0.00" id="input-monto">
                  <span matPrefix>$&nbsp;</span>
                  <mat-error *ngIf="transferForm.get('monto')?.hasError('required')">
                    El monto es requerido
                  </mat-error>
                  <mat-error *ngIf="transferForm.get('monto')?.hasError('min')">
                    El monto mínimo a transferir es $0.01
                  </mat-error>
                  <mat-error *ngIf="transferForm.get('monto')?.hasError('exceedsBalance')">
                    Fondos insuficientes en la cuenta
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Mensajes de Respuesta -->
              <div *ngIf="successMessage()" class="message success-message">
                <mat-icon>check_circle</mat-icon>
                <span>{{ successMessage() }}</span>
              </div>

              <div *ngIf="errorMessage()" class="message error-message">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>

              <!-- Botón de Envío -->
              <button mat-flat-button color="primary" class="submit-btn" 
                      [disabled]="transferForm.invalid || loading()">
                <mat-icon>send</mat-icon>
                <span>{{ loading() ? 'Procesando Transferencia...' : 'Confirmar Transferencia' }}</span>
              </button>

            </form>
          </mat-card-content>
          <mat-progress-bar mode="indeterminate" *ngIf="loading()"></mat-progress-bar>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .transfer-container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header-section {
      margin-bottom: 24px;
    }
    .title {
      font-size: 2rem;
      font-weight: 300;
      margin: 0;
      background: linear-gradient(90deg, #7c4dff, #ffb300);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: rgba(255, 255, 255, 0.6);
      margin: 4px 0 0 0;
      font-size: 0.95rem;
    }
    .cards-layout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      align-items: start;
    }
    .balance-card {
      background: linear-gradient(135deg, #161b22 0%, #21262d 100%) !important;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 12px;
    }
    .balance-label {
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .balance-amount {
      font-size: 2.8rem;
      font-weight: 700;
      color: #7c4dff;
      margin-bottom: 24px;
    }
    .balance-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.85rem;
    }
    .balance-footer mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }
    .form-card {
      background: #161b22 !important;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      overflow: hidden;
    }
    .form-content {
      padding: 24px !important;
    }
    .form-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .full-width {
      width: 100%;
    }
    .half-width {
      flex: 1;
      min-width: 200px;
    }
    .disabled-field {
      opacity: 0.7;
    }
    .submit-btn {
      width: 100%;
      padding: 24px !important;
      border-radius: 12px !important;
      font-size: 1rem !important;
      margin-top: 8px;
    }
    .message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.9rem;
    }
    .success-message {
      background: rgba(74, 222, 128, 0.1);
      color: #4ade80;
      border: 1px solid rgba(74, 222, 128, 0.2);
    }
    .error-message {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.2);
    }
  `]
})
export class TransferirComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private authService = inject(AuthService);

  saldo = signal<number>(0);
  loading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  transferForm = this.fb.group({
    cuentaOrigenId: [{ value: '', disabled: true }, Validators.required],
    propietarioOrigen: [{ value: '', disabled: true }, Validators.required],
    cuentaDestinoId: ['', [Validators.required, guidValidator]],
    propietarioDestino: ['', Validators.required],
    monto: ['', [Validators.required, Validators.min(0.01)]]
  });

  ngOnInit() {
    this.cargarDatosOrigen();
  }

  cargarDatosOrigen() {
    const user = this.authService.currentUser();
    if (user && user.IdCuenta) {
      this.transferForm.patchValue({
        cuentaOrigenId: user.IdCuenta,
        propietarioOrigen: user.Propietario || user.unique_name || 'Usuario'
      });

      // Consultar saldo actual
      this.accountService.getSaldo(user.IdCuenta).subscribe({
        next: (currentBalance) => {
          this.saldo.set(currentBalance);
          // Configurar validador personalizado para fondos suficientes
          this.transferForm.get('monto')?.addValidators((control) => {
            if (control.value && control.value > currentBalance) {
              return { 'exceedsBalance': true };
            }
            return null;
          });
        },
        error: (err) => console.error('Error al obtener el saldo', err)
      });
    }
  }

  onSubmit() {
    if (this.transferForm.invalid) return;

    this.loading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    // Armar el payload (los campos deshabilitados los extraemos del formulario usando getRawValue)
    const formValue = this.transferForm.getRawValue();
    const payload = {
      cuentaOrigenId: formValue.cuentaOrigenId || '',
      cuentaDestinoId: formValue.cuentaDestinoId || '',
      monto: Number(formValue.monto) || 0,
      propietarioOrigen: formValue.propietarioOrigen || '',
      propietarioDestino: formValue.propietarioDestino || ''
    };

    this.accountService.transferir(payload).subscribe({
      next: (res) => {
        this.successMessage.set('¡Transferencia realizada con éxito!');
        // Actualizar saldo de forma local
        this.saldo.set(res.saldoActualOrigen);
        // Limpiar formulario para los campos editables
        this.transferForm.patchValue({
          cuentaDestinoId: '',
          propietarioDestino: '',
          monto: ''
        });
        // Restablecer el estado de validación del formulario
        this.transferForm.markAsPristine();
        this.transferForm.markAsUntouched();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error en transferencia', err);
        const errorDetail = err.error?.error || 'No se pudo completar la transferencia. Verifica los datos o tu saldo.';
        this.errorMessage.set(errorDetail);
        this.loading.set(false);
      }
    });
  }
}
