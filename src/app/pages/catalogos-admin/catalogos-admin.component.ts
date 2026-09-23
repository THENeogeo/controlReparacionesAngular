import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastModule } from 'primeng/toast';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-catalogos-admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastModule, FormsModule, MatSnackBarModule],
  templateUrl: './catalogos-admin.component.html',
  styleUrl: './catalogos-admin.component.scss'
})
export class CatalogosAdminComponent implements OnInit {

  // CONTROL DE CATÁLOGO ACTIVO
  // Catálogos: 'equipos', 'marcas', 'modelos', 'refacciones'
  catalogoActivo: string = 'equipos';
  
  // Títulos dinámicos
  titulos: any = {
    'equipos': { titulo: 'Tipos de equipo', subtitulo: 'Lista de tipos de equipo registrados en el sistema.' },
    'marcas': { titulo: 'Marcas', subtitulo: 'Fabricantes ligados a un tipo de equipo.' },
    'modelos': { titulo: 'Modelos', subtitulo: 'Modelos ligados a una marca.' },
    'refacciones': { titulo: 'Refacciones', subtitulo: 'Componentes y piezas por equipo.' }
  };

  // Variables para la tabla
  datosOriginales: any[] = [];
  datosFiltrados: any[] = [];
  terminoBusqueda: string = '';
  filtroEstado: string = 'Todos';

  // Variables para el Modal y Relaciones
  mostrarModalEditar: boolean = false;
  formEditar!: FormGroup;
  itemSeleccionadoId: number | null = null;
  guardando: boolean = false;
  
  // Catálogos base para los selects del modal
  tiposEquipoList: any[] = [];
  marcasList: any[] = [];

  private crudService = inject(CrudService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    // Inicializamos el formulario con todos los campos posibles
    this.formEditar = this.fb.group({
      descripcion: ['', Validators.required],
      idTipoEquipo: [null], // Se validará dinámicamente
      idMarca: [null]       // Se validará dinámicamente
    });

    // Cargamos los tipos de equipo porque son la base de todas las relaciones
    this.cargarTiposEquipoBase();
    
    // Cargamos el catálogo inicial
    this.cambiarCatalogo('equipos');
  }

  cargarTiposEquipoBase(): void {
    this.crudService.get('catalogos/equipos/listarTodosLosTiposDeEquipo').subscribe({
      next: (res: any) => this.tiposEquipoList = res || []
    });
  }

  // --- NAVEGACIÓN Y CARGA DE DATOS ---
  cambiarCatalogo(catalogo: string): void {
    this.catalogoActivo = catalogo;
    this.filtroEstado = 'Todos';
    this.terminoBusqueda = '';
    this.listarCatalogoActivo();
  }

  listarCatalogoActivo(): void {
    let endpoint = '';
    switch (this.catalogoActivo) {
      case 'equipos': endpoint = 'catalogos/equipos/listarTodosLosTiposDeEquipo'; break;
      case 'marcas': endpoint = 'catalogos/marcas/listarTodasLasMarcas'; break;
      case 'modelos': endpoint = 'catalogos/modelos/listarTodosLosModelos'; break;
      case 'refacciones': endpoint = 'catalogos/refacciones/listarTodasLasRefacciones'; break;
    }

    this.crudService.get(endpoint).subscribe({
      next: (response: any) => {
        console.log(`Datos cargados (${this.catalogoActivo}):`, response);
        this.datosOriginales = response || [];
        this.aplicarFiltros();
      },
      error: (err) => console.error(`Error al cargar ${this.catalogoActivo}:`, err)
    });
  }

  // Se obtiene el ID genérico independientemente del objeto
  obtenerId(item: any): number {
    return item.idTipoEquipo || item.idMarca || item.idModelo || item.idRefaccion;
  }

  // Alternar estatus genérico
  cambiarEstatus(item: any): void {
    const id = this.obtenerId(item);
    let endpoint = '';
    
    // Rutas directas al controlador Java
    switch (this.catalogoActivo) {
      case 'equipos': endpoint = `catalogos/equipos/cambiarEstatus/${id}`; break;
      case 'marcas': endpoint = `catalogos/marcas/cambiarEstatus/${id}`; break;
      case 'modelos': endpoint = `catalogos/modelos/cambiarEstatus/${id}`; break;
      case 'refacciones': endpoint = `catalogos/refacciones/cambiarEstatus/${id}`; break;
    }

    this.crudService.get(endpoint).subscribe({
      next: () => {
        console.log(`Estatus actualizado exitosamente.`);
        this.listarCatalogoActivo();
      },
      error: (err) => console.error('Error al cambiar estatus:', err)
    });
  }

  // --- Modal para edición ---
  abrirModalEditar(item: any): void {
    this.itemSeleccionadoId = this.obtenerId(item);
    this.formEditar.reset();
    this.marcasList = [];

    // 1. Habilitamos temporalmente para limpiar validaciones y setear valores
    this.formEditar.get('idTipoEquipo')?.enable();
    this.formEditar.get('idMarca')?.enable();

    this.formEditar.get('idTipoEquipo')?.clearValidators();
    this.formEditar.get('idMarca')?.clearValidators();

    if (this.catalogoActivo !== 'equipos') {
      this.formEditar.get('idTipoEquipo')?.setValidators([Validators.required]);
    }
    if (this.catalogoActivo === 'modelos') {
      this.formEditar.get('idMarca')?.setValidators([Validators.required]);
    }
    this.formEditar.get('idTipoEquipo')?.updateValueAndValidity();
    this.formEditar.get('idMarca')?.updateValueAndValidity();

    // 2. Poblamos el formulario
    if (this.catalogoActivo === 'equipos') {
      this.formEditar.patchValue({ descripcion: item.descripcion });
    } 
    else if (this.catalogoActivo === 'marcas' || this.catalogoActivo === 'refacciones') {
      this.formEditar.patchValue({
        descripcion: item.descripcion,
        idTipoEquipo: item.tipoEquipo?.idTipoEquipo
      });
    } 
    else if (this.catalogoActivo === 'modelos') {
      const idTipo = item.marca?.tipoEquipo?.idTipoEquipo;
      this.formEditar.patchValue({
        descripcion: item.descripcion,
        idTipoEquipo: idTipo
      });
      if (idTipo) {
        this.crudService.get(`catalogos/marcas/listarMarcasPorTipoEquipo/${idTipo}`).subscribe(res => {
          this.marcasList = res || [];
          this.formEditar.patchValue({ idMarca: item.marca?.idMarca });
          
          // BLOQUEAMOS LA MARCA DESPUÉS DE CARGARLA
          this.formEditar.get('idMarca')?.disable(); 
        });
      }
    }

    // 3. BLOQUEAMOS EL TIPO DE EQUIPO
    if (this.catalogoActivo !== 'equipos') {
      this.formEditar.get('idTipoEquipo')?.disable();
    }

    this.mostrarModalEditar = true;
  }  
  // --- Lógica de edición en cascada ---
  // abrirModalEditar(item: any): void {
  //   this.itemSeleccionadoId = this.obtenerId(item);
  //   this.formEditar.reset();
  //   this.marcasList = [];

  //   // Ajustamos validaciones según el catálogo
  //   this.formEditar.get('idTipoEquipo')?.clearValidators();
  //   this.formEditar.get('idMarca')?.clearValidators();

  //   if (this.catalogoActivo !== 'equipos') {
  //     this.formEditar.get('idTipoEquipo')?.setValidators([Validators.required]);
  //   }
  //   if (this.catalogoActivo === 'modelos') {
  //     this.formEditar.get('idMarca')?.setValidators([Validators.required]);
  //   }
  //   this.formEditar.get('idTipoEquipo')?.updateValueAndValidity();
  //   this.formEditar.get('idMarca')?.updateValueAndValidity();

  //   // Poblamos el formulario
  //   if (this.catalogoActivo === 'equipos') {
  //     this.formEditar.patchValue({ descripcion: item.descripcion });
  //   } 
  //   else if (this.catalogoActivo === 'marcas' || this.catalogoActivo === 'refacciones') {
  //     this.formEditar.patchValue({
  //       descripcion: item.descripcion,
  //       idTipoEquipo: item.tipoEquipo?.idTipoEquipo
  //     });
  //   } 
  //   else if (this.catalogoActivo === 'modelos') {
  //     const idTipo = item.marca?.tipoEquipo?.idTipoEquipo;
  //     this.formEditar.patchValue({
  //       descripcion: item.descripcion,
  //       idTipoEquipo: idTipo
  //     });
  //     // Cargamos marcas en cascada para este equipo
  //     if (idTipo) {
  //       this.crudService.get(`catalogos/marcas/listarMarcasPorTipoEquipo/${idTipo}`).subscribe(res => {
  //         this.marcasList = res || [];
  //         this.formEditar.patchValue({ idMarca: item.marca?.idMarca });
  //       });
  //     }
  //   }

  //   this.mostrarModalEditar = true;
  // }

  abrirModalEliminar(item: any): void {

  }

  onTipoEquipoChangeModal(): void {
    if (this.catalogoActivo === 'modelos') {
      this.formEditar.patchValue({ idMarca: null });
      this.marcasList = [];
      const idTipo = this.formEditar.get('idTipoEquipo')?.value;
      
      if (idTipo) {
        this.crudService.get(`catalogos/marcas/listarMarcasPorTipoEquipo/${idTipo}`).subscribe(res => {
          this.marcasList = res || [];
        });
      }
    }
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.itemSeleccionadoId = null;
  }

  // --- Método para agregar y modificar registros de los catálogos ---
  guardarEdicion(): void {
    if (this.formEditar.invalid) { 
      this.formEditar.markAllAsTouched();
      return;
    }

    this.guardando = true; 
    const esNuevo = this.itemSeleccionadoId === 0;
    
    // Obtenemos la descripción (esté bloqueada o no)
    const desc = this.formEditar.get('descripcion')?.value;
    const descUrl = encodeURIComponent(desc); // Prepara el texto para viajar en la URL

    if (esNuevo) {
      // ==========================================
      // LÓGICA PARA CREAR (POST)
      // ==========================================
      let endpointPost = '';
      let payloadPost: any = { descripcion: desc };

      switch (this.catalogoActivo) {
        case 'equipos': 
          endpointPost = 'catalogos/equipos/agregarEquipo'; 
          break;
        case 'marcas': 
          endpointPost = `catalogos/marcas/agregarMarca?tipoEquipoId=${this.formEditar.get('idTipoEquipo')?.value}`; 
          break;
        case 'modelos': 
          endpointPost = `catalogos/modelos/agregarModelo?marcaId=${this.formEditar.get('idMarca')?.value}`; 
          break;
        case 'refacciones': 
          endpointPost = `catalogos/refacciones/agregarRefaccion?tipoEquipoId=${this.formEditar.get('idTipoEquipo')?.value}`; 
          break;
      }

      this.crudService.post(endpointPost, payloadPost).subscribe({
        next: () => this.manejarExito(esNuevo),
        error: (err) => this.manejarError(err, esNuevo)
      });

    } else {
      // ==========================================
      // LÓGICA PARA EDITAR (PUT)
      // ==========================================
      let endpointPut = '';
      const id = this.itemSeleccionadoId;

      // Armamos la URL exacta con los @RequestParam que pide Spring Boot
      switch (this.catalogoActivo) {
        case 'equipos': 
          endpointPut = `catalogos/equipos/editarEquipo?tipoEquipoId=${id}&tipoEquipo=${descUrl}`; 
          break;
        case 'marcas': 
          endpointPut = `catalogos/marcas/editarMarca?marcaId=${id}&marca=${descUrl}`; 
          break;
        case 'modelos': 
          endpointPut = `catalogos/modelos/editarModelo?modeloId=${id}&modelo=${descUrl}`; 
          break;
        case 'refacciones': 
          endpointPut = `catalogos/refacciones/editarRefaccion?refaccionId=${id}&refaccion=${descUrl}`; 
          break;
      }

      // Enviamos null en el body porque toda la información va en los parámetros de la URL
      this.crudService.put(endpointPut, null).subscribe({
        next: () => this.manejarExito(esNuevo),
        error: (err) => this.manejarError(err, esNuevo)
      });
    }
  }

  // --- Método auxiliar para procesar el falso error de texto plano ---
  manejarError(err: any, esNuevo: boolean): void {
    if (err.status === 200) {
      this.manejarExito(esNuevo);
    } else {
      this.guardando = false; 
      this.snackBar.open('Ocurrió un error al intentar guardar.', 'Cerrar', { duration: 3000 });
      console.error('Error al guardar:', err);
    }
  }
  // guardarEdicion(): void {
  //   if (this.formEditar.invalid) { 
  //     this.formEditar.markAllAsTouched();
  //     return;
  //   }

  //   this.guardando = true; // Bloqueamos el botón y mostramos el loading
  //   const esNuevo = this.itemSeleccionadoId === 0;
  //   let endpoint = '';
  //   let payload: any = { descripcion: this.formEditar.value.descripcion };

  //   if (esNuevo) {
  //     switch (this.catalogoActivo) {
  //       case 'equipos': endpoint = 'catalogos/equipos/agregarEquipo'; break;
  //       case 'marcas': endpoint = `catalogos/marcas/agregarMarca?tipoEquipoId=${this.formEditar.value.idTipoEquipo}`; break;
  //       case 'modelos': endpoint = `catalogos/modelos/agregarModelo?marcaId=${this.formEditar.value.idMarca}`; break;
  //       case 'refacciones': endpoint = `catalogos/refacciones/agregarRefaccion?tipoEquipoId=${this.formEditar.value.idTipoEquipo}`; break;
  //     }
  //   } else {
  //     const id = this.itemSeleccionadoId;
  //     switch (this.catalogoActivo) {
  //       case 'equipos': endpoint = 'catalogos/equipos/guardarTipoEquipo'; payload.idTipoEquipo = id; break;
  //       case 'marcas': endpoint = 'catalogos/marcas/guardarMarca'; payload.idMarca = id; payload.tipoEquipo = { idTipoEquipo: Number(this.formEditar.value.idTipoEquipo) }; break;
  //       case 'modelos': endpoint = 'catalogos/modelos/guardarModelo'; payload.idModelo = id; payload.marca = { idMarca: Number(this.formEditar.value.idMarca) }; break;
  //       case 'refacciones': endpoint = 'catalogos/refacciones/guardarRefaccion'; payload.idRefaccion = id; payload.tipoEquipo = { idTipoEquipo: Number(this.formEditar.value.idTipoEquipo) }; break;
  //     }
  //   }

  //   this.crudService.post(endpoint, payload).subscribe({
  //     next: () => {
  //       this.manejarExito(esNuevo);
  //     },
  //     error: (err) => {
  //       // Falso error de Angular por recibir String en lugar de JSON
  //       if (err.status === 200) {
  //         this.manejarExito(esNuevo);
  //       } else {
  //         this.guardando = false; // Desbloqueamos el botón si falla de verdad
  //         alert('Ocurrió un error al intentar guardar el registro.');
  //         console.error('Error al guardar:', err);
  //       }
  //     }
  //   });
  // }

  // Método auxiliar para manejar la respuesta exitosa de guardarEdicion
  manejarExito(esNuevo: boolean): void {
    this.guardando = false;
    
    // Mensaje dinámico
    const mensaje = esNuevo ? '¡Registro agregado correctamente!' : '¡Registro modificado correctamente!';
    
    // Lanzamos la notificación de Angular Material en lugar del alert()
    this.snackBar.open(mensaje, 'Cerrar', { 
      duration: 3000, // Desaparece automáticamente después de 3 segundos
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    this.cerrarModalEditar();
    this.listarCatalogoActivo(); 
  }
  // manejarExito(esNuevo: boolean): void {
  //   this.guardando = false;
  //   alert(esNuevo ? '¡Registro agregado correctamente!' : '¡Registro modificado correctamente!');
  //   this.cerrarModalEditar();
  //   this.listarCatalogoActivo(); 
  // }

  // Modal para crear registros en los catálogos
  abrirModalCrear(): void {
    this.itemSeleccionadoId = 0; 
    this.formEditar.reset();
    this.marcasList = [];

    // NOS ASEGURAMOS QUE ESTÉN DESBLOQUEADOS PARA CREAR
    this.formEditar.get('idTipoEquipo')?.enable();
    this.formEditar.get('idMarca')?.enable();

    this.formEditar.get('idTipoEquipo')?.clearValidators();
    this.formEditar.get('idMarca')?.clearValidators();

    if (this.catalogoActivo !== 'equipos') {
      this.formEditar.get('idTipoEquipo')?.setValidators([Validators.required]);
    }
    if (this.catalogoActivo === 'modelos') {
      this.formEditar.get('idMarca')?.setValidators([Validators.required]);
    }
    this.formEditar.get('idTipoEquipo')?.updateValueAndValidity();
    this.formEditar.get('idMarca')?.updateValueAndValidity();

    this.mostrarModalEditar = true;
  }
  // Abrir modal para crear registros en los catálogos
  // abrirModalCrear(): void {
  //   this.itemSeleccionadoId = 0; // 0 indica que es un registro nuevo
  //   this.formEditar.reset();
  //   this.marcasList = [];

  //   // Ajustamos validaciones según el catálogo (misma lógica que al editar)
  //   this.formEditar.get('idTipoEquipo')?.clearValidators();
  //   this.formEditar.get('idMarca')?.clearValidators();

  //   if (this.catalogoActivo !== 'equipos') {
  //     this.formEditar.get('idTipoEquipo')?.setValidators([Validators.required]);
  //   }
  //   if (this.catalogoActivo === 'modelos') {
  //     this.formEditar.get('idMarca')?.setValidators([Validators.required]);
  //   }
  //   this.formEditar.get('idTipoEquipo')?.updateValueAndValidity();
  //   this.formEditar.get('idMarca')?.updateValueAndValidity();

  //   this.mostrarModalEditar = true;
  // }

  // --- FILTROS GLOBALES ---
  aplicarFiltros(): void {
    this.datosFiltrados = this.datosOriginales.filter(item => {
      // 1. Filtro de Estado
      let pasaEstado = true;
      if (this.filtroEstado === 'Activos') pasaEstado = item.estatus === 1;
      else if (this.filtroEstado === 'Inactivos') pasaEstado = item.estatus === 0;
      
      // 2. Filtro de Texto (Busca en descripción)
      let pasaTexto = true;
      if (this.terminoBusqueda) {
        const termino = this.terminoBusqueda.toLowerCase();
        pasaTexto = item.descripcion?.toLowerCase().includes(termino);
      }
      
      return pasaEstado && pasaTexto;
    });
  }
}