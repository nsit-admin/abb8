import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';
import { HttpClientService } from '@app/common/services/http-client.service';
import { apiEndPoints } from '@app/common/utils/api-endpoint.constant';
import { appConstants } from '@app/common/utils/app.constant';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  public resetFormGroup: FormGroup;
  public submitted = false;
  public email;
  public errors;
  public token;
  public isTokenValid = false;
  public isSuccPwdChg = false;
  public infoMsg = '';
  public hidePassword = true;
  public globalPopupObj: any = {
    active: false,
    content: '',
    title: '',
    type: '',
  };
  constructor(
    private formBuilder: FormBuilder, private httpClientService: HttpClientService,
    private router: Router, private commonfunctionService: CommonfunctionService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.initializeForm();
    this.token = this.activatedRoute.snapshot.queryParams.id;
    if (this.token) {
      const payLoad = { token: this.token };
      this.httpClientService.postData(apiEndPoints.validateRstPwdToken, payLoad).subscribe((response: any) => {
        if (response.status === 200) {
          this.email = response.email;
          this.isTokenValid = true;
        } else {
          this.expiredLink();
        }
      }, (err) => {

        this.expiredLink();
      });
    } else {
      this.router.navigate([appConstants.route.login]);
    }
  }

  private initializeForm() {
    this.resetFormGroup = this.formBuilder.group({
      newPwd: ['', [Validators.required, Validators.pattern(appConstants.formPatterns.password), Validators.maxLength(16)]],
      confirmPwd: ['', [Validators.required]]
    }, {
      validator: this.commonfunctionService.confirmedValidator('newPwd', 'confirmPwd'),
    });
  }
  get resetForm() {
    return this.resetFormGroup.controls;
  }
  // Function for submit the Signup Form
  onSubmit(form: any) {
    this.submitted = true;
    this.errors = '';
    if (form.valid) {
      const payLoad = {
        password: this.resetFormGroup.get('newPwd').value,
        email: this.email,
        token: this.token,
      };
      this.httpClientService.postData(apiEndPoints.changePwdAuth, payLoad).subscribe((response: any) => {
        if (response.status === 200) {
          this.router.navigate([appConstants.route.emailConfirm], { queryParams: { id: appConstants.route.resetParam } });
        }
      }, (err) => {
        this.errors = appConstants.pwdUpdateFail;
      });
    }
  }
  // Function for shoe the expired info msg
  public expiredLink() {
    this.infoMsg = 'The link has expired. Please generate a new one.';
    this.isTokenValid = false;
    this.isSuccPwdChg = false;
  }
  // Function for shoe the expired info msg
  public successPwdChg() {
    this.infoMsg = 'Your password has been reset successfully';
    this.isTokenValid = false;
    this.isSuccPwdChg = true;
  }
  home() {
    this.router.navigate([appConstants.route.login]);
  }
}

