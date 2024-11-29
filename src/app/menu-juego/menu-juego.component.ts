import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-juego',
  standalone: true,
  imports: [],
  templateUrl: './menu-juego.component.html',
  styleUrl: './menu-juego.component.css'
})
export class MenuJuegoComponent {
  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
