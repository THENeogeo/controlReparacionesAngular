import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-registrar-reparacion',
  imports: [CommonModule, ReactiveFormsModule],
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

  private fb = inject(FormBuilder);
  private crudService = inject(CrudService);

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
      expediente: [''],
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
    // this.crudService.get('catalogos/areas/listarAreas').subscribe(res => this.areas = res || []);
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

  // --- GUARDAR ---

  guardarReparacion(): void {
    if (this.formReparacion.invalid) {
      this.formReparacion.markAllAsTouched();
      return;
    }

    const form = this.formReparacion.value;

    // EMPAQUETADO: Transformamos los datos planos al formato anidado que exige tu backend
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
