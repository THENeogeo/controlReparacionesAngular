import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-catalogos-admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ToastModule, FormsModule],
  templateUrl: './catalogos-admin.component.html',
  styleUrl: './catalogos-admin.component.scss'
})
export class CatalogosAdminComponent implements OnInit {

  // Almacenará los registros que vienen de la base de datos
  tiposEquipo: any[] = [];
  
  // Término de búsqueda para la tabla (lo usaremos más adelante)
  terminoBusqueda: string = '';

  private crudService = inject(CrudService);

  ngOnInit(): void {
    this.listarTiposEquipo();
  }

  // Carga los tipos de equipo desde el backend
  listarTiposEquipo(): void {
    this.crudService.get('catalogos/equipos/listarTodosLosTiposDeEquipo').subscribe({
      next: (response: any) => {
        console.log('Tipos de equipo cargados:', response);
        this.tiposEquipo = response || [];
      },
      error: (error) => {
        console.error('Error al cargar tipos de equipo:', error);
      }
    });
  }
  
}
