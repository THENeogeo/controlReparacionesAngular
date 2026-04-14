import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

export const routes: Routes = [

    // Ruta para el inicio de sesión
    { path: 'login', component: LoginComponent },
  
    // Ruta para la lista de usuarios (protegida por el Interceptor)
    { path: 'usuarios', component: UsuariosComponent },
    
    // Redirección por defecto: si la URL está vacía, ve a login
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
    // Ruta comodín: si escriben cualquier cosa mal, los manda al login
    { path: '**', redirectTo: 'login' }
];
