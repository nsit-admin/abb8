import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonfunctionService {
  public loading = false;
  public isHeaProClk = false;
  public isNotifyClk = false;
  public workSpaceDetails: any;
  public isLoading = new BehaviorSubject(false);
  private subject = new Subject<any>();

  setSearchWord(message: string) {
      this.subject.next({ text: message });
  }

  getSearchWord(): Observable<any> {
      return this.subject.asObservable();
  }
  constructor() { }

  // Function for Validate the New Password and Confirm Password.
  public confirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
  /*
    Method for get the WorkSpace Details
   **/
  getWorkSpaceDetails() {
    const workSpaceObj = localStorage.getItem('abb8_workSpace') ? JSON.parse(localStorage.getItem('abb8_workSpace')) : {};
    if (workSpaceObj) {
      workSpaceObj.id = atob(workSpaceObj.id);
      workSpaceObj.name = atob(workSpaceObj.name);
      workSpaceObj.versionName = workSpaceObj.versionName?atob(workSpaceObj.versionName):'';
      workSpaceObj.createdBy = workSpaceObj.createdBy?atob(workSpaceObj.createdBy):'';
      workSpaceObj.owner_email = workSpaceObj.owner_email?atob(workSpaceObj.owner_email):'';
      workSpaceObj.w_merge_status = workSpaceObj.w_merge_status?atob(workSpaceObj.w_merge_status):'';
    }
    return workSpaceObj;
  }
  /*
  Method for set the WorkSpace Details
 **/
  setWorkSpaceDetails(workSpaceObj) {
    const workSpace: any = {
      id: btoa(workSpaceObj._id),
      name: btoa(workSpaceObj.w_name),
      versionName: workSpaceObj.w_version?btoa(workSpaceObj.w_version):'',
      createdBy: workSpaceObj.created_by?btoa(workSpaceObj.created_by):'',
      owner_email: workSpaceObj.w_owner?btoa(workSpaceObj.w_owner):'',
      w_merge_status: workSpaceObj.w_merge_status?btoa(workSpaceObj.w_merge_status):'',
    };
    localStorage.setItem('abb8_workSpace', JSON.stringify(workSpace));
  }
  /*
    Method for get the Profile Details
   **/
  getProfileDetails() {
    const profileObj = localStorage.getItem('abb8_profile') ? JSON.parse(localStorage.getItem('abb8_profile')) : {};
    if (profileObj) {
      profileObj.fname = atob(profileObj.fname);
      profileObj.lname = atob(profileObj.lname);
      profileObj.email = atob(profileObj.email);
    }
    return profileObj;
  }
}
