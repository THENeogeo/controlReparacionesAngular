import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

export const routes: Routes = [
  // RUTAS PÚBLICAS (No usan el cascarón de admin, ocupan toda la pantalla)
  { path: 'login', component: LoginComponent },
  
  // RUTAS PROTEGIDAS (Van envueltas en el Layout Admin)
  { 
    path: '', 
    component: AdminComponent, // <-- Este componente dibujará el menú
    children: [
      // Todo lo que pongamos aquí aparecerá DENTRO del AdminComponent
      { path: 'usuarios', component: UsuariosComponent },
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
    ]
  },
  
  // COMODÍN
  { path: '**', redirectTo: 'login' }
];