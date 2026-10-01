import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient
  ) {}

  // GET
  get(endpoint: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/${endpoint}`
    );
  }

  // POST
  post(endpoint: string, data: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/${endpoint}`,
      data
    );
  }

  // PUT
  put(endpoint: string, data: any): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/${endpoint}`,
      data
    );
  }

  // DELETE
  delete(endpoint: string): Observable<any> {
    return this.http.delete<any>(
      `${this.baseUrl}/${endpoint}`
    );
  }
}