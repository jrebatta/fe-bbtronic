import { Routes } from '@angular/router';
import { MenuJuegoComponent } from './menu-juego/menu-juego.component';
import { CrearSesionComponent } from './crear-sesion/crear-sesion.component';
import { MostrarPreguntasComponent } from './mostrar-preguntas/mostrar-preguntas.component';
import { PreguntasIncomodasComponent } from './preguntas-incomodas/preguntas-incomodas.component';
import { SesionMenuComponent } from './sesion-menu/sesion-menu.component';
import { UnirseSesionComponent } from './unirse-sesion/unirse-sesion.component';

export const routes: Routes = [
    { path: '', redirectTo: 'menu-juego', pathMatch: 'full' },
    { path: 'menu-juego', component: MenuJuegoComponent },
    { path: 'crear-sesion', component: CrearSesionComponent },
    { path: 'mostrar-preguntas', component: MostrarPreguntasComponent },
    { path: 'preguntas-incomodas', component: PreguntasIncomodasComponent },
    { path: 'sesion-menu', component: SesionMenuComponent },
    { path: 'unirse-sesion', component: UnirseSesionComponent },
  ];