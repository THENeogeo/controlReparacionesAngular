import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-registrar-reparacion',
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './registrar-reparacion.component.html',
  styleUrl: './registrar-reparacion.component.scss'
})
export class RegistrarReparacionComponent implements OnInit {

  formReparacion!: FormGroup;
  
  // Catálogos
  tiposEquipo: any[] = [];
  marcas: any[] = [];
  modelos: any[] = [];
  refacciones: any[] = [];
  tiposRefacciones: any[] = [];
  areas: any[] = [];

  buscandoTrabajador: boolean = false;

  private fb = inject(FormBuilder);
  private crudService = inject(CrudService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCatalogosIniciales();
  }

  inicializarFormulario(): void {
    const hoy = new Date().toISOString().split('T')[0]; // Fecha actual YYYY-MM-DD

    this.formReparacion = this.fb.group({
      idTipoEquipo: ['', Validators.required],
      idMarca: [{ value: '', disabled: true }, Validators.required],
      idModelo: [{ value: '', disabled: true }, Validators.required],
      inventario: ['', Validators.required],
      refaccionInventario: [''], // Mapeado a "Nombre del equipo" del diseño
      idRefaccion: [''],
      idTipoRefaccion: [''],
      descripcionReporte: ['', Validators.required],
      idArea: ['', Validators.required],
      areaDescripcion: [''],
      expediente: [''],
      nombreUsuario: ['', Validators.required],
      fechaRegistro: [hoy, Validators.required]
    });
  }

  cargarCatalogosIniciales(): void {
    // 1. Tipos de equipo (Catálogo independiente)
    this.crudService.get('catalogos/equipos/listarTodosLosTiposDeEquipo').subscribe(res => this.tiposEquipo = res || []);
    // 2. Tipos de refacción (Catálogo independiente)
    this.crudService.get('catalogos/refacciones/listarTipoRefaccion').subscribe(res => this.tiposRefacciones = res || []);
    // 3. Áreas (Catálogo independiente)
    this.crudService.get('catalogos/areas/listarAreas').subscribe(res => this.areas = res || []);

    // Aquí puedes cargar los demás catálogos base (Áreas, Refacciones, etc.) según tus endpoints
  }

  // --- LÓGICA DE CASCADA ---

  onTipoEquipoChange(): void {
    const idTipoEquipo = this.formReparacion.get('idTipoEquipo')?.value;
    
    // Reseteamos y bloqueamos los siguientes niveles
    this.formReparacion.patchValue({ idMarca: '', idModelo: '' });
    this.formReparacion.get('idMarca')?.disable();
    this.formReparacion.get('idModelo')?.disable();

    // Vaciamos los catálogos dependientes
    this.marcas = [];
    this.modelos = [];
    this.refacciones = [];

    if (idTipoEquipo) {
      this.crudService.get(`catalogos/marcas/listarMarcasPorTipoEquipo/${idTipoEquipo}`).subscribe(res => {
        this.marcas = res || [];
        this.formReparacion.get('idMarca')?.enable(); // Desbloqueamos Marca
      });

      // Cargamos Refacciones dependientes del Tipo de Equipo
      this.crudService.get(`catalogos/refacciones/listarRefaccionesPorTipoEquipo/${idTipoEquipo}`).subscribe(res => {
        this.refacciones = res || [];
        this.formReparacion.get('idRefaccion')?.enable(); 
      });

    }
  }

  onMarcaChange(): void {
    const idMarca = this.formReparacion.get('idMarca')?.value;
    
    // Reseteamos y bloqueamos el siguiente nivel
    this.formReparacion.patchValue({ idModelo: '' });
    this.formReparacion.get('idModelo')?.disable();
    this.modelos = [];

    if (idMarca) {
      this.crudService.get(`catalogos/modelos/listarModelosPorMarca/${idMarca}`).subscribe(res => {
        this.modelos = res || [];
        this.formReparacion.get('idModelo')?.enable(); // Desbloqueamos Modelo
      });
    }
  }

  // --- BUSCAR TRABAJADOR POR EXPEDIENTE Y ÁREA ---
  buscarPorExpediente(): void {
    // Si ya está buscando, ignoramos los clics adicionales
    if (this.buscandoTrabajador) return;

    const expediente = this.formReparacion.get('expediente')?.value;
    if (!expediente) return; 

    // ACTIVAMOS EL CANDADO
    this.buscandoTrabajador = true;
    this.snackBar.open('Buscando expediente...', '', { duration: 1500 });

    // Hacemos una única petición al servicio del trabajador 
    this.crudService.get(`catalogos/buscarTrabajador/${expediente}`).subscribe({
      next: (dataPersonal: any) => {
        if (dataPersonal && dataPersonal.nombreDTO) {
          
          // Armamos el nombre y lo pintamos visualmente 
          const nombreCompleto = `${dataPersonal.nombreDTO} ${dataPersonal.paternoDTO || ''} ${dataPersonal.maternoDTO || ''}`.trim();
          this.formReparacion.patchValue({ nombreUsuario: nombreCompleto });

          // Extraemos el texto del área externa 
          const nombreAreaExterna = dataPersonal.areaDTO;

          if (nombreAreaExterna) {
            // Buscamos si esa área ya existe en nuestro catálogo local
            const areaLocal = this.areas.find(a => 
              a.descripcion?.trim().toLowerCase() === nombreAreaExterna.trim().toLowerCase()
            );

            if (areaLocal) {
              // --- CASO A: EL ÁREA YA EXISTE LOCALMENTE ---
              this.formReparacion.patchValue({ 
                idArea: areaLocal.idArea,       
                areaDescripcion: areaLocal.descripcion 
              });
              this.snackBar.open('¡Expediente cargado y Área local asignada!', 'Cerrar', { duration: 3000 });
              
              // LIBERAMOS EL CANDADO
              this.buscandoTrabajador = false;
            
            } else {
              // --- CASO B: EL ÁREA NO EXISTE, HAY QUE CREARLA ---
              this.snackBar.open('Nueva área detectada. Registrando en catálogo...', '', { duration: 2500 });

              this.crudService.post('catalogos/areas/agregarArea', nombreAreaExterna).subscribe({
                next: () => this.recargarAreasYAsignar(nombreAreaExterna),
                error: (errArea) => {
                  if (errArea.status === 200) {
                    this.recargarAreasYAsignar(nombreAreaExterna);
                  } else {
                    console.error('Error al agregar nueva área:', errArea);
                    this.snackBar.open('Trabajador encontrado, pero falló el registro del área.', 'Cerrar', { duration: 3500 });
                    this.buscandoTrabajador = false; // LIBERAMOS EL CANDADO
                  }
                }
              });
            }
          } else {
            this.snackBar.open('Trabajador encontrado (No tiene área asignada)', 'Cerrar', { duration: 3000 });
            this.buscandoTrabajador = false; // LIBERAMOS EL CANDADO
          }
        } else {
            this.buscandoTrabajador = false; // LIBERAMOS EL CANDADO si el DTO viene raro
        }
      },
      error: (error) => {
        console.error('Error al obtener trabajador:', error);
        this.snackBar.open(`No se encontró el expediente ${expediente}`, 'Cerrar', { duration: 4000 });
        // Limpiamos todo si el expediente no existe
        this.formReparacion.patchValue({ nombreUsuario: '', idArea: '', areaDescripcion: '' });
        
        // LIBERAMOS EL CANDADO
        this.buscandoTrabajador = false;
      }
    });
  }

  // --- MÉTODO AUXILIAR PARA RECARGAR EL CATÁLOGO DESPUÉS DE INSERTAR ---
  recargarAreasYAsignar(nombreNuevaArea: string): void {
    // Volvemos a consultar todas las áreas para traer la recién creada junto con su nuevo ID
    this.crudService.get('catalogos/areas/listarAreas').subscribe({
      next: (resAreas: any[]) => {
        this.areas = resAreas || [];
        const areaRecienCreada = this.areas.find(a => a.descripcion?.trim().toLowerCase() === nombreNuevaArea.trim().toLowerCase());
        
        // Buscamos la que acabamos de insertar
        if (areaRecienCreada) {
          
          this.formReparacion.patchValue({ 
            idArea: areaRecienCreada.idArea, 
            areaDescripcion: areaRecienCreada.descripcion 
          });
          this.snackBar.open('¡Expediente cargado y nueva área guardada!', 'Cerrar', { duration: 3000 });
        }
        
        // LIBERAMOS EL CANDADO AL TERMINAR TODO EL PROCESO
        this.buscandoTrabajador = false;
      },
      error: () => {
         this.buscandoTrabajador = false; // LIBERAMOS EN CASO DE ERROR
      }
    });
  }

  // --- GUARDAR ---
  guardarReparacion(): void {
    if (this.formReparacion.invalid) {
      this.formReparacion.markAllAsTouched();
      return;
    }

    const form = this.formReparacion.value;

    // Transformamos los datos planos al formato anidado que exige el backend
    const payload = {
      idReparacion: 0,
      tipoEquipo: form.idTipoEquipo ? { idTipoEquipo: Number(form.idTipoEquipo) } : null,
      marca: form.idMarca ? { idMarca: Number(form.idMarca) } : null,
      modelo: form.idModelo ? { idModelo: Number(form.idModelo) } : null,
      inventario: form.inventario,
      refaccion: form.idRefaccion ? { idRefaccion: Number(form.idRefaccion) } : null,
      tipoRefaccion: form.idTipoRefaccion ? { idTipoRefaccion: Number(form.idTipoRefaccion) } : null,
      refaccionInventario: form.refaccionInventario,
      descripcionReporte: form.descripcionReporte,
      expediente: form.expediente,
      area: form.idArea ? { idArea: Number(form.idArea) } : null,
      fechaRegistro: form.fechaRegistro
    };

    console.log('Enviando JSON al backend:', payload);

    this.crudService.post('registro-reparacion/guardarRegistroReparacion', payload).subscribe({
      next: (res) => {
        console.log('Guardado exitoso', res);
        window.location.href = '/reparaciones'; // Redirigir al éxito
      },
      error: (err) => console.error('Error al guardar', err)
    });
  }

  // Validaciones
  validarInventario(event: Event): void {
  const input = event.target as HTMLInputElement;

  // Solo números y guion medio
  input.value = input.value.replace(/[^0-9-]/g, '');

  // Actualizar el valor del FormControl
  this.formReparacion.get('inventario')?.setValue(input.value, {
    emitEvent: false
  });
}

}
