import { NgModule } from '@angular/core'; 
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'homeprofesor',
    loadComponent: () => import('./pages/home-profesor/home-profesor.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'loginprofesor',
    pathMatch: 'full',
  },
  {
    path: 'loginprofesor',
    loadComponent: () => import('./pages/login-profesor/login-profesor.page').then( m => m.LoginPage)
  },
  {
    path: 'menus',
    loadComponent: () => import('./pages/menus/menus.page').then( m => m.MenusPage)
  },
  {
    path: 'loginlumno',
    loadComponent: () => import('./pages/login-alumno/login-alumno.page').then( m => m.LoginAlumnoPage)
  },
  {
    path: 'paginainicial',
    loadComponent: () => import('./pages/pagina-inicial/pagina-inicial.page').then( m => m.PaginaInicialPage)
  },
  {
    path: 'tareasdiarioalumno',
    loadComponent: () => import('./pages/tareas-diario-alumno/tareas-diario-alumno.page').then( m => m.TareasDiarioAlumnoPage)
  },
  {
    path: 'registrosemanal',
    loadComponent: () => import('./pages/registro-semanal/registro-semanal.page').then( m => m.RegistroSemanalPage)
  },
  {
    path: 'tareasporpasos',
    loadComponent: () => import('./pages/tareas-por-pasos/tareas-por-pasos.page').then( m => m.TareasPorPasosPage)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }