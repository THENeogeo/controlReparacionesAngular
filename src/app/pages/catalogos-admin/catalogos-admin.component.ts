import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-catalogos-admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastModule, FormsModule],
  templateUrl: './catalogos-admin.component.html',
  styleUrl: './catalogos-admin.component.scss'
})
export class CatalogosAdminComponent implements OnInit {

  // Almacenará los registros que vienen de la base de datos
  tiposEquipo: any[] = [];
  
  // Término de búsqueda para la tabla
  terminoBusqueda: string = '';

  // Variables para el Modal de Edición
  mostrarModalEditar: boolean = false;
  formEditar!: FormGroup;
  equipoSeleccionadoId: number | null = null;

  // NUEVO: Almacenará los registros visibles en la tabla
  tiposEquipoFiltrados: any[] = [];

  // Control del selector de estado
  filtroEstado: string = 'Todos';

  private crudService = inject(CrudService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.listarTiposEquipo();

    // Inicializamos el formulario de edición
    this.formEditar = this.fb.group({
      descripcion: ['', Validators.required]
    });
  }

  // Carga los tipos de equipo desde el backend
  listarTiposEquipo(): void {
    this.crudService.get('catalogos/equipos/listarTodosLosTiposDeEquipo').subscribe({
      next: (response: any) => {
        console.log('Tipos de equipo cargados:', response);
        this.tiposEquipo = response || [];

        // Ejecutamos el filtro inicial para llenar la tabla
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al cargar tipos de equipo:', error);
      }
    });
  }

  // Alternar estatus del equipo
  cambiarEstatus(idTipoEquipo: number): void {
    // Apuntamos al endpoint GET que mostraste en Swagger
    this.crudService.get(`catalogos/catalogos/cambiarEstatus/tipoEquipo/${idTipoEquipo}`).subscribe({
      next: () => {
        console.log(`Estatus del equipo ${idTipoEquipo} actualizado exitosamente.`);
        // Recargamos la tabla automáticamente para ver el cambio visual
        this.listarTiposEquipo();
      },
      error: (error) => {
        console.error('Error al intentar cambiar el estatus:', error);
      }
    });
  }

  // --- LÓGICA DE EDICIÓN ---
  abrirModalEditar(equipo: any): void {
    this.equipoSeleccionadoId = equipo.idTipoEquipo;
    
    // Poblamos el formulario con la descripción actual
    this.formEditar.patchValue({
      descripcion: equipo.descripcion
    });
    
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.formEditar.reset();
    this.equipoSeleccionadoId = null;
  }

  guardarEdicion(): void {
    if (this.formEditar.invalid || !this.equipoSeleccionadoId) {
      this.formEditar.markAllAsTouched();
      return;
    }

    const payload = {
      idTipoEquipo: this.equipoSeleccionadoId,
      descripcion: this.formEditar.value.descripcion
    };

    // Ajusta esta ruta según el endpoint POST/PUT de actualización en tu backend Java
    this.crudService.post('catalogos/equipos/guardarTipoEquipo', payload).subscribe({
      next: () => {
        console.log('Equipo actualizado correctamente');
        this.cerrarModalEditar();
        this.listarTiposEquipo(); // Recargamos la tabla
      },
      error: (err) => console.error('Error al actualizar:', err)
    });
  }

  // Lógica para aplicar los filtros locales
  aplicarFiltros(): void {
    this.tiposEquipoFiltrados = this.tiposEquipo.filter(equipo => {
      // Validamos la condición del select de Estado
      if (this.filtroEstado === 'Activos') {
        return equipo.estatus === 1;
      } else if (this.filtroEstado === 'Inactivos') {
        return equipo.estatus === 0;
      }
      
      // Si es "Todos", regresamos todos
      return true; 
    });
  }
  
}
