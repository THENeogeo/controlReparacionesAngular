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
  private dialog = inject(MatDialog); // <-- Se reemplazó NgbModal por MatDialog
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  @ViewChild('agregarUsuarioModal') agregarUsuarioModal!: TemplateRef<any>;
  @ViewChild('editarUsuarioModal') editarUsuarioModal!: TemplateRef<any>;
  @ViewChild('estatusModal') estatusModal!: TemplateRef<any>;
  @ViewChild('rolesModal') rolesModal!: TemplateRef<any>;
  @ViewChild('passwordModal') passwordModal!: TemplateRef<any>;

  idUsuarioSeleccionado!: number; // Para almacenar el ID del usuario seleccionado en acciones como cambiar estatus o editar
  estadoSeleccionado!: number; // Para almacenar el nuevo estado seleccionado (activo/inactivo) en el modal de estatus
  rolesUsuario: string[] = []; // Para almacenar los roles asignados a un usuario específico
  rolesUsuarioIds: number[] = []; // Para almacenar los IDs de los roles asignados a un usuario específico, útil para comparaciones y lógica de asignación/desasignación
  rolesDisponibles: any[] = []; // Para almacenar la lista completa de roles disponibles en el sistema, que se cargará al abrir el modal de roles

  private modalActualRef?: MatDialogRef<any>; // Guardamos la referencia del modal abierto para poder cerrarlo manualmente

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
    // Formulario para agregar un usuario nuevo
    this.formAgregar = this.fb.group({
      nombre: ['', Validators.required, Validators.maxLength(10)],
      ap_paterno: ['', Validators.required, Validators.maxLength(10)],
      ap_materno: ['', Validators.required, Validators.maxLength(10)],
      usuario: ['', Validators.required, Validators.maxLength(10)],
      password: ['', [Validators.required, Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}')]]
    });

    // Formulario para editar un usuario existente
    this.formEditar = this.fb.group({
      idUsuario: [''],
      nombre_edita: ['', Validators.required],
      ap_paterno_edita: ['', Validators.required],
      ap_materno_edita: ['', Validators.required],
      usuario_edita: ['', Validators.required]
    });

    // Formulario para cambiar contraseña
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

  // Lógica de busqueda en la tabla. Esto se activa cada vez que el usuario escribe algo en el campo de búsqueda.
  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // Esto hace que la tabla de Angular Material busque en todos los campos (nombre, usuario, etc.)
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Manejo de modales usando Angular Material Dialog. Cada función abre un modal diferente dependiendo de la acción (agregar, editar, cambiar estatus, etc.)
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

  openModalEstatus(user: any) {
    this.idUsuarioSeleccionado = user.id;
    this.estadoSeleccionado = user.activo === 1 ? 0 : 1; // Si el usuario está activo, el nuevo estado será inactivo (0), y viceversa
    this.modalActualRef = this.dialog.open(this.estatusModal, {
      width: '400px',
      disableClose: true
    });
  }

  cerrarModal() {
    if (this.modalActualRef) {
      this.modalActualRef.close();
    }
  }

  // Lógica de formulario para guardar un nuevo usuario. Primero validamos que el formulario esté completo y correcto, luego enviamos los datos al backend usando el servicio UsuarioService. Si la respuesta es exitosa, mostramos un mensaje de éxito, cerramos el modal y recargamos la lista de usuarios. Si hay un error, mostramos un mensaje de error.

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
  
  // Logica para cambiar el estatus de un usuario (activo/inactivo). En este caso, simplemente enviamos el nuevo estado al backend usando el servicio UsuarioService. Si la respuesta es exitosa, mostramos un mensaje de éxito, cerramos el modal y recargamos la lista de usuarios. Si hay un error, mostramos un mensaje de error.

  cambiarEstatus(): void {
    this.usuarioService.cambiarEstatus(this.idUsuarioSeleccionado, this.estadoSeleccionado).subscribe({
      next: () => {
        this.snackBar.open('Estatus actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.cerrarModal();
        this.cargarUsuarios();
      }
    })
  }

  // Lógica de roles y asignación de roles a usuarios. Esto se activa cuando el usuario hace clic en el botón de roles en la tabla. Primero cargamos la lista completa de roles disponibles en el sistema, luego cargamos los roles asignados al usuario seleccionado. En el modal, mostramos ambos listados para que el usuario pueda asignar o eliminar roles. Cuando se asigna o elimina un rol, enviamos la información al backend usando el servicio UsuarioService y actualizamos la lista de roles del usuario.
  
  openRoles(user: any): void {
    this.idUsuarioSeleccionado = user.id;
    
    // Traemos los datos de la base de datos
    this.refrescarListasRoles();

    // Abrimos la ventana flotante una sola vez
    this.modalActualRef = this.dialog.open(this.rolesModal, { width: '600px', disableClose: true });
  }

  // Solo recarga la información, sin abrir ventanas
  refrescarListasRoles(): void {
    this.rolesUsuarioIds = [];
    
    // Se obtienen los roles del usuario
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

    // Se obtiene el catálogo de roles
    this.usuarioService.listarRoles().subscribe({
      next: (res) => { this.rolesDisponibles = res.data; },
      error: (err) => { console.error("Error al listar catálogo de roles:", err); }
    });
  }

  asignarRol(idRol: number): void {
    this.usuarioService.asignarRol(this.idUsuarioSeleccionado, idRol).subscribe({
      next: () => {
        this.snackBar.open('Rol asignado correctamente', 'Cerrar', { duration: 2000 });
        // En lugar de re-abrir el modal, solo refrescamos la lista silenciosamente
        this.refrescarListasRoles(); 
      },
      error: () => this.snackBar.open('Error al asignar rol', 'Cerrar', { duration: 3000 })
    });
  }

  desactivarRol(idRol: number): void {
    this.usuarioService.eliminarRol(this.idUsuarioSeleccionado, idRol).subscribe({
      next: () => {
        this.snackBar.open('Rol removido correctamente', 'Cerrar', { duration: 2000 });
        // Igual aquí, solo refrescamos la lista
        this.refrescarListasRoles(); 
      },
      error: () => this.snackBar.open('Error al remover rol', 'Cerrar', { duration: 3000 })
    });
  }

  tieneRol(idRol: number): boolean {
    return this.rolesUsuarioIds.includes(idRol);
  }

  // Lógica para cambiar contraseña de un usuario. Esto se activa cuando el usuario hace clic en el botón de cambiar contraseña en la tabla. En el modal, el usuario ingresa la nueva contraseña y se valida que cumpla con los requisitos de seguridad. Luego, enviamos la nueva contraseña al backend usando el servicio UsuarioService. Si la respuesta es exitosa, mostramos un mensaje de éxito, cerramos el modal y recargamos la lista de usuarios. Si hay un error, mostramos un mensaje de error.

  openModalPassword(user: any): void {
    this.idUsuarioSeleccionado = user.id;
    this.formContrasena.reset();
    this.modalActualRef = this.dialog.open(this.passwordModal, { width: '500px', disableClose: true });
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
        this.cerrarModal();
      },
      error: () => this.snackBar.open('Error al cambiar contraseña', 'Cerrar', { duration: 4000 })
    });
  }
  
}