import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmailconfirmComponent } from './emailconfirm/emailconfirm.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignupComponent } from './signup/signup.component';
import { AuthComponent } from './auth.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        component: LoginComponent
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'forgot-pass',
        component: ForgotPasswordComponent
      },
      {
        path: 'reset-pass',
        component: ResetPasswordComponent
      },
      {
        path: 'signup',
        component: SignupComponent
      },
      {
        path: 'emailconfirm',
        component: EmailconfirmComponent
      }
    ],
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
