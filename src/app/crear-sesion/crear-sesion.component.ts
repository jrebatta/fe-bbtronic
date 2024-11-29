import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-sesion',
  templateUrl: './crear-sesion.component.html',
  styleUrls: ['./crear-sesion.component.css']
})
export class CrearSesionComponent {
  username: string = '';  // Usamos ngModel para vincular el campo
  errorMessage: string = '';
  sessionInfoVisible: boolean = false;
  sessionToken: string = '';
  createdUsername: string = '';
  sessionCode: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  crearSesion() {
    if (this.username.trim()) {
      // Si el nombre de usuario es válido, procede con la solicitud al backend
      this.http
        .post('https://be-bbtronic.onrender.com/api/game-sessions/create', { username: this.username })
        .subscribe(
          (response: any) => {
            // Guarda los datos en localStorage
            localStorage.setItem('sessionToken', response.sessionToken);
            localStorage.setItem('username', response.username);

            // Muestra la información de la sesión
            this.sessionToken = response.sessionToken;
            this.createdUsername = response.username;
            this.sessionCode = response.sessionCode;
            this.sessionInfoVisible = true;

            // Redirige a la página de sesión
            this.router.navigate(['/sesion-menu'], {
              queryParams: {
                sessionCode: response.sessionCode,
                username: response.username
              }
            });
          },
          (error) => {
            // Muestra el mensaje de error
            this.errorMessage = error.error?.message || 'Error al crear la sesión.';
          }
        );
    } else {
      this.errorMessage = 'Por favor, ingresa un nombre de usuario.';
    }
  }
}