import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserserviceService {
  private apiUrl = 'http://localhost:8080/api/users'; // Cambia esto por tu URL base

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  registerUser(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/register`, {
      params: { username },
    });
  }

  getOnlineUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/online`);
  }

  logoutUser(sessionToken: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/logout`, {
      params: { sessionToken },
    });
  }

  setUserReady(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${username}/ready`, null);
  }
}
