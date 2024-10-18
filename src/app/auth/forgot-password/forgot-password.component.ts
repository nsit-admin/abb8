import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';
import { HttpClientService } from '@app/common/services/http-client.service';
import { apiEndPoints } from '@app/common/utils/api-endpoint.constant';
import { appConstants } from '@app/common/utils/app.constant';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  public resetFormGroup: FormGroup;
  public submitted = false;
  public email: any;
  public errors;
  constructor(
    private formBuilder: FormBuilder, private httpClientService: HttpClientService,
    private router: Router, public commonfunctionService: CommonfunctionService) { }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.resetFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(appConstants.formPatterns.email)]],
    });
  }
  get resetForm() {
    return this.resetFormGroup.controls;
  }
  // Function for submit the Signup Form
  onSubmit(form: any): void {
    this.submitted = true;
    this.errors = '';
    if (form.valid) {
      const url = `${apiEndPoints.forgot}${encodeURIComponent(this.email.toLowerCase())}`;
      this.httpClientService.getData(url).subscribe((response: any) => {
        if (response) {
          this.router.navigate([appConstants.route.emailConfirm], { queryParams: { id: appConstants.route.forgotParam } });
        }
      }, (err) => {
        this.errors = appConstants.inValidEmail;
      });
    }
  }
}
