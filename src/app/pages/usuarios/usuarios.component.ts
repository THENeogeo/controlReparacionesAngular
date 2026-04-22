import { Component, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})

export class UsuariosComponent implements OnInit {
  
  private usuarioService = inject(UsuarioService);
  private dialog = inject(MatDialog); // <-- Reemplazamos NgbModal por MatDialog
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  @ViewChild('agregarUsuarioModal') agregarUsuarioModal!: TemplateRef<any>;
  @ViewChild('editarUsuarioModal') editarUsuarioModal!: TemplateRef<any>;

  // Guardamos la referencia del modal abierto para poder cerrarlo manualmente
  private modalActualRef?: MatDialogRef<any>; 

  dataSource = new MatTableDataSource<Usuario>([]);
  columnas = ['nombre', 'ap_paterno', 'ap_materno', 'username', 'estado', 'roles', 'password'];

  formAgregar!: FormGroup;
  formEditar!: FormGroup;

  ngOnInit() {
    this.inicializarFormularios();
    this.cargarUsuarios();
  }

  inicializarFormularios() {
    // Formulario 1: Solo para Agregar
    this.formAgregar = this.fb.group({
      nombre: ['', Validators.required],
      ap_paterno: ['', Validators.required],
      ap_materno: ['', Validators.required],
      usuario: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}')]]
    });

    // Formulario 2: Solo para Editar
    this.formEditar = this.fb.group({
      idUsuario: [''],
      nombre_edita: ['', Validators.required],
      ap_paterno_edita: ['', Validators.required],
      ap_materno_edita: ['', Validators.required],
      usuario_edita: ['', Validators.required]
    });
  }

  cargarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => this.dataSource.data = data,
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  // --- LÓGICA DE BÚSQUEDA ---
  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // Esto hace que la tabla de Angular Material busque en todos los campos (nombre, usuario, etc.)
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // --- MANEJO DE MODALES ---

  openAgregarUsuarioModal() {
    this.formAgregar.reset();
    // Abrimos el template usando Material Dialog
    this.modalActualRef = this.dialog.open(this.agregarUsuarioModal, {
      width: '800px', // Equivalente al 'lg' de bootstrap
      disableClose: true // Backdrop static
    });
  }

  openEditarUsuarioModal(usuarioSeleccionado: any) {
    this.formEditar.patchValue({
      idUsuario: usuarioSeleccionado.id,
      nombre_edita: usuarioSeleccionado.nombre,
      ap_paterno_edita: usuarioSeleccionado.ap_paterno,
      ap_materno_edita: usuarioSeleccionado.ap_materno,
      usuario_edita: usuarioSeleccionado.username
    });
    this.modalActualRef = this.dialog.open(this.editarUsuarioModal, {
      width: '800px',
      disableClose: true
    });
  }

  cerrarModal() {
    if (this.modalActualRef) {
      this.modalActualRef.close();
    }
  }

  // --- LOGICA DEL FORMULARIO ---

  guardarUsuario() {
    if (this.formAgregar.invalid) {
      this.snackBar.open('Verifique los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    const nuevoUsuario = {
      nombre: this.formAgregar.value.nombre,
      ap_paterno: this.formAgregar.value.ap_paterno,
      ap_materno: this.formAgregar.value.ap_materno,
      username: this.formAgregar.value.usuario, 
      password: this.formAgregar.value.password,
      activo: 1,
      trabajador_id: 0
    };

    this.usuarioService.guardarUsuario(nuevoUsuario).subscribe({
      next: (res: any) => {
        if (res.error === 1) {
          this.snackBar.open(`Error: ${res.messages[0]}`, 'Cerrar', { duration: 4000 });
        } else {
          this.snackBar.open('Usuario Guardado Exitosamente', 'Cerrar', { duration: 3000 });
          this.cerrarModal(); // <-- Cerramos usando nuestra función
          this.cargarUsuarios();
        }
      },
      error: (err: any) => {
        const mensaje = err.error?.messages ? err.error.messages[0] : 'Error en el servidor';
        this.snackBar.open(`Error: ${mensaje}`, 'Cerrar', { duration: 4000 });
      }
    });
  }

  editarUsuario() {
    console.log('Editando:', this.formEditar.value.idUsuario);
    this.cerrarModal();
  }
}