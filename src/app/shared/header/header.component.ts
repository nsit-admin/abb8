import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';
import { HttpClientService } from '@app/common/services/http-client.service';
import { apiEndPoints } from '@app/common/utils/api-endpoint.constant';
import { appConstants } from '@app/common/utils/app.constant';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  public profileObj: any;
  errors: any;
  notificationData: Array<any>;
  searchField;
  options = { 'positionClass': 'toast-top-right' };
  constructor(public commonfunctionService: CommonfunctionService, private router: Router, private httpClientService: HttpClientService,
    private toast: ToastrService) { }

  ngOnInit(): void {
    this.profileObj = localStorage.getItem('abb8_profile') ? JSON.parse(localStorage.getItem('abb8_profile')) : {};
    if (this.profileObj) {
      this.profileObj.fname = atob(this.profileObj.fname);
      this.profileObj.lname = atob(this.profileObj.lname);
      this.profileObj.email = atob(this.profileObj.email);
    }
    this.getSharedWorkspaceDetails();
    this.receiveNotification()
      .subscribe(data => {
        this.commonfunctionService.isLoading.next(false);
        if (data != 'From Login')
          this.toast.success('You have a New Notification', '');
        this.getSharedWorkspaceDetails();
      });
  }

  searchWordChange(event) {
    let term = event;
    if (term !== '') {
      const words = term.split(' ');
      const currentWord = words[words.length - 1];
      term = term.substring(0, term.lastIndexOf(' '));
      if (currentWord.length > 0) {
        if (term.trim().length > 0) {
          term = term + ' ';
        }
        this.commonfunctionService.setSearchWord(currentWord);
      }
    }
  }
  public logout() {
    localStorage.removeItem('abb8_token');
    this.router.navigate([appConstants.route.emailConfirm], { queryParams: { id: appConstants.route.logoutParam } });
  }

  public homePage() {
    this.router.navigate([appConstants.route.dashboard]);
  }

  getSharedWorkspaceDetails() {
    const url = `${apiEndPoints.sharedNotification}?email=${this.profileObj.email}`;
    this.httpClientService.getData(url).subscribe((response: any) => {
      //this.workspaceListShared = response.data;
      console.log(response);
      this.notificationData = response.notifications;
      this.sortNotificationData();
      let unique = [...new Set(this.notificationData.map(data => data.n_desc))];
      let tempArr = [];
      unique.forEach(data => {
        const index = this.notificationData.findIndex(notify => notify.n_desc === data);
        tempArr.push(this.notificationData[index]);
      })
      this.notificationData = tempArr;
    }, (err) => {
      this.errors = err;
    });
  }

  sortNotificationData() {
    return this.notificationData.sort((a, b) => {
      return <any>new Date(b.created_dt) - <any>new Date(a.created_dt);
    });
  }

  receiveNotification() {
    const observable = new Observable<any>(observer => {
      this.httpClientService.socket.on('new notification', (data) => {
        observer.next(data);
      });
      return () => {
        this.httpClientService.socket.disconnect();
      };
    });
    return observable;
  }

  notificationClick(workspace) {
    this.router.navigate([appConstants.route.documentDashboard, workspace._id]);
  }
}
