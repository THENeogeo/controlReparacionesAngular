import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
// import { ToastModule } from 'primeng/toast';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalogos-admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './catalogos-admin.component.html',
  styleUrl: './catalogos-admin.component.scss'
})
export class CatalogosAdminComponent {

}
