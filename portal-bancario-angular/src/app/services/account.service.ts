import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface SaldoResponse {
  idCuenta: string;
  saldo: number;
  fechaActualizacion: string;
}

export interface CuentaMovimientoDto {
  monto: number;
  tipoMovimiento: string;
  fechaEvento: string;
  propietario: string;
}

export interface CuentaDto {
  aggregateId: string;
  propietario: string;
  saldo: number;
  movimientos: CuentaMovimientoDto[];
}

export interface TransferenciaRequest {
  cuentaOrigenId: string;
  cuentaDestinoId: string;
  monto: number;
  propietarioOrigen: string;
  propietarioDestino: string;
}

export interface TransferenciaResponse {
  mensaje: string;
  cuentaOrigenId: string;
  saldoActualOrigen: number;
  cuentaDestinoId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrls.general;
  private readonly transactionUrl = environment.apiUrls.transactions;

  getSaldo(cuentaId: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/Cuenta/${cuentaId}/saldo`);
  }

  getEstadoCuenta(cuentaId: string): Observable<CuentaDto> {
    return this.http.get<CuentaDto>(`${this.baseUrl}/Cuenta/${cuentaId}/estado-cuenta`);
  }

  downloadEstadoCuentaPdf(cuentaId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/Cuenta/${cuentaId}/estado-cuenta-pdf`, {
      responseType: 'blob'
    });
  }

  transferir(request: TransferenciaRequest): Observable<TransferenciaResponse> {
    return this.http.post<TransferenciaResponse>(`${this.transactionUrl}/Cuentas/transferir`, request);
  }
}
