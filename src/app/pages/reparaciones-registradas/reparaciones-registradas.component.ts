import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudService } from '../../services/crud.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reparaciones-registradas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reparaciones-registradas.component.html',
  styleUrl: './reparaciones-registradas.component.scss'
})
export class ReparacionesRegistradasComponent implements OnInit {

  // Catálogos
  tiposEquipo: any[] = [];
  marcas: any[] = [];
  modelos: any[] = [];
  refacciones: any[] = [];
  tiposRefacciones: any[] = [];
  areas: any[] = [];


  // Lista de reparaciones obtenidas desde el backend
  reparaciones: any[] = [];
  // Reparación seleccionada para eliminar
  reparacionSeleccionada: any = null;
  // Variable para controlar la visibilidad del modal
  mostrarModalEliminar: boolean = false; 
  // Reparación seleccionada para editar
  reparacionEditar: any = null;
  // Controla la visibilidad del modal de edición
  mostrarModalEditar: boolean = false;

  constructor(
    private crudService: CrudService
  ) {}

  ngOnInit(): void {
    this.listarReparaciones();
  }

  // Método que lista todos los tipos de equipo
  listarTiposEquipo(): void{

    this.crudService
      .get('catalogos/equipos/listarTodosLosTiposDeEquipo')
      .subscribe({

        next: (response: any) => {
          console.log('Tipos de equipo: ', response);
          this.tiposEquipo = response || [];
        },
        error: (error) => {
          console.error('Error al obtener tipos de equipo', error);
        }
      });
  }

  // Método que lista las marcas dependiendo del tipo de equipo seleccionado
  listarMarcasPorTipoEquipo(idTipoEquipo: number): void {

    this.crudService
      .get(`catalogos/marcas/listarMarcasPorTipoEquipo/${idTipoEquipo}`)
      .subscribe({

        next: (response: any) => {
          console.log('Marcas:',response);
          this.marcas = response || [];
        },
        error: (error) => {

          console.error('Error al obtener las marcas:', error);
          this.marcas = [];
        }
      });
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

  // Guarda la reparación seleccionada y muestra el modal
  seleccionarReparacion(reparacion: any): void {
    this.reparacionSeleccionada = reparacion;
    this.mostrarModalEliminar = true; // Abre el modal

    console.log('Reparación seleccionada:',this.reparacionSeleccionada);
  }

  // Limpia la reparación seleccionada y oculta el modal
  limpiarReparacionSeleccionada(): void {
    this.reparacionSeleccionada = null;
    this.mostrarModalEliminar = false; // Cierra el modal
  }

  // Elimina una reparación por su ID y actualiza la lista de reparaciones
  eliminarReparacion(): void {

    if (!this.reparacionSeleccionada) {
      console.error(
        'No hay una reparación seleccionada'
      );
      return;
    }

    const id = this.reparacionSeleccionada.idReparacion;

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

  // Formatea la fecha que se muestra en el frontend | Ejemplo: 2026-07-08 -> 08-07-2026
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

  // Genera el número de folio | Se muestra únicamente en el frontend
  generarFolio(id: number): string {
    return `STE-REP-GTI-${id}`;
  }

  // Abre el modal de edición y obtiene los datos de la reparación seleccionada
  abrirModalEditar(id: any): void {
    // Obtiene la reparación para editar
    this.crudService
      .get(`registro-reparacion/obtenerRegistroReparacionParaEditar/${id}`)
      .subscribe({
        next: (response: any) => {
          console.log('Reparación para editar:',response);

          this.reparacionEditar = response; // Guarda la reparación obtenida para editar
          this.listarTiposEquipo();
          this.listarMarcasPorTipoEquipo(response.idTipoEquipo);
          this.mostrarModalEditar = true; // Mostrar el modal de edición

        },
        error: (error) => {
          console.error(
            'Error al obtener la reparación para editar:',
            error
          );
        }
      });
  }

  // Cuando cambia el tipo de equipo
  onTipoEquipoChange(): void {
    // Reiniciar selects dependientes
    this.reparacionEditar.idMarca = null;
    this.reparacionEditar.idModelo = null;
    this.reparacionEditar.idRefaccion = null;
    // Vaciar arreglos
    this.marcas = [];
    this.modelos = [];
    this.refacciones = [];

    if (!this.reparacionEditar.idTipoEquipo) {
      return;
    }

    this.listarMarcasPorTipoEquipo(
      this.reparacionEditar.idTipoEquipo
    );

  }

  actualizarReparacion(): void {
  }

  cerrarModalEditar(): void {
    this.reparacionEditar = null;
    this.mostrarModalEditar = false;
  }

}