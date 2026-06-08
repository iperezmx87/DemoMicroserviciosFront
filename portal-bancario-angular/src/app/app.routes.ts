import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ResumenComponent } from './features/dashboard/resumen/resumen';
import { MovimientosComponent } from './features/dashboard/movimientos/movimientos';
import { TransferirComponent } from './features/dashboard/transferir/transferir';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
        { path: 'resumen', component: ResumenComponent },
        { path: 'movimientos', component: MovimientosComponent },
        { path: 'transferir', component: TransferirComponent },
        { path: '', redirectTo: 'resumen', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
