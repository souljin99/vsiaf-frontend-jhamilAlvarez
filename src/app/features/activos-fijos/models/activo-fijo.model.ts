export interface ActivoRequest {
  descripcion: string;          // máx. 120
  fechaIncorporacion: string;   // yyyy-MM-dd
  costo: number;                // mínimo 0.01
  estado: string;               // BUENO | REGULAR | MALO
  codGrupo: number;
  codOfic: number;
  codResp: number;
}

export interface ActivoRow {
  codActivo: string;
  descripcion: string;
  codGrupo: number;
  grupo: string;
  codOfic: number;
  oficina: string;
  codResp: number;
  responsable: string;
  fechaIncorporacion: string;
  estado: string;
  costo: number;
  vidaUtil: number;
  depreciacionAcumulada: number;
  valorNeto: number;
}

export interface EstadoActivoRequest {
  estado: string;
}