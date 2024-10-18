import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { NgxYoutubePlayerModule } from 'ngx-youtube-player';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { MaterialModule } from '../shared/material.module';
import { EmailconfirmComponent } from './emailconfirm/emailconfirm.component';
import { AuthComponent } from './auth.component';

@NgModule({
  // tslint:disable-next-line: max-line-length
  declarations: [LoginComponent, SignupComponent, ForgotPasswordComponent, ResetPasswordComponent, EmailconfirmComponent, AuthComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    NgbModule,
    NgxYoutubePlayerModule.forRoot(),
    ScrollToModule.forRoot(),
    ReactiveFormsModule,
    MaterialModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AuthModule { }
