import { Component, OnInit, inject, signal, viewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AccountService, CuentaMovimientoDto } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule
  ],
  template: `
    <div class="movimientos-container">
      <div class="header-section">
        <div>
          <h2 class="title">Historial de Movimientos</h2>
          <p class="subtitle">Consulta todas las transacciones realizadas en tu cuenta bancaria</p>
        </div>
        <button mat-flat-button color="accent" (click)="downloadPdf()" [disabled]="downloading() || loading()" id="btn-descargar-pdf">
          <mat-icon>{{ downloading() ? 'hourglass_empty' : 'picture_as_pdf' }}</mat-icon>
          {{ downloading() ? 'Generando PDF...' : 'Descargar Estado de Cuenta' }}
        </button>
      </div>

      <!-- Barra de Filtros -->
      <mat-card class="filter-card">
        <mat-card-content class="filter-layout">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Buscar por propietario o detalle</mat-label>
            <input matInput [(ngModel)]="searchQuery" (input)="applyFilter()" placeholder="Ej. Juan Pérez" id="input-buscar">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Tipo de Movimiento</mat-label>
            <mat-select [(ngModel)]="selectedType" (selectionChange)="applyFilter()" id="select-tipo">
              <mat-option value="todos">Todos</mat-option>
              <mat-option value="deposito">Depósitos</mat-option>
              <mat-option value="retiro">Retiros</mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <!-- Tabla de Movimientos -->
      <mat-card class="table-card">
        <mat-progress-bar mode="indeterminate" *ngIf="loading()"></mat-progress-bar>
        
        <mat-card-content class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="premium-table">
            
            <!-- Fecha Column -->
            <ng-container matColumnDef="fechaEvento">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Fecha y Hora </th>
              <td mat-cell *matCellDef="let element" class="font-mono"> 
                {{ element.fechaEvento | date:'medium' }} 
              </td>
            </ng-container>

            <!-- Propietario Column -->
            <ng-container matColumnDef="propietario">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Propietario </th>
              <td mat-cell *matCellDef="let element" class="owner-cell"> 
                {{ element.propietario }} 
              </td>
            </ng-container>

            <!-- Tipo Column -->
            <ng-container matColumnDef="tipoMovimiento">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Tipo </th>
              <td mat-cell *matCellDef="let element">
                <span class="badge" [ngClass]="element.tipoMovimiento.toLowerCase().includes('retiro') ? 'badge-retiro' : 'badge-deposito'">
                  {{ element.tipoMovimiento }}
                </span>
              </td>
            </ng-container>

            <!-- Monto Column -->
            <ng-container matColumnDef="monto">
              <th mat-header-cell *matHeaderCellDef mat-sort-header class="align-right"> Monto </th>
              <td mat-cell *matCellDef="let element" class="align-right amount-cell" [ngClass]="element.tipoMovimiento.toLowerCase().includes('retiro') ? 'amount-negative' : 'amount-positive'">
                {{ element.tipoMovimiento.toLowerCase().includes('retiro') ? '-' : '+' }} {{ element.monto | currency:'USD':'symbol':'1.2-2' }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="premium-row"></tr>

            <!-- No Data Row -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-cell" colspan="4">
                <mat-icon class="empty-icon">info_outline</mat-icon>
                <p>No se encontraron movimientos registrados para esta cuenta.</p>
              </td>
            </tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons aria-label="Seleccionar página de movimientos"></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .movimientos-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
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
    .filter-card {
      background: #161b22 !important;
      border: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 24px;
      border-radius: 12px;
    }
    .filter-layout {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      padding: 16px !important;
    }
    .filter-field {
      flex: 1;
      min-width: 250px;
    }
    .table-card {
      background: #161b22 !important;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      overflow: hidden;
    }
    .table-container {
      padding: 0 !important;
    }
    .premium-table {
      width: 100%;
      background: transparent !important;
    }
    .mat-mdc-header-cell {
      color: rgba(255, 255, 255, 0.7) !important;
      font-weight: 600 !important;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      padding: 16px !important;
    }
    .mat-mdc-cell {
      color: rgba(255, 255, 255, 0.85) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
      padding: 16px !important;
      font-size: 0.9rem;
    }
    .premium-row {
      transition: background-color 0.2s ease;
    }
    .premium-row:hover {
      background-color: rgba(255, 255, 255, 0.02);
    }
    .font-mono {
      font-family: 'Courier New', Courier, monospace;
    }
    .owner-cell {
      font-weight: 500;
    }
    .align-right {
      text-align: right !important;
      justify-content: flex-end;
    }
    .amount-cell {
      font-weight: 700;
      font-family: 'Inter Tight', sans-serif;
    }
    .amount-positive {
      color: #4ade80 !important;
    }
    .amount-negative {
      color: #f87171 !important;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-deposito {
      background: rgba(74, 222, 128, 0.1);
      color: #4ade80;
      border: 1px solid rgba(74, 222, 128, 0.2);
    }
    .badge-retiro {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.2);
    }
    .empty-cell {
      text-align: center;
      padding: 48px !important;
      color: rgba(255, 255, 255, 0.5) !important;
    }
    .empty-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 12px;
      color: rgba(255, 255, 255, 0.2);
    }
    .mat-mdc-paginator {
      background: transparent !important;
      color: rgba(255, 255, 255, 0.7) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    ::ng-deep .mat-mdc-paginator-navigation-button {
      color: rgba(255, 255, 255, 0.7) !important;
    }
  `]
})
export class MovimientosComponent implements OnInit {
  private accountService = inject(AccountService);
  private authService = inject(AuthService);

  loading = signal(false);
  downloading = signal(false);
  
  searchQuery = '';
  selectedType = 'todos';
  
  displayedColumns: string[] = ['fechaEvento', 'propietario', 'tipoMovimiento', 'monto'];
  dataSource = new MatTableDataSource<CuentaMovimientoDto>([]);
  allMovimientos: CuentaMovimientoDto[] = [];

  // Obtener los hijos ordenables y paginables
  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  ngOnInit() {
    this.cargarMovimientos();
  }

  cargarMovimientos() {
    const user = this.authService.currentUser();
    if (user && user.IdCuenta) {
      this.loading.set(true);
      this.accountService.getEstadoCuenta(user.IdCuenta).subscribe({
        next: (data) => {
          this.allMovimientos = data.movimientos || [];
          this.dataSource.data = this.allMovimientos;
          
          // Asignar paginación y ordenamiento después de cargar los datos
          setTimeout(() => {
            const p = this.paginator();
            if (p) this.dataSource.paginator = p;
            
            const s = this.sort();
            if (s) this.dataSource.sort = s;
          });
          
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar movimientos', err);
          this.loading.set(false);
        }
      });
    }
  }

  applyFilter() {
    let filtered = [...this.allMovimientos];

    // Filtro por tipo
    if (this.selectedType !== 'todos') {
      filtered = filtered.filter(m => 
        this.selectedType === 'deposito' 
          ? !m.tipoMovimiento.toLowerCase().includes('retiro')
          : m.tipoMovimiento.toLowerCase().includes('retiro')
      );
    }

    // Filtro por búsqueda de texto
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(m => 
        (m.propietario && m.propietario.toLowerCase().includes(q)) || 
        m.tipoMovimiento.toLowerCase().includes(q)
      );
    }

    this.dataSource.data = filtered;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  downloadPdf() {
    const user = this.authService.currentUser();
    if (user && user.IdCuenta) {
      this.downloading.set(true);
      this.accountService.downloadEstadoCuentaPdf(user.IdCuenta).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `EstadoCuenta_${user.IdCuenta}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.downloading.set(false);
        },
        error: (err) => {
          console.error('Error al descargar PDF', err);
          this.downloading.set(false);
        }
      });
    }
  }
}
