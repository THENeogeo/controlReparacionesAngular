import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reparaciones-registradas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reparaciones-registradas.component.html',
  styleUrl: './reparaciones-registradas.component.scss'
})
export class ReparacionesRegistradasComponent {

  reparaciones = [
    {
      id: 1,
      equipo: 'Laptop Dell',
      cliente: 'Juan Pérez',
      inventario: '10/06/2026',
      estado: 'En proceso',
      tecnico: 'Geovani'
    },
    {
      id: 2,
      equipo: 'PC Gamer',
      cliente: 'María López',
      fecha: '11/06/2026',
      estado: 'Finalizada',
      tecnico: 'Geovani'
    }
  ];

}
