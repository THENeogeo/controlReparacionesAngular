import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../enviroments/enviroment';
import { JwtRequest, JwtResponse } from '../models/auth.model';
import { tap } from 'rxjs/internal/operators/tap';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl;

  public currentUserToken = signal<string | null>(localStorage.getItem('token'));

  login(creds: JwtRequest) {
    return this.http.post<JwtResponse>(`${this.apiUrl}/generate-token`, creds).pipe(
      tap(response => {
        this.currentUserToken.set(response.token);
        localStorage.setItem('token', response.token);
      })
    );
  }

  logout() {
    this.currentUserToken.set(null);
    localStorage.removeItem('token');
  }
}
