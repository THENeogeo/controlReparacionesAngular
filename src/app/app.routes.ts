import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [ //Aquí defines todas las rutas de tu app. Es un arreglo de objetos donde cada objeto es una ruta.
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirecciona la ruta raíz a 'login'
  { path: 'login', component: LoginComponent }, // RUTAS PÚBLICAS - No usan el cascarón de admin, ocupan toda la pantalla
  { path: '', component: AdminComponent, // Este componente dibujará el menú | RUTAS PROTEGIDAS - Van envueltas en el Layout Admin
    children: [
      // Todo lo que pongamos aquí aparecerá DENTRO del AdminComponent
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: UsuariosComponent }
    ]},
  { path: '**', redirectTo: 'login' } // Redireccionamiento para rutas no encontradas
];