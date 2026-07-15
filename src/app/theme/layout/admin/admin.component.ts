import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router'; // <-- El ingrediente clave para los Layouts
import { MatButtonModule } from '@angular/material/button'; // Para el botón de "Cerrar Sesión"

@Component({
  selector: 'app-admin',
  standalone: true,
  // ¡Aquí registramos las herramientas que usa específicamente este cascarón!
  imports: [
    CommonModule, 
    RouterOutlet, 
    MatButtonModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss' 
})
export class AdminComponent {

  menuAdminAbierto: boolean = false; // Controla si el menú lateral está abierto o cerrado
  menuSolicitudesAbierto: boolean = false;
  menuReportesAbierto: boolean = false;

  // Por ahora el componente está limpio.
  // Más adelante, aquí agregaremos la lógica para:
  // 1. Ocultar/Mostrar el menú lateral en pantallas pequeñas.
  // 2. La función de Cerrar Sesión (borrar el token y redirigir al login).

  private router = inject(Router); // Inyectamos el RouterOutlet para futuras necesidades de navegación

  cerrarSesion() {
    // Aquí iría la lógica para cerrar sesión, como borrar el token de autenticación
    // y redirigir al usuario a la página de login.
    console.log('Cerrando sesión...'); // Placeholder para la acción real
    this.router.navigate(['/login']); // Redirige al login después de cerrar sesión
  }
  
}