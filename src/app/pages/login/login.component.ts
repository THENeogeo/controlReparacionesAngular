import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Signals para manejar el estado del formulario
  username = signal('');
  password = signal('');
  loading = signal(false);

  handleLogin() {
    if (!this.username() || !this.password()) {
      this.snackBar.open('Por favor, llena todos los campos', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading.set(true);
    
    this.authService.login({
      username: this.username(),
      password: this.password()
    }).subscribe({
      next: (res) => {
        this.snackBar.open('¡Bienvenido al sistema!', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/usuarios']); // O a la ruta que prefieras
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open('Credenciales incorrectas o servidor caído', 'Cerrar', { duration: 3000 });
      }
    });
  }
}