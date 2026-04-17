import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // <-- El ingrediente clave para los Layouts
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

  // Por ahora el componente está limpio.
  // Más adelante, aquí agregaremos la lógica para:
  // 1. Ocultar/Mostrar el menú lateral en pantallas pequeñas.
  // 2. La función de Cerrar Sesión (borrar el token y redirigir al login).
  
}