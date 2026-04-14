export interface Usuario {
  id: number;
  nombre: string;
  ap_paterno: string;
  ap_materno: string;
  username: string;
  activo: number;
  trabajador_id?: number;
  createdAt: string;
}