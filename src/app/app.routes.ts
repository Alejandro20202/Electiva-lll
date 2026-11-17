import { Routes } from '@angular/router';
import { AppShell } from './layout/app-shell/app-shell';

export const routes: Routes = [
  {
    path: '',
    component: AppShell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((page) => page.Dashboard),
      },
      {
        path: 'materias',
        title: 'Materias',
        loadComponent: () =>
          import('./pages/materias/materias').then((page) => page.Materias),
      },
      {
        path: 'tareas',
        title: 'Tareas',
        loadComponent: () =>
          import('./pages/tareas/tareas').then((page) => page.Tareas),
      },
      {
        path: 'calendario',
        title: 'Calendario',
        loadComponent: () =>
          import('./pages/calendario/calendario').then((page) => page.Calendario),
      },
      {
        path: 'estadisticas',
        title: 'Estadísticas',
        loadComponent: () =>
          import('./pages/estadisticas/estadisticas').then((page) => page.Estadisticas),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
