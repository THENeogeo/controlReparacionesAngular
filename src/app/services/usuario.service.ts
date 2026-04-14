import { inject, Injectable } from '@angular/core';
import { environment } from '../enviroments/enviroment';
import { Usuario } from '../models/usuario.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private http = inject(HttpClient);
  private apiUrl = '${environment.apiUrl}/usuarios';

  listarUsuarios() {
    return this.http.get<Usuario[]>('${this.apiUrl}/listarUsuarios');
  }
}
