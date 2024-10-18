import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './common/services/auth-guard.service';

const routes: Routes = [
  {
    path: 'pages', loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
    canActivate: [AuthGuardService]
  },
  { path: '', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
