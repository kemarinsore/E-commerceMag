import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',  
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./page/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./page/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./page/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'add',
    loadChildren: () => import('./page/add/add.module').then( m => m.AddPageModule)
  },
  {
    path: 'detail/:id',
    loadChildren: () => import('./page/detail/detail.module').then( m => m.DetailPageModule)
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('./page/edit/edit.module').then( m => m.EditPageModule)
  },
  {
    path: 'profil',
    loadChildren: () => import('./page/profil/profil.module').then( m => m.ProfilPageModule)
  },
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
