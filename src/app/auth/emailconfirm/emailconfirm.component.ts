import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { appConstants } from '@app/common/utils/app.constant';
@Component({
  selector: 'app-emailconfirm',
  templateUrl: './emailconfirm.component.html',
  styleUrls: ['./emailconfirm.component.css']
})
export class EmailconfirmComponent implements OnInit {
  public resetPwdSucc = false;
  public infoMsg = appConstants.registerConfirm;
  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.queryParams.id && (this.activatedRoute.snapshot.queryParams.id === appConstants.route.resetParam ||
      this.activatedRoute.snapshot.queryParams.id === appConstants.route.logoutParam)) {
      this.resetPwdSucc = true;
      if (this.activatedRoute.snapshot.queryParams.id === appConstants.route.resetParam) {
        this.infoMsg = appConstants.pwdSuccess;
      } else if (this.activatedRoute.snapshot.queryParams.id === appConstants.route.logoutParam) {
        this.infoMsg = appConstants.logoutSuccess;
      } else {
        this.infoMsg = appConstants.pwdSuccess;
      }
      setTimeout(() => {
        this.router.navigate([appConstants.route.login]);
      }, 3000);
    } else {
      this.resetPwdSucc = false;
      if (this.activatedRoute.snapshot.queryParams.id && this.activatedRoute.snapshot.queryParams.id === 'forgot') {
        this.infoMsg = appConstants.forgotConfirm;
      } else {
        this.infoMsg = appConstants.registerConfirm;
      }
    }
  }
  home() {
    this.router.navigate([appConstants.route.login]);
  }
}
