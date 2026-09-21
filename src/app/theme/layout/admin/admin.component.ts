import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router'; // <-- El ingrediente clave para los Layouts
import { MatButtonModule } from '@angular/material/button'; // Para el botón de "Cerrar Sesión"

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    MatButtonModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss' 
})
export class AdminComponent implements OnInit {

  menuAdminAbierto: boolean = false; // Controla si el menú lateral está abierto o cerrado
  menuSolicitudesAbierto: boolean = false;
  menuReportesAbierto: boolean = false;

  // Por ahora el componente está limpio.
  // Más adelante, aquí agregaremos la lógica para:
  // 1. Ocultar/Mostrar el menú lateral en pantallas pequeñas.
  // 2. La función de Cerrar Sesión (borrar el token y redirigir al login).

  // Variables para el encabezado superior
  // Empezamos con un valor genérico por si tarda en cargar
  nombreUsuario: string = 'Usuario'; 
  menuPerfilAbierto: boolean = false;

  private router = inject(Router); // Inyectamos el RouterOutlet para futuras necesidades de navegación

  // Recuperamos el usuario al iniciar la pantalla
  ngOnInit(): void {
    const usuarioGuardado = localStorage.getItem('usuarioSistema');
    if (usuarioGuardado) {
      this.nombreUsuario = usuarioGuardado;
    }
  }

  cerrarSesion() {
    // Falta la lógica para cerrar sesión, borrar el token de autenticación
    console.log('Cerrando sesión...'); // Placeholder para la acción real
    // Limpiamos el LocalStorage al salir
    localStorage.removeItem('usuarioSistema');
    // Aquí también debemos remover tu token: localStorage.removeItem('token');

    this.menuPerfilAbierto = false;
    this.router.navigate(['/login']); // Redirige al login después de cerrar sesión
  }
  
}