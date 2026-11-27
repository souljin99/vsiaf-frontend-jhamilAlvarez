import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivoService } from '@core/services/activo-fijo.service';
import { ReporteService } from '@core/services/reporte.service';
import { ActivoRequest, ActivoRow } from '@features/activos-fijos/models/activo-fijo.model';
import { FiltrosDisponibles } from '@features/reportes/models/reporte.model';

type Modo = 'ver' | 'nuevo' | 'editar';

interface FormActivo {
  descripcion: string;
  fechaIncorporacion: string;
  costo: number | null;
  estado: string;
  codGrupo: number | null;
  codOfic: number | null;
  codResp: number | null;
}

@Component({
  selector: 'app-activos-fijos',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './activos-fijos.html',
  styleUrl: './activos-fijos.scss',
})
export class ActivosFijos implements OnInit {
  private activos = inject(ActivoService);
  private reportes = inject(ReporteService);

  lista = signal<ActivoRow[]>([]);
  filtros = signal<FiltrosDisponibles | null>(null);
  seleccionado = signal<ActivoRow | null>(null);
  modo = signal<Modo>('ver');
  cargando = signal(false);
  mensaje = signal('');
  esError = signal(false);

  editando = computed(() => this.modo() !== 'ver');
  estados = computed(() => {
    const e = this.filtros()?.estados;
    return e && e.length ? e : ['BUENO', 'REGULAR', 'MALO'];
  });

  form: FormActivo = this.vacio();
  estadoNuevo = 'BUENO';

  ngOnInit() {
    this.reportes.filtros().subscribe({
      next: (f) => this.filtros.set(f),
      error: () => this.aviso('No se pudieron cargar las opciones (grupos, oficinas, responsables)', true),
    });
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    // El backend no tiene GET /api/activos: el listado sale del reporte general.
    this.reportes.general().subscribe({
      next: (d) => {
        this.lista.set(d);
        this.cargando.set(false);
      },
      error: () => {
        this.aviso('No se pudo cargar (si es la primera vez, Render puede tardar ~1 min en despertar)', true);
        this.cargando.set(false);
      },
    });
  }

  seleccionar(a: ActivoRow) {
    if (this.editando()) return;
    this.seleccionado.set(a);
    this.llenarForm(a);
  }

  nuevo() {
    this.seleccionado.set(null);
    this.form = this.vacio();
    this.modo.set('nuevo');
  }

  modificar() {
    if (this.seleccionado()) this.modo.set('editar');
  }

  cancelar() {
    this.modo.set('ver');
    const s = this.seleccionado();
    if (s) this.llenarForm(s);
    else this.form = this.vacio();
  }

  guardar() {
    const f = this.form;
    const descripcion = f.descripcion.trim();
    if (!descripcion) return this.aviso('La descripción es obligatoria', true);
    if (descripcion.length > 120) return this.aviso('La descripción admite máximo 120 caracteres', true);
    if (!f.fechaIncorporacion) return this.aviso('La fecha de incorporación es obligatoria', true);
    if (f.costo === null || f.costo < 0.01) return this.aviso('El costo debe ser al menos 0.01', true);
    if (f.codGrupo === null || f.codOfic === null || f.codResp === null)
      return this.aviso('Seleccione grupo, oficina y responsable', true);

    const body: ActivoRequest = {
      descripcion,
      fechaIncorporacion: f.fechaIncorporacion,
      costo: f.costo,
      estado: f.estado,
      codGrupo: f.codGrupo,
      codOfic: f.codOfic,
      codResp: f.codResp,
    };

    const s = this.seleccionado();
    const req =
      this.modo() === 'editar' && s
        ? this.activos.modificar(s.codActivo, body)
        : this.activos.crear(body);

    req.subscribe({
      next: (r) => {
        this.aviso('Guardado correctamente', false);
        this.modo.set('ver');
        this.seleccionado.set(r);
        this.llenarForm(r);
        this.cargar();
      },
      error: (e) => this.aviso(this.textoError(e, 'No se pudo guardar'), true),
    });
  }

  eliminar() {
    const s = this.seleccionado();
    if (!s || !confirm(`¿Eliminar el activo ${s.codActivo}?`)) return;
    this.activos.eliminar(s.codActivo).subscribe({
      next: () => {
        this.aviso('Activo eliminado', false);
        this.seleccionado.set(null);
        this.form = this.vacio();
        this.cargar();
      },
      error: (e) => this.aviso(this.textoError(e, 'No se pudo eliminar'), true),
    });
  }

  cambiarEstado() {
    const s = this.seleccionado();
    if (!s) return;
    this.activos.cambiarEstado(s.codActivo, this.estadoNuevo).subscribe({
      next: (r) => {
        this.seleccionado.set(r);
        this.llenarForm(r);
        this.cargar();
        this.aviso(`Estado cambiado a ${r.estado}`, false);
      },
      error: (e) => this.aviso(this.textoError(e, 'No se pudo cambiar el estado'), true),
    });
  }

  private llenarForm(a: ActivoRow) {
    this.form = {
      descripcion: a.descripcion,
      fechaIncorporacion: a.fechaIncorporacion,
      costo: a.costo,
      estado: a.estado,
      codGrupo: a.codGrupo,
      codOfic: a.codOfic,
      codResp: a.codResp,
    };
    this.estadoNuevo = a.estado;
  }

  private vacio(): FormActivo {
    return {
      descripcion: '',
      fechaIncorporacion: new Date().toISOString().slice(0, 10),
      costo: null,
      estado: 'BUENO',
      codGrupo: null,
      codOfic: null,
      codResp: null,
    };
  }

  private textoError(e: any, porDefecto: string): string {
    return e?.error?.message ?? e?.error?.detail ?? porDefecto;
  }

  private aviso(m: string, error: boolean) {
    this.mensaje.set(m);
    this.esError.set(error);
  }
}