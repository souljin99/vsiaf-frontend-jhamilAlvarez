import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ActivoRequest,
  ActivoRow,
  EstadoActivoRequest,
} from '@features/activos-fijos/models/activo-fijo.model';

@Injectable({ providedIn: 'root' })
export class ActivoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/activos`;

  obtener(codActivo: string): Observable<ActivoRow> {
    return this.http.get<ActivoRow>(`${this.url}/${codActivo}`);
  }

  crear(body: ActivoRequest): Observable<ActivoRow> {
    return this.http.post<ActivoRow>(this.url, body);
  }

  modificar(codActivo: string, body: ActivoRequest): Observable<ActivoRow> {
    return this.http.put<ActivoRow>(`${this.url}/${codActivo}`, body);
  }

  eliminar(codActivo: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${codActivo}`);
  }

  cambiarEstado(codActivo: string, estado: string): Observable<ActivoRow> {
    const body: EstadoActivoRequest = { estado };
    return this.http.patch<ActivoRow>(`${this.url}/${codActivo}/estado`, body);
  }
}