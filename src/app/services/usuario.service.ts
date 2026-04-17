import { inject, Injectable } from '@angular/core';
import { environment } from '../enviroments/enviroment';
import { Usuario } from '../models/usuario.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private http = inject(HttpClient);

  listarUsuarios() {
    return this.http.get<Usuario[]>(environment.baseUrl + '/usuarios/listarUsuarios');
  }

  guardarUsuario(usuario: any) {
    return this.http.post(environment.baseUrl + '/usuarios/guardarUsuario', usuario);
  }
  
}
