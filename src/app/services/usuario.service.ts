import { inject, Injectable } from '@angular/core'; // Injectable: le dice a Angular que esta clase puede ser inyectada como servicio en otros componentes. inject: es una forma moderna de inyectar dependencias sin usar constructor.
import { environment } from '../enviroments/enviroment'; //Se define la URL del backend sin escribirla en todos lados.
import { Usuario } from '../models/usuario.model';
import { HttpClient } from '@angular/common/http'; // Servicio de Angular para hacer peticiones HTTP (GET, POST, PUT, DELETE). Es el puente entre tu Angular y Spring Boot.

@Injectable({ providedIn: 'root' }) // Esto hace que el servicio esté disponible en toda la aplicación sin necesidad de agregarlo a providers en cada módulo.

export class UsuarioService {

  private http = inject(HttpClient);

  listarUsuarios() {
    return this.http.get<Usuario[]>(environment.baseUrl + '/usuarios/listarUsuarios');
  }

  guardarUsuario(usuario: any) {
    return this.http.post(environment.baseUrl + '/usuarios/guardarUsuario', usuario);
  }

  buscarUsuarioPorExpediente(expediente: number) {
    return this.http.get<any>(`${environment.baseUrl}/trabajadorPlantillaExpediente/${expediente}`);
  }
  
}
