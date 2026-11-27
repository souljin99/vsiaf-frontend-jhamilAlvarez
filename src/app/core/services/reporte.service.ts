import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActivoRow } from '@features/activos-fijos/models/activo-fijo.model';
import {
  FiltrosDisponibles,
  FiltrosReporte,
  ResumenGeneral,
  ResumenRow,
} from '@features/reportes/models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/reportes`;

  filtros(): Observable<FiltrosDisponibles> {
    return this.http.get<FiltrosDisponibles>(`${this.url}/filtros`);
  }

  resumen(f: FiltrosReporte = {}): Observable<ResumenGeneral> {
    return this.http.get<ResumenGeneral>(`${this.url}/resumen`, { params: this.params(f) });
  }

  general(f: FiltrosReporte = {}): Observable<ActivoRow[]> {
    return this.http.get<ActivoRow[]>(`${this.url}/general`, { params: this.params(f) });
  }

  porGrupo(f: FiltrosReporte = {}): Observable<ResumenRow[]> {
    return this.http.get<ResumenRow[]>(`${this.url}/por-grupo`, { params: this.params(f) });
  }

  porOficina(f: FiltrosReporte = {}): Observable<ResumenRow[]> {
    return this.http.get<ResumenRow[]>(`${this.url}/por-oficina`, { params: this.params(f) });
  }

  porResponsable(f: FiltrosReporte = {}): Observable<ResumenRow[]> {
    return this.http.get<ResumenRow[]>(`${this.url}/por-responsable`, { params: this.params(f) });
  }

  descargarCsv(f: FiltrosReporte = {}): Observable<Blob> {
    return this.http.get(`${this.url}/general/csv`, {
      params: this.params(f),
      responseType: 'blob',
    });
  }

  /** Solo envía los filtros que tengan valor. */
  private params(f: FiltrosReporte): HttpParams {
    let p = new HttpParams();
    (Object.keys(f) as (keyof FiltrosReporte)[]).forEach((k) => {
      const v = f[k];
      if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
    });
    return p;
  }
}