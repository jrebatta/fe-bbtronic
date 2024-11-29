import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamesessionserviceService {
  private apiUrl = 'http://localhost:8080/api/game-sessions'; // Cambia esto por tu URL base

  constructor(private http: HttpClient) {}

  createGameSession(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, null, {
      params: { username },
    });
  }

  getGameSession(sessionCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${sessionCode}`);
  }

  joinGameSession(data: { sessionCode: string; username: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/join`, data);
  }

  getUsersInSession(sessionCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${sessionCode}/users`);
  }

  sendQuestion(sessionCode: string, questionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionCode}/send-question`, questionData);
  }

  startGame(sessionCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionCode}/start-game`, null);
  }

  checkAllReady(sessionCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${sessionCode}/check-all-ready`);
  }

  nextRandomQuestion(sessionCode: string, lastToUser: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionCode}/next-random-question`, {
      lastToUser,
    });
  }

  getCurrentQuestion(sessionCode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${sessionCode}/current-question`);
  }

  resetGameData(sessionCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, { sessionCode });
  }
}
