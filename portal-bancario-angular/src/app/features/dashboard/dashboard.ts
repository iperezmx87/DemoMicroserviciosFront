import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services/auth.service';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
          [attr.role]="'navigation'"
          [mode]="'side'"
          [opened]="true">
        <mat-toolbar color="primary">Menú</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard/resumen" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Resumen</span>
          </a>
          <a mat-list-item routerLink="/dashboard/movimientos" routerLinkActive="active">
            <mat-icon matListItemIcon>history</mat-icon>
            <span matListItemTitle>Movimientos</span>
          </a>
          <a mat-list-item routerLink="/dashboard/transferir" routerLinkActive="active">
            <mat-icon matListItemIcon>swap_horiz</mat-icon>
            <span matListItemTitle>Transferir</span>
          </a>
          <a mat-list-item (click)="logout()">
            <mat-icon matListItemIcon>logout</mat-icon>
            <span matListItemTitle>Cerrar Sesión</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <mat-toolbar color="primary" class="top-toolbar">
          <button type="button" aria-label="Toggle sidenav" mat-icon-button (click)="drawer.toggle()">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          <span>Banco Isra - {{ getUserName() }}</span>
        </mat-toolbar>
        
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    .sidenav {
      width: 250px;
      background: #121212;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    .top-toolbar {
      position: sticky;
      top: 0;
      z-index: 1;
    }
    .content {
      padding: 24px;
    }
    .active {
      background: rgba(63, 81, 181, 0.1);
      color: #3f51b5;
    }
  `]
})
export class DashboardComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  getUserName(): string {
    const user = this.authService.currentUser();
    if (!user) return 'Usuario';
    return user.Propietario || user.unique_name || user.name || user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Usuario';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
