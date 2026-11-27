import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '@core/services/reporte.service';
import { ActivoRow } from '@features/activos-fijos/models/activo-fijo.model';
import {
  FiltrosDisponibles,
  FiltrosReporte,
  ResumenGeneral,
  ResumenRow,
} from '@features/reportes/models/reporte.model';

type Tipo = 'general' | 'grupo' | 'oficina' | 'responsable';

@Component({
  selector: 'app-generar-reportes',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './generar-reportes.html',
  styleUrl: './generar-reportes.scss',
})
export class GenerarReportes implements OnInit {
  private svc = inject(ReporteService);

  disponibles = signal<FiltrosDisponibles | null>(null);
  resumen = signal<ResumenGeneral | null>(null);
  filasGeneral = signal<ActivoRow[]>([]);
  filasResumen = signal<ResumenRow[]>([]);
  tipoGenerado = signal<Tipo | null>(null);
  cargando = signal(false);
  mensaje = signal('');
  esError = signal(false);

  tipo: Tipo = 'general';
  f: FiltrosReporte = this.filtrosVacios();

  tipos: { valor: Tipo; texto: string }[] = [
    { valor: 'general', texto: 'Reporte general de activos' },
    { valor: 'grupo', texto: 'Resumen por grupo contable' },
    { valor: 'oficina', texto: 'Resumen por oficina' },
    { valor: 'responsable', texto: 'Resumen por responsable' },
  ];

  ngOnInit() {
    this.svc.filtros().subscribe({
      next: (d) => this.disponibles.set(d),
      error: () => this.aviso('No se pudieron cargar las opciones de filtro', true),
    });
  }

  limpiar() {
    this.f = this.filtrosVacios();
    this.mensaje.set('');
  }

  generar() {
    const t = this.tipo;
    this.cargando.set(true);
    this.mensaje.set('');

    this.svc.resumen(this.f).subscribe({
      next: (r) => this.resumen.set(r),
      error: () => this.aviso('No se pudo obtener el resumen', true),
    });

    if (t === 'general') {
      this.svc.general(this.f).subscribe({
        next: (d) => this.terminar(t, d, []),
        error: () => this.fallo(),
      });
      return;
    }

    const req =
      t === 'grupo'
        ? this.svc.porGrupo(this.f)
        : t === 'oficina'
          ? this.svc.porOficina(this.f)
          : this.svc.porResponsable(this.f);

    req.subscribe({
      next: (d) => this.terminar(t, [], d),
      error: () => this.fallo(),
    });
  }

  descargarCsv() {
    this.svc.descargarCsv(this.f).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-general.csv';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.aviso('No se pudo descargar el CSV', true),
    });
  }

  tituloColumna(): string {
    switch (this.tipoGenerado()) {
      case 'grupo': return 'Grupo contable';
      case 'oficina': return 'Oficina';
      case 'responsable': return 'Responsable';
      default: return '';
    }
  }

  private terminar(t: Tipo, general: ActivoRow[], resumen: ResumenRow[]) {
    this.filasGeneral.set(general);
    this.filasResumen.set(resumen);
    this.tipoGenerado.set(t);
    this.cargando.set(false);
    if (general.length === 0 && resumen.length === 0) {
      this.aviso('No hay datos con los filtros seleccionados', false);
    }
  }

  private fallo() {
    this.cargando.set(false);
    this.aviso('No se pudo generar el reporte (si es la primera vez, Render puede tardar ~1 min en despertar)', true);
  }

  private filtrosVacios(): FiltrosReporte {
    return { codOfic: null, codGrupo: null, codResp: null, estado: null, desde: null, hasta: null, corte: null };
  }

  private aviso(m: string, error: boolean) {
    this.mensaje.set(m);
    this.esError.set(error);
  }
}