import { Component, OnInit, HostListener, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { HttpClientService } from '@app/common/services/http-client.service';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';

import { EditDocumentComponent } from '@app/shared/edit-document/edit-document.component';

import { apiEndPoints } from '@app/common/utils/api-endpoint.constant';
import { appConstants } from '@app/common/utils/app.constant';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-merge-document',
  templateUrl: './merge-document.component.html',
  styleUrls: ['./merge-document.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MergeDocumentComponent implements OnInit {

  @ViewChild('selectedDocumentRef') public selectedDocumentRef: ElementRef;
  profileData: any;
  currentWorkspace: any;
  selectedIndex = 0;
  selectedDocument: any;
  isCommentActive = false;
  isMergeCompleted = false;
  hasAcceptedOrRejectedAll = false;
  workspaceData: any;
  workspaceName = '';
  workspaceVersion = '';
  mergedDocuments = [];
  toasterOptions = { positionClass: appConstants.toaster.rightClassName, timeOut: 7000 };

  //Identifiers for document conversation
  userName = '';
  userEmail = '';
  allUsersOnline = [];
  messageText: string;
  errors: any;
  workspaceList: any[] = [];
  historyMessages = [];
  instantMessage: Array<{ user: string, message: string, time: string, email: string }> = [];
  senderEmail: any;
  chatFormGroup: FormGroup;
  documentName: any;
  document_id: any;
  wkName: any;
  room: any;

  constructor(
    private httpClientService: HttpClientService, private router: Router, private activatedRoute: ActivatedRoute,
    private commonfunctionService: CommonfunctionService, private toastrService: ToastrService, public dialog: MatDialog, private formBuilder: FormBuilder) { }

    @HostListener('document:click', ['$event'])
    public onClick(event: any): void {
      if (event.target.className === 'fa fa-check') {
        event.preventDefault();
        const parentNode = event.target.parentNode.parentNode;
        if (parentNode.localName === 'ins') {
          this.selectedDocument = this.selectedDocument.toString().replaceAll(parentNode.outerHTML, parentNode.textContent);
          this.updateMergedDocument();
        } else if (parentNode.localName === 'del') {
          this.selectedDocument = this.selectedDocument.toString().replaceAll(parentNode.outerHTML, '');
          this.updateMergedDocument();
        }
      } else if (event.target.className === 'fa fa-times') {
        event.preventDefault();
        const parentNode = event.target.parentNode.parentNode;
        if (parentNode.localName === 'ins') {
          this.selectedDocument = this.selectedDocument.toString().replaceAll(parentNode.outerHTML, '');
          this.updateMergedDocument();
        } else if (parentNode.localName === 'del') {
          this.selectedDocument = this.selectedDocument.toString().replaceAll(parentNode.outerHTML, parentNode.textContent);
          this.updateMergedDocument();
        }
      }
    }

  ngOnInit(): void {
    this.instantMessage = [];
    this.initializeForm();
    this.senderEmail = atob(JSON.parse(localStorage.getItem('abb8_profile')).email);
    if (this.activatedRoute.snapshot.params) {
      this.profileData = this.commonfunctionService.getProfileDetails();
      this.currentWorkspace = this.commonfunctionService.getWorkSpaceDetails();
      const workspaceId = this.activatedRoute.snapshot.params.id;
      this.getWorkspaceData(workspaceId);
      this.getMergedDocuments(workspaceId);
    }
  }

  getWorkspaceData(workspaceId: any) {
    const url = `${apiEndPoints.getWorkspaceById}${encodeURIComponent(workspaceId)}`;
    this.httpClientService.getData(url).subscribe((res: any) => {
      if (res && res.data) {
        this.workspaceData = res.data;
        this.workspaceName = `${this.workspaceData.w_name} -`;
        this.wkName = `${this.workspaceData.w_name}`;
        this.workspaceVersion = `From: ${this.workspaceData.w_version}`;
      }
    }, (error: any) => {
    });
  }

  getMergedDocuments(workspaceId: any) {
    const url = `${apiEndPoints.getMergedDocuments}${encodeURIComponent(workspaceId)}`;
    this.httpClientService.getData(url).subscribe((res: any) => {
      if (res.data && res.data.length > 0) {
        this.mergedDocuments = res.data;
        this.documentName = this.mergedDocuments[0].document_name;
        this.document_id = this.mergedDocuments[0].document_id;
        this.onDocumentChange(0);
        if (this.documentName != null) {
          this.receiveHistoryMessages(this.documentName);
          this.userName = this.profileData.fname + " " + this.profileData.lname;
          this.userEmail = this.profileData.email;
          this.newUser({ user: this.userName, email: this.userEmail, room: this.wkName + " : " + this.documentName });
          this.room = this.wkName + " : " + this.documentName;
          this.newMessageReceived()
            .subscribe(data => {
              this.instantMessage.unshift(data);
              this.messageText = '';
            });
          this.allOnlineUsers(this.room)
            .subscribe(data => this.allUsersOnline = data);
        }
      }
    }, (error: any) => {
    });
  }

  onDocumentChange(index: any) {
    this.selectedIndex = index;
    if (this.mergedDocuments[index] && this.mergedDocuments[index].updated) {
      this.selectedDocument = this.mergedDocuments[index].document_html;
      this.hasAcceptedOrRejectedAll = this.mergedDocuments[this.selectedIndex].hasAcceptedOrRejectedAll;
    } else {
      this.hasAcceptedOrRejectedAll = false;
      let htmlText = this.mergedDocuments[index].document_html;
      if (this.currentWorkspace && this.currentWorkspace.versionName === 'Master') {
        htmlText = htmlText.toString().replaceAll(`<del>`,
          `<del><i class="test"><i class="fa fa-check" aria-hidden="true"></i> <i class="fa fa-times" aria-hidden="true"></i></i>`);
        htmlText = htmlText.toString().replaceAll(`<ins>`,
          `<ins><i class="test"><i class="fa fa-check" aria-hidden="true"></i> <i class="fa fa-times" aria-hidden="true"></i></i>`);
      }
      this.selectedDocument = htmlText;
      setTimeout(() => {
        const insElement = this.selectedDocumentRef.nativeElement.querySelectorAll('ins');
        for (let i = 0; i < insElement.length; i++) {
          const ins = insElement[i];
          if (ins.innerText.trim() === '') {
            ins.outerHTML = ' ';
          } else {
            ins.setAttribute('id', 'ins_' + i.toString());
          }
        }
        const delElement = this.selectedDocumentRef.nativeElement.querySelectorAll('del');
        for (let i = 0; i < delElement.length; i++) {
          const del = delElement[i];
          if (del.innerText.trim() === '') {
            del.outerHTML = ' ';
          } else {
            del.setAttribute('id', 'del_' + i.toString());
          }
        }
        this.selectedDocument = this.selectedDocumentRef.nativeElement.innerHTML;
        this.mergedDocuments[this.selectedIndex].document_html = this.selectedDocument;
        this.mergedDocuments[index].updated = true;
        this.setMergeStatus();
      }, 100);
    }
  }

  acceptAllChanges() {
    const insElement = this.selectedDocumentRef.nativeElement.querySelectorAll('ins');
    for (let i = 0; i < insElement.length; i++) {
      const ins = insElement[i];
      this.selectedDocument = this.selectedDocument.toString().replaceAll(ins.outerHTML, ins.outerText);
    }
    const delElement = this.selectedDocumentRef.nativeElement.querySelectorAll('del');
    for (let i = 0; i < delElement.length; i++) {
      const del = delElement[i];
      this.selectedDocument = this.selectedDocument.toString().replaceAll(del.outerHTML, '');
    }
    this.hasAcceptedOrRejectedAll = true;
    this.updateMergedDocument();
  }

  rejectAllChanges() {
    const insElement = this.selectedDocumentRef.nativeElement.querySelectorAll('ins');
    for (let i = 0; i < insElement.length; i++) {
      const ins = insElement[i];
      this.selectedDocument = this.selectedDocument.toString().replaceAll(ins.outerHTML, '');
    }
    const delElement = this.selectedDocumentRef.nativeElement.querySelectorAll('del');
    for (let i = 0; i < delElement.length; i++) {
      const del = delElement[i];
      this.selectedDocument = this.selectedDocument.toString().replaceAll(del.outerHTML, del.outerText);
    }
    this.hasAcceptedOrRejectedAll = true;
    this.updateMergedDocument();
  }

  updateMergedDocument() {
    this.mergedDocuments[this.selectedIndex].document_html = this.selectedDocument;
    this.mergedDocuments[this.selectedIndex].updated = true;
    this.mergedDocuments[this.selectedIndex].hasAcceptedOrRejectedAll = this.hasAcceptedOrRejectedAll;
    this.setMergeStatus();
  }

  onCommentFocus() {
    this.isCommentActive = true;
  }

  onCommentBlur(event: any) {
    if (!event.target.value || event.target.value.length === 0) {
      this.isCommentActive = false;
    } else {
      this.isCommentActive = true;
    }
  }

  setMergeStatus() {
    this.isMergeCompleted = false;
    if (this.currentWorkspace && this.currentWorkspace.versionName === 'Master' && this.mergedDocuments && this.mergedDocuments.length > 0) {
      this.mergedDocuments.forEach((element, index) => {
        if (index === 0 || (index > 0 && this.isMergeCompleted)) {
          const document = element.document_html;
          if (element.updated && document && document.indexOf('</ins>') === -1 && document.indexOf('</del>') === -1) {
            this.isMergeCompleted = true;
          } else {
            this.isMergeCompleted = false;
          }
        }
      });
    }
  }

  editDocument() {
    const dialogRef = this.dialog.open(EditDocumentComponent, {
      data: { document: this.selectedDocument },
      height: '750px',
      width: '1000px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedDocument = result;
        this.mergedDocuments[this.selectedIndex].document_html = this.selectedDocument;
      }
    });
  }

  saveMergedDocuments() {
    const isMergeSuccess = new Subject();
    if (this.isMergeCompleted) {
      const url = apiEndPoints.saveMergeDocument;
      this.mergedDocuments.forEach(document => {
        document.modified_by = `${this.profileData.fname} ${this.profileData.lname}`;
        document.modified_dt = moment().format();
        document.notification_receiver = this.workspaceData.w_contribtors;
        document.notification_w_version = this.workspaceData.w_version;
        this.httpClientService.putData(url, document).subscribe((res: any) => {
          isMergeSuccess.next(true);
        }, (error: any) => {
          isMergeSuccess.next(false);
          this.toastrService.error(appConstants.toaster.documentMergeError, '', this.toasterOptions);
        });
      });
      isMergeSuccess.subscribe(res => {
        if (res) {
          this.sendNotification();
          this.toastrService.success(appConstants.toaster.documentMergeSuccess, '', this.toasterOptions);
          setTimeout(() => {
            this.toastrService.clear();
            this.inactiveExistingMerges();
            this.archiveWorkspace();
          }, 1000);
        }
      });
    }
    this.updateDocAnalyticsStatus();
  }

  inactiveExistingMerges() {
    const url = apiEndPoints.inactiveExistingMerges;
    const req = {
      id: this.mergedDocuments[this.selectedIndex].master_workspace_id,
      status: 'Inactive'
    };
    this.httpClientService.postData(url, req).subscribe();
  }

  archiveWorkspace() {
    const url = apiEndPoints.updateWorkspace;
    const req = {
      _id: this.workspaceData._id,
      status: 'Archived'
    };
    this.httpClientService.postData(url, req).subscribe((res: any) => {
      this.router.navigate([appConstants.route.dashboard]);
    });
  }

  sendNotification() {
    this.httpClientService.socket.emit('create notification', 'Notification Test');
  }

  ngOnDestroy() {
    this.leaveRoom({ user: this.userName, room: this.wkName + " - " + this.documentName });
    this.httpClientService.socket.off();
  }

  private initializeForm() {
    this.chatFormGroup = this.formBuilder.group({
      messageInputField: ['', [Validators.required]]
    });
  }

  get chatForm() {
    return this.chatFormGroup.controls;
  }

  //Send new messages
  sendMessage() {
    var currentdate = new Date();
    var options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    var to12HourtimeString = currentdate.toLocaleString('en-US', options);
    const emitData =
    {
      name: this.userName,
      email: this.userEmail,
      message: this.messageText,
      w_name: this.wkName,
      doc_name: this.documentName,
      date: new Date().toDateString(),
      time: to12HourtimeString
    };
    this.senderEmail = emitData.email;
    this.httpClientService.socket.emit('message', { room: emitData.w_name + " : " + emitData.doc_name, user: emitData.name, email: emitData.email, message: emitData.message, Time: emitData.time });
    var currentDateToCstTime = currentdate.toLocaleString('en-US', { timeZone: 'America/Chicago' }).replace(',', '');
    const saveMsg =
    {
      name: this.userName,
      email: this.userEmail,
      message: this.messageText,
      w_name: this.wkName,
      doc_name: this.documentName,
      date: currentDateToCstTime.split(' ')[0],
      time: currentDateToCstTime.split(' ')[1] + ' ' + currentDateToCstTime.split(' ')[2] + ' CST'
    };
    this.httpClientService.postData(apiEndPoints.sendMessage, saveMsg).subscribe((response: any) => {
      this.messageText = '';
    }, (err) => {
      this.errors = err;
    });
  }

  //History messages
  receiveHistoryMessages(documentName) {
    const docName = this.wkName + ":" + documentName;
    const url = `${apiEndPoints.retrieveMessageByWorkspaceDocumentName}${encodeURIComponent(docName)}`;
    this.httpClientService.getData(url).subscribe((response: any) => {
      this.historyMessages = response.data;
      let historyCSTDateAndTime: any;
      for (let i in this.historyMessages) {
        historyCSTDateAndTime = this.historyMessages[i].date + ' ' + this.historyMessages[i].time;
        this.historyMessages[i].date = historyCSTDateAndTime.toLocaleString();
      }
    }, (err) => {
      this.errors = err;
    });
  }

  newMessageReceived() {
    const observable = new Observable<{ user: string, message: string, time: string, email: string, room: string }>(observer => {
      this.httpClientService.socket.on('new message', (data) => {
        if (this.instantMessage.indexOf(data) == -1) {
          if (this.room == data.room)
            observer.next(data);
        }
      });
      return () => {
        this.httpClientService.socket.disconnect();
      };
    });
    return observable;
  }

  newUser(data) {
    console.log("new User ", data);
    this.httpClientService.socket.emit('new user', data);
  }

  allOnlineUsers(room) {
    const observable = new Observable<any>(observer => {
      this.httpClientService.socket.on('usernames', (data) => {
        if (room == data.room)
          observer.next(data);
      });
      return () => {
        this.httpClientService.socket.disconnect();
      };
    });
    return observable;
  }

  leaveRoom(data) {
    this.httpClientService.socket.emit('leave', data);
  }
  updateDocAnalyticsStatus() {
    this.mergedDocuments.forEach(doc => {
      const req = {
        document_id: doc.document_id,
        document_action_status: 'APPROVED'
      };
      this.httpClientService.postData(apiEndPoints.saveDocAnalytics, req).subscribe((data: any) => {

      }, ((error: any) => {

      }));
    });

  }
}
