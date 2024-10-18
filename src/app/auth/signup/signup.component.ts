import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientService } from 'src/app/common/services/http-client.service';
import { apiEndPoints } from 'src/app/common/utils/api-endpoint.constant';
import { Router } from '@angular/router';
import { appConstants } from 'src/app/common/utils/app.constant';
import { AcceptanceComponent } from 'src/app/shared/acceptance/acceptance.component';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  public signupFormGroup: FormGroup;
  public submitted = false;
  public signupObj: any = {};
  public errors;
  public isPasswordToogled: boolean;
  public hidePassword = true;
  constructor(
    private formBuilder: FormBuilder, public dialog: MatDialog, private httpClientService: HttpClientService,
    private router: Router, public commonfunctionService: CommonfunctionService) { }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.signupFormGroup = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(appConstants.formPatterns.alphabets)]],
      lastName: ['', [Validators.maxLength(50), Validators.pattern(appConstants.formPatterns.alphabets)]],
      mobile: ['', [Validators.required, Validators.maxLength(50)]],
      teamName: ['', [Validators.required, Validators.maxLength(50)]],
      acceptance: [false, [Validators.requiredTrue]],
      password: ['', [Validators.required, Validators.pattern(appConstants.formPatterns.password), Validators.maxLength(16)]],
      email: ['', [Validators.required, Validators.pattern(appConstants.formPatterns.email), Validators.maxLength(50)]],
    });
  }
  get signUpForm() {
    return this.signupFormGroup.controls;
  }
  // Function for open the popup for acceptance
  openRegulationPopup(): void {
    const dialogRef = this.dialog.open(AcceptanceComponent);
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  // Function for submit the Signup Form
  onSubmit(form: any): void {
    this.submitted = true;
    this.errors = '';
    if (form.valid) {
      this.httpClientService.postData(apiEndPoints.register, this.signupObj).subscribe((response: any) => {
        if (response.status === 201) {
          this.router.navigate([appConstants.route.emailConfirm]);
        } else {
          this.errors = response.message;
        }
      }, (err) => {
        this.errors = err;
      });
    }
  }
}
