import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { apiEndPoints } from '@app/common/utils/api-endpoint.constant';
import { appConstants } from '@app/common/utils/app.constant';

import { HttpClientService } from '@app/common/services/http-client.service';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  formGroup: FormGroup;
  isPasswordToogled: boolean;
  hidePassword = true;
  errorMessage: string;
  toasterOptions = { positionClass: 'toast-top-center', timeOut: 7000 };

  constructor(
    private formBuilder: FormBuilder, private httpClientService: HttpClientService,
    private router: Router, public commonfunctionService: CommonfunctionService,
    private activatedRoute: ActivatedRoute, private toastrService: ToastrService) { }

  ngOnInit() {
    this.initializeForm();
    if (localStorage.getItem('abb8_rememberMe') === 'true') {
      this.formGroup.patchValue({
        email: localStorage.getItem('abb8_email') ? atob(localStorage.getItem('abb8_email')) : '',
        password: localStorage.getItem('abb8_password') ? atob(localStorage.getItem('abb8_password')) : '',
        rememberMe: true
      });
    }
    this.activatedRoute.queryParamMap.subscribe(paramMap => {
      if (paramMap.get('act') === 'true' && paramMap.get('id')) {
        const emailId = atob(paramMap.get('id'));
        this.activateUser(emailId);
      }
    });
  }

  private initializeForm() {
    this.formGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(appConstants.formPatterns.email)]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  private activateUser(emailId: string) {
    const req = {
      email: emailId,
      status: 'A'
    };
    this.httpClientService.putData(apiEndPoints.updateUser, req).subscribe((data: any) => {
      this.toastrService.success(appConstants.toaster.activateUserSuccess, '', this.toasterOptions);
    }, ((error: any) => {
      this.toastrService.error(appConstants.toaster.activateUserError, '', this.toasterOptions);
    }));
  }

  login() {
    const payload = {
      email: this.formGroup.value.email.toLowerCase(),
      password: this.formGroup.value.password
    };
    this.httpClientService.postData(apiEndPoints.login, payload).subscribe((data: any) => {
      if (data && data.users[0]) {
        localStorage.setItem('abb8_email', btoa(data.users[0].email));
        const profileObj: any = {
          fname: btoa(data.users[0].fname),
          lname: btoa(data.users[0].lname),
          email: btoa(data.users[0].email)
        };
        localStorage.setItem('abb8_profile', JSON.stringify(profileObj));
        localStorage.setItem('abb8_token', data.token);
        if (this.formGroup.value.rememberMe) {
          localStorage.setItem('abb8_rememberMe', 'true');
          localStorage.setItem('abb8_password', btoa(this.formGroup.value.password));
        } else {
          localStorage.removeItem('abb8_rememberMe');
          localStorage.removeItem('abb8_password');
        }
        this.httpClientService.socket.emit('create notification', 'From Login');
        this.router.navigate([appConstants.route.dashboard]);
      } else {
        console.log('here')
        this.commonfunctionService.isLoading.next(false);
        this.errorMessage = 'Email or Password is incorrect';
      }
    }, ((error: any) => {
      this.commonfunctionService.isLoading.next(false);
      this.errorMessage = 'Email or Password is incorrect';
    }));
  }

  resetErrorMessage() {
    this.errorMessage = '';
  }

}
