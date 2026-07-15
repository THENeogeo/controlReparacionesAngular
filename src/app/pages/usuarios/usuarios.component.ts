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
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  @ViewChild('agregarUsuarioModal') agregarUsuarioModal!: TemplateRef<any>;
  @ViewChild('editarUsuarioModal') editarUsuarioModal!: TemplateRef<any>;
  @ViewChild('rolesModal') rolesModal!: TemplateRef<any>;
  @ViewChild('passwordModal') passwordModal!: TemplateRef<any>;

  idUsuarioSeleccionado!: number; 
  estadoSeleccionado!: number; 
  rolesUsuario: string[] = []; 
  rolesUsuarioIds: number[] = []; 
  rolesDisponibles: any[] = []; 

  // Variable para controlar manualmente el modal de estatus
  mostrarModalEstatus: boolean = false;
  mostrarModalRoles: boolean = false;
  mostrarModalPassword: boolean = false;
  mostrarModalAgregar: boolean = false;
  mostrarModalEditarUsuario: boolean = false;

  private modalActualRef?: MatDialogRef<any>;

  dataSource = new MatTableDataSource<Usuario>([]);
  columnas = ['nombre', 'ap_paterno', 'ap_materno', 'username', 'estado', 'roles', 'password'];

  formContrasena!: FormGroup;
  formAgregar!: FormGroup;
  formEditar!: FormGroup;

  ngOnInit() {
    this.inicializarFormularios();
    this.cargarUsuarios();
  }

  inicializarFormularios() {
    this.formAgregar = this.fb.group({
      nombre: ['', Validators.required, Validators.maxLength(10)],
      ap_paterno: ['', Validators.required, Validators.maxLength(10)],
      ap_materno: ['', Validators.required, Validators.maxLength(10)],
      usuario: ['', Validators.required, Validators.maxLength(10)],
      password: ['', [Validators.required, Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}')]]
    });

    this.formEditar = this.fb.group({
      idUsuario: [''],
      nombre_edita: ['', Validators.required],
      ap_paterno_edita: ['', Validators.required],
      ap_materno_edita: ['', Validators.required],
      usuario_edita: ['', Validators.required]
    });

    this.formContrasena= this.fb.group({
      password_update: ['', [Validators.required, Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}')]]
    });
  }

  cargarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => this.dataSource.data = data,
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openAgregarUsuarioModal() {
    this.formAgregar.reset();
    // this.modalActualRef = this.dialog.open(this.agregarUsuarioModal, { width: '800px', disableClose: true });
    this.mostrarModalAgregar = true; // Abre el modal por CSS
  }

  cerrarModalAgregar() {
    this.mostrarModalAgregar = false; // Cierra el modal manualmente
  }

  openEditarUsuarioModal(usuarioSeleccionado: any) {
    this.formEditar.patchValue({
      idUsuario: usuarioSeleccionado.id,
      nombre_edita: usuarioSeleccionado.nombre,
      ap_paterno_edita: usuarioSeleccionado.ap_paterno,
      ap_materno_edita: usuarioSeleccionado.ap_materno,
      usuario_edita: usuarioSeleccionado.username
    });
    // this.modalActualRef = this.dialog.open(this.editarUsuarioModal, { width: '800px', disableClose: true});
    this.mostrarModalEditarUsuario = true; // Abre el modal por CSS
  }

  cerrarModalEditarUsuario() {
    this.mostrarModalEditarUsuario = false;
  }

  // --- LÓGICA MANUAL PARA MODAL DE ESTATUS ---
  openModalEstatus(user: any) {
    this.idUsuarioSeleccionado = user.id;
    this.estadoSeleccionado = user.activo === 1 ? 0 : 1; 
    this.mostrarModalEstatus = true; // Abre el modal por CSS
  }

  cerrarModalEstatus() {
    this.mostrarModalEstatus = false; // Cierra el modal por CSS
  }
  // -------------------------------------------

  cerrarModal() {
    if (this.modalActualRef) {
      this.modalActualRef.close();
    }
  }

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
          this.cerrarModalAgregar(); 
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
    this.cerrarModalEditarUsuario();
  }
  
  cambiarEstatus(): void {
    this.usuarioService.cambiarEstatus(this.idUsuarioSeleccionado, this.estadoSeleccionado).subscribe({
      next: () => {
        this.snackBar.open('Estatus actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.cerrarModalEstatus(); // <-- Llamamos a la función manual
        this.cargarUsuarios();
      }
    })
  }
  
  openRoles(user: any): void {
    this.idUsuarioSeleccionado = user.id;
    this.refrescarListasRoles();
    // this.modalActualRef = this.dialog.open(this.rolesModal, { width: '600px', disableClose: true });
    this.mostrarModalRoles = true; // Abre el modal por CSS
  }

  cerrarModalRoles(): void {
    this.mostrarModalRoles = false;
  }

  refrescarListasRoles(): void {
    this.rolesUsuarioIds = [];
    
    this.usuarioService.buscarRolesUsuario(this.idUsuarioSeleccionado).subscribe({
      next: (res) => {
        console.log("Roles del usuario traídos de Java:", res);
        if (res.data && res.data.length > 0) {
          this.rolesUsuarioIds = res.data.map((rol: any) => rol.id );
        }
      },
      error: (err) => {
        console.error("Error al buscar roles del usuario:", err);
        this.snackBar.open('Error de conexión al buscar los roles', 'Cerrar', { duration: 4000 });
      }
    });

    this.usuarioService.listarRoles().subscribe({
      next: (res) => { this.rolesDisponibles = res.data; },
      error: (err) => { console.error("Error al listar catálogo de roles:", err); }
    });
  }

  asignarRol(idRol: number): void {
    this.usuarioService.asignarRol(this.idUsuarioSeleccionado, idRol).subscribe({
      next: () => {
        this.snackBar.open('Rol asignado correctamente', 'Cerrar', { duration: 2000 });
        this.refrescarListasRoles(); 
      },
      error: () => this.snackBar.open('Error al asignar rol', 'Cerrar', { duration: 3000 })
    });
  }

  desactivarRol(idRol: number): void {
    this.usuarioService.eliminarRol(this.idUsuarioSeleccionado, idRol).subscribe({
      next: () => {
        this.snackBar.open('Rol removido correctamente', 'Cerrar', { duration: 2000 });
        this.refrescarListasRoles(); 
      },
      error: () => this.snackBar.open('Error al remover rol', 'Cerrar', { duration: 3000 })
    });
  }

  tieneRol(idRol: number): boolean {
    return this.rolesUsuarioIds.includes(idRol);
  }

  openModalPassword(user: any): void {
    this.idUsuarioSeleccionado = user.id;
    this.formContrasena.reset();
    // this.modalActualRef = this.dialog.open(this.passwordModal, { width: '500px', disableClose: true });
    this.mostrarModalPassword = true; // Abre el modal por CSS
  }

  cerrarModalPassword(): void {
    this.mostrarModalPassword = false;
  }

  cambiarPassword(): void {
    if (this.formContrasena.invalid) {
      this.formContrasena.markAllAsTouched();
      return;
    }

    const newPassword = this.formContrasena.value.password_update;
    this.usuarioService.actualizarPassword(this.idUsuarioSeleccionado, newPassword).subscribe({
      next: () => {
        this.snackBar.open('Contraseña actualizada con éxito', 'Cerrar', { duration: 3000 });
        this.cerrarModalPassword();
      },
      error: () => this.snackBar.open('Error al cambiar contraseña', 'Cerrar', { duration: 4000 })
    });
  }

  buscarTrabajadorPorExpediente() {

  }
  
}