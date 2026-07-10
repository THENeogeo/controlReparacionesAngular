import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-reparaciones-registradas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reparaciones-registradas.component.html',
  styleUrl: './reparaciones-registradas.component.scss'
})
export class ReparacionesRegistradasComponent implements OnInit {

  // Lista de reparaciones obtenidas desde el backend
  reparaciones: any[] = [];

  // Reparación seleccionada para eliminar
  reparacionSeleccionada: any = null;

  // NUEVO: Variable para controlar la visibilidad del modal
  mostrarModalEliminar: boolean = false; 

  constructor(
    private crudService: CrudService
  ) {}

  ngOnInit(): void {
    this.listarReparaciones();
  }

  // Enlista los registros de reparaciones
  listarReparaciones(): void {
    this.crudService
      .get(
        'registro-reparacion/listarRegistrosDeReparacionDTO'
      )
      .subscribe({
        next: (response: any) => {
          console.log(
            'Reparaciones listadas:',
            response
          );

          this.reparaciones = response || [];
        },
        error: (error) => {
          console.error(
            'Error al listar las reparaciones:',
            error
          );

          this.reparaciones = [];
        }
      });
  }

  // Guarda la reparación seleccionada y MUESTRA el modal
  seleccionarReparacion(reparacion: any): void {
    this.reparacionSeleccionada = reparacion;
    this.mostrarModalEliminar = true; // Abre el modal

    console.log(
      'Reparación seleccionada:',
      this.reparacionSeleccionada
    );
  }

  // Limpia la reparación seleccionada y OCULTA el modal
  limpiarReparacionSeleccionada(): void {
    this.reparacionSeleccionada = null;
    this.mostrarModalEliminar = false; // Cierra el modal
  }

  // Elimina una reparación por su ID
  // y actualiza la lista de reparaciones
  eliminarReparacion(): void {

    if (!this.reparacionSeleccionada) {
      console.error(
        'No hay una reparación seleccionada'
      );
      return;
    }

    const id =
      this.reparacionSeleccionada.idReparacion;

    this.crudService
      .delete(
        `registro-reparacion/eliminarRegistroReparacion/${id}`
      )
      .subscribe({
        next: (response: any) => {
          console.log(
            'Reparación eliminada:',
            response
          );

          // Refrescar la lista
          this.listarReparaciones();

          // Limpiar selección y cerrar modal
          this.limpiarReparacionSeleccionada(); 
        },
        error: (error) => {
          console.error(
            'Error al eliminar la reparación:',
            error
          );
        }
      });
  }

  // Formatea la fecha que se muestra en el frontend
  // Ejemplo: 2026-07-08 -> 08-07-2026
  formatearFecha(fecha: string): string {

    if (!fecha) {
      return '';
    }

    const partes = fecha.split('-');

    const anio = partes[0];
    const mes = partes[1];
    const dia = partes[2];

    return `${dia}-${mes}-${anio}`;
  }

  // Genera el número de folio
  // Se muestra únicamente en el frontend
  generarFolio(id: number): string {
    return `STE-REP-GTI-${id}`;
  }
}