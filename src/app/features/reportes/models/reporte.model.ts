export interface Opcion {
  codigo: number;
  nombre: string;
}

export interface FiltrosDisponibles {
  grupos: Opcion[];
  oficinas: Opcion[];
  responsables: Opcion[];
  estados: string[];
}

export interface FiltrosReporte {
  codOfic?: number | null;
  codGrupo?: number | null;
  codResp?: number | null;
  estado?: string | null;
  desde?: string | null;   // yyyy-MM-dd
  hasta?: string | null;
  corte?: string | null;
}

export interface ResumenGeneral {
  entidad: string;
  unidad: string;
  fechaCorte: string;
  cantidad: number;
  costoTotal: number;
  depreciacionAcumulada: number;
  valorNeto: number;
}

export interface ResumenRow {
  codigo: number;
  nombre: string;
  cantidad: number;
  costoTotal: number;
  depreciacionAcumulada: number;
  valorNeto: number;
}