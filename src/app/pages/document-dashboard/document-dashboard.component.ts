import { Component, ElementRef, Injectable, OnDestroy, OnInit, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';
import { HttpClientService } from 'src/app/common/services/http-client.service';
import { apiEndPoints } from 'src/app/common/utils/api-endpoint.constant';
import { Observable } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { appConstants } from '@app/common/utils/app.constant';
import { ToastrService } from 'ngx-toastr';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import * as mammoth from 'mammoth/mammoth.browser.js';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { MatDialog } from '@angular/material/dialog';
import { CreateDocumentComponent } from '@app/shared/create-document/create-document.component';
@Component({
  selector: 'app-document-dashboard',
  templateUrl: './document-dashboard.component.html',
  styleUrls: ['./document-dashboard.component.css']
})

@Injectable()
export class DocumentDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('docFile') public docFile: ElementRef;
  @ViewChild('uploadedDocumentRef') public uploadedDocumentRef: ElementRef;
  @ViewChild('emailInput', { read: MatAutocompleteTrigger }) emailAutoComplete: MatAutocompleteTrigger;
  workspaceShareFormGroup: FormGroup;
  emailList: string[] = [];
  uploadedDocument: any;
  uploadedDocuments = [];
  public profileObj: any;
  public workSpaceObj: any;
  workSpaceId: any;
  classicEditor = DecoupledEditor;
  public workSpaceDetails = [];
  documentList = [];
  editCountList = [];
  completeEditCount = 0;
  isMergeCompleted = false;
  canReviewChanges = false;
  wContibutors: any = [];
  ShowMaster = false;
  valid: boolean;
  expanded = false
  selectedVersionName = "";
  selectedWorkspaceMergeStatus = "";
  selectedEmailListNew = [];
  errorMsg: string;
  sharedEmailFlag = false;
  constructor(public commonfunctionService: CommonfunctionService, private router: Router,
    private httpClientService: HttpClientService, private modalService: BsModalService, private formBuilder: FormBuilder,
    private toast: ToastrService, private route: ActivatedRoute, private toastrService: ToastrService, public dialog: MatDialog) {

  }
  //Identifiers for workspace conversation 
  allUsersOnline = [];
  userName = '';
  userEmail = '';
  messageText: string = "";
  errors: any;
  workspaceList: any[] = [];
  versionName = "";
  documentName = "";
  filteredData: any[] = [];
  editDocumentData: any[] = [];
  filteredDocumentData: any[] = [];
  workspaceName: any;
  historyMessages = [];
  instantMessage: Array<{ user: string, message: string, time: string, email: string }> = [];
  senderEmail: any;
  chatFormGroup: FormGroup;

  // Identifiers for shareFormgroup
  modalRef: BsModalRef;
  public submitted = false;

  // Identifiers for Notification 
  options = { 'positionClass': 'toast-bottom-right' };
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredEmail: Observable<string[]>;
  selectedEmailList: string[] = [];
  //public id: string;
  workspaceListById: any;
  errorMessageVersion: string = '';
  errorMessageEmail: string = '';
  selectedVersion = {};
  swichedWorkspaceId;
  @HostListener("document:click", ["$event.target"])
  onClickEvent(event) {
    var isClickonMaster = event["className"].indexOf('share-master') > -1;
    var isClickInsideModel = event["className"].indexOf('version-model') > -1;
    if (isClickonMaster) {
      this.ShowMaster = !this.ShowMaster;
      this.versionName = '';
    }
    (isClickonMaster || isClickInsideModel) ? this.ShowMaster = true : this.ShowMaster = false;
  }

  ngOnInit() {
    this.initializeForm();
    this.senderEmail = atob(JSON.parse(localStorage.getItem('abb8_profile')).email);
    this.workSpaceId = this.route.snapshot.params.id;
    this.workSpaceObj = this.commonfunctionService.getWorkSpaceDetails();
    this.profileObj = this.commonfunctionService.getProfileDetails();
    this.ShowMaster = false
    this.workspaceName = this.workSpaceObj.name;
    this.receiveHistoryMessages(this.workspaceName);
    this.getWorkSpaceDetails();
    this.getWorkspaceById();
    this.getDocuments(this.workSpaceId);
    this.userName = atob(JSON.parse(localStorage.getItem('abb8_profile')).fname) + ' ' + atob(JSON.parse(localStorage.getItem('abb8_profile')).lname)
    this.userEmail = atob(JSON.parse(localStorage.getItem('abb8_profile')).email);
    this.newUser({ user: this.userName, email: this.userEmail, room: this.workSpaceObj.name });
    this.newMessageReceived()
      .subscribe(data => {
        this.instantMessage.unshift(data);
        this.messageText = '';
      });
    this.allOnlineUsers()
      .subscribe(data => this.allUsersOnline = data);
    this.profileObj = localStorage.getItem('abb8_profile') ? JSON.parse(localStorage.getItem('abb8_profile')) : {};
    if (this.profileObj) {
      this.profileObj.fname = atob(this.profileObj.fname);
      this.profileObj.lname = atob(this.profileObj.lname);
      this.profileObj.email = atob(this.profileObj.email);
    }

  }

  getWorkSpaceDetails() {
    this.wContibutors = [];
    const url = `${apiEndPoints.getWorkspaceByWorkspaceName}${encodeURIComponent(this.workSpaceObj.name)}`;
    this.httpClientService.getData(url).subscribe((response: any) => {
      this.workspaceList = response.data;
      //this.wContibutors = this.workspaceList && this.workspaceList[0].w_contribtors;
      this.workSpaceDetails = this.workspaceList.filter((ItmVar) => {
        ItmVar._id == this.workSpaceId;
      });
      this.filteredData = this.workspaceList.filter((data) => {
        return data.w_owner == this.profileObj.email && data.status === 'Active';
      });
      this.workspaceList.forEach((data) => {
        this.wContibutors.push(...data.w_contribtors);
        if (data.w_contribtors.indexOf(this.profileObj.email) != -1) {
          this.selectedVersionName = data.w_version;
          this.swichedWorkspaceId = data._id;
        }
      })

      console.log('this.wContibutors', this.wContibutors);
      this.workspaceList = this.workspaceList.filter((data) => {
        return data.w_version != 'Master' && data.status === 'Active';
      });

      if (this.workSpaceObj.versionName === 'Master') {
        this.workspaceList = this.workspaceList.filter((data) => {
          return data.w_merge_status === 'Open';
        });
        this.canReviewChanges = this.workspaceList.length > 0
      } else {
        this.workspaceList = this.workspaceList.filter((data) => {
          return data.w_version === this.workSpaceObj.versionName;
        });
        this.canReviewChanges = this.workSpaceObj.w_merge_status === 'Open' && this.workspaceList.length > 0
      }

      this.getEditDocumentListCount();
      this.getEmailList();
    }, (err) => {
      this.errors = err;
    });
  }

  getEditDocumentListCount() {
    this.completeEditCount = 0;
    console.log(this.workspaceList)
    this.workspaceList.forEach((version, index) => {
      this.getResyncStatus(version);
      const url = `${apiEndPoints.getDocument}${encodeURIComponent(version._id)}`;
      this.httpClientService.getData(url).
        subscribe((res: any) => {
          if (res.data.length > 0) {
            let documentList = res.data;
            console.log(documentList)
            let count = 0;
            let mergeCompletedCount = 0;
            let mergeInprogressCount = 0;
            documentList.forEach(doc => {
              count = count + doc.editCount;
              this.completeEditCount = this.completeEditCount + doc.editCount;
              if (doc.merge_status === 'Completed') {
                mergeCompletedCount = mergeCompletedCount + 1;
              } else if (doc.merge_status === 'Inprogress') {
                mergeInprogressCount = mergeInprogressCount + 1;
              }
            });
            this.isMergeCompleted = mergeInprogressCount === 0 && mergeCompletedCount > 0;
            version['editCount'] = count;
          } else {
            version['editCount'] = 0;
          }
          if (version.editCount === 0) {
            this.workspaceList.splice(index, 1);
          }
          console.log("COmpleted count", this.completeEditCount)
        });
      console.log("COmpleted count", this.completeEditCount)
    });
  }

  getResyncStatus(version: any) {
    const url = `${apiEndPoints.getMergedDocuments}${encodeURIComponent(version._id)}`;
    this.httpClientService.getData(url).subscribe((res: any) => {
      if (res.data && res.data.length > 0) {
        version.isResyncRequired = res.data.filter((data) => {
          return data.status === 'Inactive';
        }).length > 0;
      }
    });
  }

  ngOnDestroy() {
    this.leaveRoom({ user: this.userName, room: this.workSpaceObj.name });
  }

  ngAfterViewInit() {
    this.filteredEmail = this.workspaceShareFormGroup.controls['email'].valueChanges.pipe(
      startWith(null),
      map((email: string | null) => email ? this._filter(email) : this.emailList.slice()));
  }

  private initializeForm() {
    this.workspaceShareFormGroup = this.formBuilder.group({
      versionName: ['', [Validators.required, Validators.pattern(/[^ +]/)]],
      email: ['', [Validators.pattern(appConstants.formPatterns.email), Validators.maxLength(50)]],
    });

    this.chatFormGroup = this.formBuilder.group({
      messageInputField: ['', [Validators.required]]
    });
  }
  get workspaceShareForm() {
    return this.workspaceShareFormGroup.controls;
  }

  get chatForm() {
    return this.chatFormGroup.controls;
  }

  openModal(WorkspaceSharetemplate: TemplateRef<any>) {
    this.selectedEmailList = [];
    this.selectedEmailListNew = [];
    // this.workspaceCloneFormGroup = this.workspaceShareFormGroup;
    this.workspaceShareFormGroup.reset();
    this.getEmailList();
    this.modalRef = this.modalService.show(WorkspaceSharetemplate, { ignoreBackdropClick: true, keyboard: false });
    this.errorMessageVersion = "";
    this.errorMessageEmail = "";
  }


  getWorkspaceById() {
    const url = `${apiEndPoints.getWorkspaceById}${encodeURIComponent(this.workSpaceId)}`;
    this.httpClientService.getData(url).subscribe((response: any) => {
      this.workspaceListById = response.data;
    }, (err) => {
      this.errors = err;
    });
  }


  onSubmit(form: any) {
    var curDate = moment().format();
    this.submitted = true;
    this.errors = '';
    var email = `${this.profileObj.email}`;
    this.selectedEmailwithoutOwner();
    if (form.valid) {
      const reqData = {
        id: this.workspaceListById._id,
        w_name: this.workspaceListById.w_name,
        w_desc: this.workspaceListById.w_desc,
        w_owner: this.workspaceListById.w_owner,
        owner_name: `${this.profileObj.fname} ${this.profileObj.lname}`,
        w_tags: this.workspaceListById.w_tags,
        w_version: this.workspaceShareFormGroup.get('versionName').value,
        w_contribtors: this.selectedEmailListNew,
        status: this.workspaceListById.status,
        created_dt: curDate,
        created_by: `${this.profileObj.fname} ${this.profileObj.lname}`,
      };
      this.httpClientService.postData(apiEndPoints.shareWorkspace, reqData).subscribe((response: any) => {
        this.selectedEmailList = [];
        this.workspaceShareFormGroup.reset();
        this.sendNotification();
        this.getWorkSpaceDetails();
      }, (err) => {
        this.errors = err;
      });
      this.toast.success('Workspace has been shared successfully', '', this.options);
      this.modalRef.hide();
    }
  }



  //Null validation Email
  validateNullEmail() {
    var email = this.workspaceShareFormGroup.get('email').value;
    var contribtors: string[] = this.selectedEmailList;
    if (contribtors.length === 0) {
      this.errorMessageEmail = "EmailId is required";
      this.submitted = false;
    }
    if (contribtors.length > 0) {
      this.errorMessageEmail = "";
    }
    //return this.submitted;
    //  this.emailAutoComplete.closePanel();
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
      w_name: this.workSpaceObj.name,
      date: new Date().toDateString(),
      time: to12HourtimeString
    };
    this.senderEmail = emitData.email;
    this.httpClientService.socket.emit('message', { room: emitData.w_name, user: emitData.name, email: emitData.email, message: emitData.message, Time: emitData.time });
    var currentDateToCstTime = currentdate.toLocaleString('en-US', { timeZone: 'America/Chicago' }).replace(',', '');
    const saveMsg =
    {
      name: this.userName,
      email: this.userEmail,
      message: this.messageText,
      w_name: this.workSpaceObj.name,
      doc_name: "",
      date: currentDateToCstTime.split(' ')[0],
      time: currentDateToCstTime.split(' ')[1] + ' ' + currentDateToCstTime.split(' ')[2] + ' CST'
    };
    this.httpClientService.postData(apiEndPoints.sendMessage, saveMsg).subscribe((response: any) => {
      this.messageText = '';
      console.log("savedMsg ", response);
    }, (err) => {
      this.errors = err;
    });

    for (let index of this.workspaceList) {
      this.sharedUsers({ user: index.w_owner, room: this.workSpaceObj.name });
    }
  }

  // for share workspace users
  sharedUsers(data) {
    this.httpClientService.socket.emit('new message', data);
  }

  //History messages
  receiveHistoryMessages(workspaceName) {
    workspaceName = workspaceName + ":" + "";
    const url = `${apiEndPoints.retrieveMessageByWorkspaceDocumentName}${encodeURIComponent(workspaceName)}`;
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

  //New message to all users
  newMessageReceived() {
    const observable = new Observable<{ user: string, message: string, time: string, email: string }>(observer => {
      this.httpClientService.socket.on('new message', (data) => {
        if (this.instantMessage.indexOf(data) == -1) {
          if (this.workspaceName == data.room)
            observer.next(data);
        }
      });
      return () => {
        this.httpClientService.socket.disconnect();
      };
    });
    return observable;
  }

  //New user join
  newUser(data) {
    this.httpClientService.socket.emit('new user', data);
  }

  allOnlineUsers() {
    const observable = new Observable<any>(observer => {
      this.httpClientService.socket.on('usernames', (data) => {
        if (this.workspaceName == data.room)
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

  sendNotification() {
    this.httpClientService.socket.emit('create notification', 'Notification Test');
  }

  //get usersdetails
  getUsers() {
    this.httpClientService.getData(apiEndPoints.getUsers).subscribe((response: any) => {
    }, (err) => {
      this.errors = err;
    });
  }

  getEmailList() {
    this.emailList = [];
    this.httpClientService.getData(apiEndPoints.getUsers).subscribe((response: any) => {
      response.users.forEach(element => {
        this.emailList.push(element.email);
      });
    }, (err) => {
      this.errors = err;
    });
  }


  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    var errorMsg = document.getElementById("errorMsgEmail");
    if ((value || '').trim() && value.length <= 50 && this.workspaceShareFormGroup.controls['email'].valid) {
      if (!this.selectedEmailList.includes(value.trim())) {
        this.selectedEmailList.push(value.trim());
        if (errorMsg !== null) {
          document.getElementById("errorMsgEmail").textContent = "";
        }
      }
    }
    if (input) {
      input.value = '';
    }
    this.workspaceShareFormGroup.controls['email'].setValue(null);
  }

  remove(email: string): void {
    const index = this.selectedEmailList.indexOf(email);

    if (index >= 0) {
      this.selectedEmailList.splice(index, 1);
    }
    //this.emailAutoComplete.closePanel();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.sharedEmailFlag = false;
    if (event?.option?.value?.length <= 50) {
      let index = this.selectedEmailList.indexOf(event.option.viewValue);
      if (index == -1 && this.profileObj.email !== event.option.value) {
        this.selectedEmailList.push(event.option.viewValue);
      }
    }
    // document.getElementById("errorMsgEmail").hidden = true;

    this.workspaceShareFormGroup.controls['email'].setValue(null);
    this.validateNullEmail();
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    return this.emailList.filter(email => email.toLowerCase().indexOf(filterValue) === 0);
  }

  addDocumentsForUpload(event) {
    console.log(event)
    if (event && event.length > 0) {
      for (const e of event) {
        if (e.name.endsWith('.docx')) {
          this.uploadedDocuments.push(e);
        }
        else {
          this.errorMsg = "Abbrevia8 supports only Microsoft word 2013 or above format";
        }
      };
    }
  }

  async uploadDoc() {
    this.modalRef.hide();
    this.commonfunctionService.isLoading.next(true);
    const documentsToUpload = [];
    for (const file of this.uploadedDocuments) {
      this.asyncUpload(file, documentsToUpload);
    }

  }

  async asyncUpload(file: any, documentsToUpload: any) {
    return new Promise((resolve, reject) => {
      return setTimeout(() => resolve(this.convertToHtmlAndUpload(file, documentsToUpload)), 700)
    })
  }

  async convertToHtmlAndUpload(file: any, documentsToUpload: any) {
    const fileReader: FileReader = new FileReader();
    const self = this;
    fileReader.onloadend = (event) => {
      mammoth.convertToHtml({ arrayBuffer: event.target.result })
        .then((result) => {
          this.uploadedDocument = result.value;
          setTimeout(() => {
            const supElement = this.uploadedDocumentRef.nativeElement.querySelectorAll('sup');
            for (let i = 0; i < supElement.length; i++) {
              const sup = supElement[i];
              if (sup.outerHTML.trim().includes('id="footnote')) {
                sup.outerHTML = '';
              }
            }
            const liElement = this.uploadedDocumentRef.nativeElement.querySelectorAll('li');
            for (let i = 0; i < liElement.length; i++) {
              const li = liElement[i];
              if (li.outerHTML.trim().includes('id="footnote')) {
                li.outerHTML = '';
              }
            }
            this.uploadedDocument = this.uploadedDocumentRef.nativeElement.innerHTML;
            const payload = {
              workspaceId: self.workSpaceId,
              w_master_id: self.workspaceListById?.w_master_id,
              workspaceName: self.workSpaceObj.name,
              workspaceVersion: self.workSpaceObj.versionName,
              documentName: file.name,
              documentHtml: this.uploadedDocument,
              created_by: `${self.profileObj.fname} ${self.profileObj.lname}`,
              created_dt: moment().format(),
              document_status: 'ACTIVE'
            };
            documentsToUpload.push(payload);
            if (this.uploadedDocuments.length === documentsToUpload.length) {
              self.httpClientService.postData(apiEndPoints.saveDocument, documentsToUpload).
                subscribe((res: any) => {
                  self.getDocuments(this.workSpaceId);
                  // self.docFile.nativeElement.value = '';
                  self.uploadedDocuments = [];
                  self.isMergeCompleted = true;
                  self.toast.success(appConstants.toaster.documentUploadSuccess, '', self.options);
                }, (err) => {
                  self.toast.error(appConstants.toaster.doucmentUploadError, '', self.options);
                });
            }
          }, 10);
          const messages = result.messages; // Any messages, such as warnings during conversion
        });
    };
    fileReader.readAsArrayBuffer(file);
    this.errorMsg = "";
  }

  public onReady(editor): void {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.view.editable.element,
      editor.ui.getEditableElement()
    );
  }
  /*
Method for get all documents
**/
  // getDocuments() {
  //   const url = `${apiEndPoints.getDocument}${this.workSpaceId}`;
  //   this.httpClientService.getData(url).
  //     subscribe((res: any) => {
  //       this.documentList = res.data;
  //     });
  // }
  /*
Method for redirect the edit document page
**/
  editDocument(doc) {
    this.router.navigate([appConstants.route.documentEdit, doc._id, this.swichedWorkspaceId]);
  }


  getDocuments(workspaceId) {
    this.editCountList = [];
    this.commonfunctionService.loading = true;
    const url = `${apiEndPoints.getDocument}${encodeURIComponent(workspaceId)}`;
    this.httpClientService.getData(url).
      subscribe((res: any) => {
        this.documentList = res.data;
        this.documentList.filter(item => {
          if (item.editCount > 0) {
            this.editCountList.push(item.editCount);
          }
        });
        this.editDocumentData = this.documentList.filter(doc => {
          return doc.editCount > 0
        });
        console.log("", this.editCountList);
        this.filteredDocumentData = this.documentList.filter(doc => {
          return doc.document_status != "DELETED"
        });
        this.commonfunctionService.loading = false;
      });
  }

  getContributors(name: any) {
    var contName = name.split(",");
    this.wContibutors = contName;
  }

  getContributorsStyle(index: number) {
    index = index < 5 ? index : index - 5;
    switch (index) {
      case 0: return 'Salmon'
      case 1: return 'Gold'
      case 2: return 'Plum'
      case 3: return 'Aquamarine'
      case 4: return 'Lime'
      case 5: return 'Pink'
    }
    var color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
  }

  getClicked() {
    this.ShowMaster = !this.ShowMaster
  }
  searchData(searchValue: any) {
    this.filteredData = this.workspaceList.filter((item) => {
      return item.w_version.toLowerCase().includes(searchValue.toLowerCase());
    });
  }

  isExpanded() {
    this.expanded = !this.expanded
    console.log("this.expanded=false")
  }

  getPercentageRound(number) {
    return Math.round(number)
  }

  searchDocumentData(searchValue: any) {
    this.filteredDocumentData = this.documentList.filter((item) => {
      return item.documentName.toLowerCase().includes(searchValue.toLowerCase());
    });
  }

  versionModelClick(item) {
    this.selectedVersionName = item.w_version;
    this.getDocuments(item._id);
    this.wContibutors = item.w_contribtors;
    this.selectedEmailList = item.w_contribtors;
    this.selectedVersion = item;
    this.swichedWorkspaceId = item._id;
    this.selectedWorkspaceMergeStatus = item.w_merge_status;
  }

  mergeToMaster(version: any) {
    const url = `${apiEndPoints.getMergeStatus}${encodeURIComponent(version._id)}`;
    this.httpClientService.getData(url).
      subscribe((res: any) => {
        if (res.mergeStatus == appConstants.Inprogress) {
          this.toast.info(appConstants.toaster.mergeStatus, '', this.options);
        } else {
          this.router.navigate([appConstants.route.mergeDocument, version._id]);
        }
      });
  }
  //  Method For craete the new document using mat-dialog.
  createDocument() {
    const dialogRef = this.dialog.open(CreateDocumentComponent, {
      height: '750px',
      width: '1000px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const payload = [{
          workspaceId: this.workSpaceId,
          w_master_id: this.workspaceListById?.w_master_id,
          workspaceName: this.workSpaceObj.name,
          workspaceVersion: this.workSpaceObj.versionName,
          documentName: result.fileName,
          documentHtml: result.document,
          created_by: `${this.profileObj.fname} ${this.profileObj.lname}`,
          created_dt: moment().format(),
        }];
        console.log('payload', payload);
        this.httpClientService.postData(apiEndPoints.saveDocument, payload).
          subscribe((res: any) => {
            this.getDocuments(this.workSpaceId);
            this.isMergeCompleted = true;
            this.toast.success(appConstants.toaster.createDocumentSuccess, '', this.options);
          }, (err) => {
            this.toast.error(appConstants.toaster.createDocumentError, '', this.options);
          });
      }
    });
  }

  submitForReview() {
    if(!this.isMergeCompleted) {
      this.toast.warning(appConstants.toaster.mergeNotCompleted, '', this.options);
      return;
    }
    const url = apiEndPoints.updateWorkspaceMergeStatus;
    const req = {
      _id: this.workSpaceObj.id,
      w_merge_status: 'Open'
    };
    this.httpClientService.postData(url, req).subscribe((res: any) => {
      let workspaceData = this.commonfunctionService.getWorkSpaceDetails();
      workspaceData._id = workspaceData.id;
      workspaceData.w_name = workspaceData.name;
      workspaceData.w_version = workspaceData.versionName;
      workspaceData.created_by = workspaceData.createdBy;
      workspaceData.w_owner = workspaceData.owner_email;
      workspaceData.w_merge_status = 'Open';
      this.commonfunctionService.setWorkSpaceDetails(workspaceData);
      this.ngOnInit();
    });
    this.updateDocAnalyticsStatus();
  }


  resyncChanges(version: any) {
    if (!version.disableResync) {
      const url = apiEndPoints.resyncChanges;
      const req = {
        id: version._id,
        w_name: version.w_name
      };
      this.httpClientService.postData(url, req).subscribe((res: any) => {
        version.disableResync = true;
        setTimeout(() => {
          version.isResyncRequired = false;
        }, 3000);
      });
    }
  }

  deleteDoc(doc: any) {
    const req = {
      doc_id: doc._id,
      document_status: 'DELETED'
    };
    this.httpClientService.putData(apiEndPoints.deleteDocument, req).subscribe((data: any) => {
      this.toastrService.success(data.message, '', this.options);
      this.getDocuments(this.swichedWorkspaceId);
    }, ((error: any) => {
      this.toastrService.error(error.error, '', this.options);
    }));
  }
  openDelegateModal(WorkspaceSharetemplate: TemplateRef<any>) {
    this.workspaceShareFormGroup.controls['versionName'].setValue(this.selectedVersionName);
    this.workspaceShareFormGroup.controls['email'].setValue(null);
    this.selectedEmailList = this.selectedVersion['w_contribtors'];
    this.modalRef = this.modalService.show(WorkspaceSharetemplate, { ignoreBackdropClick: true, keyboard: false });
    this.errorMessageVersion = "";
    this.errorMessageEmail = "";
  }

  onSumbitCloneWorkspace(form: any) {
    this.selectedEmailwithoutOwner();
    const req = {
      _id: this.swichedWorkspaceId,
      contributors: this.selectedEmailListNew
    };
    this.httpClientService.putData(apiEndPoints.workspaceClone, req).subscribe((data: any) => {
      this.toastrService.success('Workspace has been shared successfully', '', this.options);
    }, ((error: any) => {
      this.toastrService.error('Something went wrong', '', this.options);
    }));
    this.modalRef.hide();
  }

  selectedEmailwithoutOwner() {
    this.selectedEmailListNew = [];
    for (var index in this.selectedEmailList) {
      if (this.selectedEmailList[index] !== this.workspaceListById.w_owner) {
        this.selectedEmailListNew.push(this.selectedEmailList[index]);
      }
    }
  }

  updateDocAnalyticsStatus() {
    this.editDocumentData.forEach(doc => {
      const req = {
        document_id: doc._id,
        document_action_status: 'PENDING'
      };
      this.httpClientService.postData(apiEndPoints.saveDocAnalytics, req).subscribe((data: any) => {

      }, ((error: any) => {

      }));
    })

  }
}