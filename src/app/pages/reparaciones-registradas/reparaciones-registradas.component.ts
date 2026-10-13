import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudService } from '../../services/crud.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reparaciones-registradas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
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

  // Variables para el filtro de fechas
  fechaInicio: string = '';
  fechaFin: string = '';

  // Variables de paginación
  paginaActual: number = 1;
  tamanioPagina: number = 10;

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
    private crudService: CrudService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.listarReparaciones();
    this.listarTiposEquipo();
    this.cargarCatalogosIndependientes(); // Cargamos Áreas y Tipos de Refacción
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
          let data = response || [];
          
          // NUEVO: Ordenamos el arreglo por idReparacion de forma ascendente
          this.reparaciones = data.sort((a: any, b: any) => a.idReparacion - b.idReparacion);
          
          console.log('Reparaciones listadas y ordenadas:', this.reparaciones);
        },
        error: (error) => {
          console.error('Error al listar las reparaciones:', error);
          this.reparaciones = [];
        }
      });
  }

  // Filtra las reparaciones según el rango de fechas seleccionado
  filtrarPorFechas(): void {
    // Validamos que ambas fechas estén seleccionadas antes de consultar al backend
    if (!this.fechaInicio || !this.fechaFin) {
      console.warn('Debe seleccionar ambas fechas para filtrar.');
      return;
    }

    // Armamos la URL concatenando los query parameters tal como los pide Swagger
    const endpoint = `registro-reparacion/listarRegistroReparacionPorFechas?fechaInicio=${this.fechaInicio}&fechaFin=${this.fechaFin}`;

    this.crudService.get(endpoint).subscribe({
      next: (response: any) => {
        let data = response || [];
        
        // NUEVO: También ordenamos los resultados cuando el usuario aplique un filtro
        this.reparaciones = data.sort((a: any, b: any) => a.idReparacion - b.idReparacion);
        
        console.log('Reparaciones filtradas y ordenadas:', this.reparaciones);
      },
      error: (error) => {
        console.error('Error al filtrar las reparaciones:', error);
        this.reparaciones = [];
      }
    });
  }

  // Limpia los inputs y vuelve a cargar todos los registros
  limpiarFiltro(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.listarReparaciones();
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
      console.error('No hay una reparación seleccionada');
      return;
    }

    const id = this.reparacionSeleccionada.idReparacion;

    this.crudService
      .delete(`registro-reparacion/eliminarRegistroReparacion/${id}`)
      .subscribe({
        next: (response: any) => {
          console.log('Reparación eliminada:', response);
          
          this.limpiarReparacionSeleccionada(); // Cierra el modal
          this.listarReparaciones(); // Recarga la tabla
          this.snackBar.open('¡Registro eliminado correctamente!', 'Cerrar', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' });
        },
        error: (error) => {
          // Capturamos el falso error de texto plano validando el status 200 (OK)
          if (error.status === 200) {
            console.log('Reparación eliminada (Status 200)');
            
            this.limpiarReparacionSeleccionada(); // Cierra el modal
            this.listarReparaciones(); // Recarga la tabla
            this.snackBar.open('¡Registro eliminado correctamente!', 'Cerrar', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' });
          } else {
            console.error('Error al eliminar la reparación:', error);
            this.snackBar.open('Ocurrió un error al intentar eliminar el registro.', 'Cerrar', { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' });
          }
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

  // Cuando cambia la Marca
  onMarcaChange(): void {
    // Reiniciar selects dependientes
    this.reparacionEditar.idModelo = null;
    this.reparacionEditar.idRefaccion = null;
    
    // Vaciar arreglos dependientes
    this.modelos = [];
    this.refacciones = [];

    if (!this.reparacionEditar.idMarca) {
      return;
    }

    this.listarModelosPorMarca(this.reparacionEditar.idMarca);
  }

  // Carga los catálogos que no dependen de ningún otro valor
  cargarCatalogosIndependientes(): void {
    this.crudService.get('catalogos/refacciones/listarTipoRefaccion').subscribe({
      next: (res: any) => this.tiposRefacciones = res || []
    });
    this.crudService.get('catalogos/areas/listarAreas').subscribe({
      next: (res: any) => this.areas = res || []
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

    this.listarMarcasPorTipoEquipo(this.reparacionEditar.idTipoEquipo);
    this.listarRefaccionesPorTipoEquipo(this.reparacionEditar.idTipoEquipo);
  }

  // Método que lista las refacciones dependiendo del equipo
  listarRefaccionesPorTipoEquipo(idTipoEquipo: number): void {
    this.crudService
      .get(`catalogos/refacciones/listarRefaccionesPorTipoEquipo/${idTipoEquipo}`)
      .subscribe({
        next: (res: any) => this.refacciones = res || [],
        error: () => this.refacciones = []
      });
  }

  // Método que lista los modelos dependiendo de la marca seleccionada
  listarModelosPorMarca(idMarca: number): void {
    // Suponiendo que este sea tu endpoint correcto en el backend:
    this.crudService
      .get(`catalogos/modelos/listarModelosPorMarca/${idMarca}`)
      .subscribe({
        next: (response: any) => {
          console.log('Modelos:', response);
          this.modelos = response || [];
        },
        error: (error) => {
          console.error('Error al obtener los modelos:', error);
          this.modelos = [];
        }
      });
  }

  // Abre el modal de edición, desencadena la carga en cascada y muestra el modal
  abrirModalEditar(id: any): void {
    this.crudService
      .get(`registro-reparacion/obtenerRegistroReparacionParaEditar/${id}`)
      .subscribe({
        next: (response: any) => {
          console.log('Reparación para editar:', response);

          // 1. Forzamos tipado numérico
          const datosReparacion = { 
            ...response,
            idTipoEquipo: response.idTipoEquipo != null ? Number(response.idTipoEquipo) : null,
            idMarca:      response.idMarca      != null ? Number(response.idMarca)      : null,
            idModelo:     response.idModelo     != null ? Number(response.idModelo)     : null,
            idRefaccion:  response.idRefaccion  != null ? Number(response.idRefaccion)  : null,
            idTipoRefaccion: response.idTipoRefaccion != null ? Number(response.idTipoRefaccion) : null,
            idArea:       response.idArea       != null ? Number(response.idArea)       : null
          };

          // 2. Iniciamos la cascada de catálogos dependientes
          if (datosReparacion.idTipoEquipo) {
            
            // A. Cargamos Marcas
            this.crudService.get(`catalogos/marcas/listarMarcasPorTipoEquipo/${datosReparacion.idTipoEquipo}`).subscribe(resMarcas => {
              this.marcas = resMarcas || [];

              // B. Cargamos Refacciones
              this.crudService.get(`catalogos/refacciones/listarRefaccionesPorTipoEquipo/${datosReparacion.idTipoEquipo}`).subscribe(resRefacciones => {
                this.refacciones = resRefacciones || [];

                // C. Cargamos Modelos (si hay marca)
                if (datosReparacion.idMarca) {
                  this.crudService.get(`catalogos/modelos/listarModelosPorMarca/${datosReparacion.idMarca}`).subscribe(resModelos => {
                    this.modelos = resModelos || [];
                    
                    // ¡Todo cargado! Mostramos modal
                    this.reparacionEditar = datosReparacion;
                    this.mostrarModalEditar = true;
                  });
                } else {
                  this.reparacionEditar = datosReparacion;
                  this.mostrarModalEditar = true;
                }
              });
            });
          } else {
            // Si el registro no tiene equipo
            this.marcas = [];
            this.modelos = [];
            this.refacciones = [];
            this.reparacionEditar = datosReparacion;
            this.mostrarModalEditar = true;
          }
        },
        error: (error) => {
          console.error('Error al obtener la reparación para editar:', error);
        }
      });
  }

  // --- ACTUALIZAR REGISTRO ---
  actualizarReparacion(): void {
    if (!this.reparacionEditar) return;

    const id = this.reparacionEditar.idReparacion;

    const payload = {
      idReparacion: id,
      idTipoEquipo: this.reparacionEditar.idTipoEquipo ? Number(this.reparacionEditar.idTipoEquipo) : null,
      idMarca: this.reparacionEditar.idMarca ? Number(this.reparacionEditar.idMarca) : null,
      idModelo: this.reparacionEditar.idModelo ? Number(this.reparacionEditar.idModelo) : null,
      inventario: this.reparacionEditar.inventario,
      idRefaccion: this.reparacionEditar.idRefaccion ? Number(this.reparacionEditar.idRefaccion) : null,
      idTipoRefaccion: this.reparacionEditar.idTipoRefaccion ? Number(this.reparacionEditar.idTipoRefaccion) : null,
      refaccionInventario: this.reparacionEditar.refaccionInventario,
      descripcionReporte: this.reparacionEditar.descripcionReporte,
      expediente: this.reparacionEditar.expediente,
      idArea: this.reparacionEditar.idArea ? Number(this.reparacionEditar.idArea) : null,
      fechaRegistro: this.reparacionEditar.fechaRegistro
    };

    const endpoint = `registro-reparacion/editarRegistroReparacion/${id}`;

    this.crudService.put(endpoint, payload).subscribe({
      next: (response: any) => {
        console.log('Reparación actualizada exitosamente:', response);
        this.cerrarModalEditar();
        this.listarReparaciones();
        
        // Notificación elegante de Angular Material
        this.snackBar.open('¡Registro actualizado correctamente!', 'Cerrar', { 
          duration: 3000, 
          horizontalPosition: 'center', 
          verticalPosition: 'bottom' 
        });
      },
      error: (error: any) => {
        if (error.status === 200) {
          console.log('Reparación actualizada exitosamente (status 200)');
          this.cerrarModalEditar();
          this.listarReparaciones();
          
          // Notificación elegante de Angular Material (Falso error por texto plano)
          this.snackBar.open('¡Registro actualizado correctamente!', 'Cerrar', { 
            duration: 3000, 
            horizontalPosition: 'center', 
            verticalPosition: 'bottom' 
          });
        } else {
          console.error('Error al actualizar la reparación:', error);
          
          // Notificación elegante de error
          this.snackBar.open('Ocurrió un error al intentar actualizar el registro.', 'Cerrar', { 
            duration: 3000, 
            horizontalPosition: 'center', 
            verticalPosition: 'bottom' 
          });
        }
      }
    });
  }

  cerrarModalEditar(): void {
    this.reparacionEditar = null;
    this.mostrarModalEditar = false;
  }

  // --- GETTERS PARA PAGINACIÓN ---
  // Devuelve solo el "pedazo" de arreglo que corresponde a la página actual
  get reparacionesPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.tamanioPagina;
    const fin = inicio + Number(this.tamanioPagina); // Convertimos a número por si viene como string del select
    return this.reparaciones.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.reparaciones.length / this.tamanioPagina);
  }

  // Textos dinámicos para el pie de página ("Mostrando 1 al 10...")
  get rangoInicio(): number {
    if (this.reparaciones.length === 0) return 0;
    return (this.paginaActual - 1) * this.tamanioPagina + 1;
  }

  get rangoFin(): number {
    const fin = this.paginaActual * this.tamanioPagina;
    return fin > this.reparaciones.length ? this.reparaciones.length : fin;
  }

  // --- MÉTODOS DE PAGINACIÓN ---
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  onTamanioPaginaChange(): void {
    this.paginaActual = 1; // Si el usuario cambia de 10 a 25 registros, lo regresamos a la página 1
  }

}