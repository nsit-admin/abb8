import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';
import { HttpClientService } from '@app/common/services/http-client.service';
import { appConstants } from '@app/common/utils/app.constant';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ToastrService } from 'ngx-toastr';
import { apiEndPoints } from 'src/app/common/utils/api-endpoint.constant';
import * as moment from 'moment';
//import * as moment from 'moment-timezone';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { MatDialog } from '@angular/material/dialog';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Interactions } from 'aws-amplify';
import { chatbotFile } from '@app/common/utils/chatbot-file';

import { Confidentiality, conflitOfInt, ContractorDiverisy, ContratServices, CustomerProperty, Disaster, Generic, GoverningLaw, ImplementationAndAcceptance, Indemnification, Insuarnce, IntellecutalProperty, InvoicingAndPayment, LimitationOfLiablity, Miscellaneous, RecordsAudit, relationShipofParties, RepresentationAndWarrenties, Safeguarding, ScheduleC, ScheduleD, ScheudleB, section_1, softwareLicense, TermTermination } from '@app/common/utils/chatbot-file-broken';
import { chatbotConstants } from '@app/common/utils/chatbot.constant';
import { YesOrNoSlots, Payment_Terms } from '@app/common/utils/chatbot-slot.constants';
import { IntentList } from '@app/common/utils/chatbot-intent.constants';
//import { Console } from 'console';


@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.css']
})
export class DocumentEditComponent implements OnInit, AfterViewInit {
  @ViewChild(appConstants.docList, { static: true }) docListView: any;
  @ViewChild('chatMsg') private scrollBottom: ElementRef;
  @ViewChild("messageValue") messageField: ElementRef;
  @ViewChild('chatConv') chatConv: ElementRef;
  docEditor: any;
  documentId: any;
  documentObj: any = {};
  documentList: any;
  chatData: any = ``;
  public profileObj: any;
  public workSpaceObj: any;
  public docListWidth: any;
  public loading = false;
  commonSection: any;
  modalRef: BsModalRef;
  conversation: string;
  message: string;
  // Identifiers for Notification
  options = { positionClass: appConstants.toaster.rightClassName, timeOut: 7000 };

  //Identifiers for document conversation
  userName = '';
  userEmail = '';
  allUsersOnline = [];
  messageText: string;
  errors: any;
  workspaceList: any[] = [];
  workspaceName: any;
  historyMessages = [];
  instantMessage: Array<{ user: string, message: string, time: string, email: string }> = [];
  senderEmail: any;
  chatFormGroup: FormGroup;
  documentName: any;
  room: any;
  workspaceData: any;
  isChatOpen: any = false;
  showChat: boolean = false;
  yesOrNoSlots = [];
  currentResponse: any;

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event) {
    this.docListWidth = this.docListView.nativeElement.offsetWidth - 100;
  }

  @HostListener('document:click', ['$event'])
  public onClick(event: any): void {
    if (event.target.className.includes('chat-action')) {
      if (this.currentResponse.slotToElicit === Payment_Terms) {
        event.target.className = 'chat-action btn left btn-primary ml-2 mb-2';
        event.target.attributes.style.value = 'color: #ffff;';
      } else {
        event.target.className = 'chat-action btn right btn-primary mr-2';
        event.target.attributes.style.value = 'color: #ffff; width: 20%;';
      }
      this.conversation = this.chatConv.nativeElement.innerHTML;
      this.handleChatAction(event.target.outerText.trim());
    }
  }

  constructor(
    private httpClientService: HttpClientService, private actRoute: ActivatedRoute,
    public commonfunctionService: CommonfunctionService, private toast: ToastrService, private formBuilder: FormBuilder, public dialog: MatDialog, private modalService: BsModalService) { }

  ngOnInit(): void {
    this.instantMessage = [];
    this.initializeForm();
    this.senderEmail = atob(JSON.parse(localStorage.getItem('abb8_profile')).email);
    this.profileObj = localStorage.getItem('abb8_profile') ? JSON.parse(localStorage.getItem('abb8_profile')) : {};
    if (this.profileObj) {
      this.profileObj.fname = atob(this.profileObj.fname);
      this.profileObj.lname = atob(this.profileObj.lname);
      this.profileObj.email = atob(this.profileObj.email);
    }
    if (this.actRoute.snapshot.params.id && this.actRoute.snapshot.params.w_id) {
      this.documentId = this.actRoute.snapshot.params.id;
      this.workSpaceObj = this.commonfunctionService.getWorkSpaceDetails();
      this.getDocumentsDetails(this.documentId);
      this.getWorkspaceData(this.actRoute.snapshot.params.w_id);
      this.getDocuments(this.actRoute.snapshot.params.w_id);
    }
    if ((this.profileObj.email.indexOf('abbrevia8.com') > -1)
    || (this.profileObj.email.indexOf('irie.com') > -1)
    || (this.profileObj.email.indexOf('mazosol.com') > -1)
    || (this.profileObj.email.indexOf('redcross.org') > -1)) {
    this.showChat = true;
  }
  }

  ngAfterViewInit(): void {
    this.docListWidth = this.docListView.nativeElement.offsetWidth - 100;
    DecoupledEditor
      .create(document.querySelector('.document-editor__editable'))
      .then(editor => {
        const toolbarContainer = document.querySelector('.document-editor__toolbar');
        toolbarContainer.appendChild(editor.ui.view.toolbar.element);
        this.docEditor = editor;
      })
      .catch(err => {
        console.error(err);
      });
  }


  // ngAfterViewChecked() {
  //   this.scrollToBottom();
  // }

  scrollToBottom(): void {
    try {
      this.scrollBottom.nativeElement.scrollTop = this.scrollBottom.nativeElement.scrollHeight;
    } catch (err) { }
  }

  /*
    Method for get the all documents
   **/
  getDocuments(workspaceId): void {
    const url = `${apiEndPoints.getDocument}${encodeURIComponent(workspaceId)}`;
    this.httpClientService.getData(url).subscribe((res: any) => {
      this.documentList = res.data;
    }, (err) => {
      this.toast.error(appConstants.toaster.documentGetError, '', this.options);
    });
  }
  /*
  Method for get the selected document details
 **/
  getDocumentsDetails(documentId: any) {
    this.loading = true;
    const url = `${apiEndPoints.getDocumentDetails}${encodeURIComponent(documentId)}`;
    this.httpClientService.getData(url).subscribe((res: any) => {
      if (res.data && res.data.length > 0) {
        this.documentObj = res.data[0];
        this.docEditor.setData(this.documentObj.documentHtml);
        this.documentName = this.documentObj.documentName;
        if (this.documentName != null) {
          this.receiveHistoryMessages(this.documentName);
          this.userName = this.profileObj.fname + " " + this.profileObj.lname;
          this.userEmail = this.profileObj.email;
          this.newUser({ user: this.userName, email: this.userEmail, room: this.workSpaceObj.name + " : " + this.documentName });
          this.room = this.workSpaceObj.name + " : " + this.documentName;
          this.newMessageReceived()
            .subscribe(data => {
              this.instantMessage.unshift(data);
              this.messageText = '';
            });
          this.allOnlineUsers(this.room)
            .subscribe(data => this.allUsersOnline = data);
        }
        this.loading = false;
      }
    }, (err) => {
      this.loading = false;
      this.toast.error(appConstants.toaster.documentGetError, '', this.options);
    });
  }
  /*
    Method for show the selected document
   **/
  documentSelect(id): void {
    this.instantMessage = [];
    this.documentId = id;
    this.getDocumentsDetails(this.documentId);

  }
  /*
    Method for save for edited document
   **/
  saveEditedDoc(isFinalSave?: boolean): void {
    this.documentObj.modified_by = `${this.profileObj.fname} ${this.profileObj.lname}`;
    this.documentObj.modified_dt = moment().format();
    this.documentObj.w_name = this.workspaceData.w_name;
    this.documentObj.documentHtml = this.docEditor.getData();
    this.documentObj.owner_email = this.workspaceData.w_owner;
    this.documentObj.isFinalSave = isFinalSave;
    const url = `${apiEndPoints.editDocument}${encodeURIComponent(this.documentObj._id)}`;
    console.log("obbb", this.documentObj);
    this.httpClientService.putData(url, this.documentObj).
      subscribe((res: any) => {
        const docSuccessMsg = isFinalSave ? appConstants.toaster.documentEditConfirmSuccess : appConstants.toaster.documentEditSuccess;
        this.toast.success(docSuccessMsg, '', this.options);
        this.getDocuments(this.workspaceData._id);
        this.sendNotification();

      }, (err) => {
        this.toast.error(appConstants.toaster.documentEditError, '', this.options);
      });
  }
  /*
   Method for trigger the merge process for review
  **/
  submitToReview(isFinalSave?: boolean) {
    const url = `${apiEndPoints.getDocumentMergeStatus}${encodeURIComponent(this.documentObj._id)}`;
    this.httpClientService.getData(url).
      subscribe((res: any) => {
        if (res.mergeStatus == appConstants.Inprogress) {
          this.toast.info(appConstants.toaster.documentMergeStatus, '', this.options);
        } else {
          this.saveEditedDoc(isFinalSave);
        }
      });
    this.saveDocAnalytics();
  }
  /*
   DecoupledEditor Setup Configuration method
  **/
  public onReady(editor): void {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }

  sendNotification() {
    this.httpClientService.socket.emit('create notification', 'Notification Test');
  }

  ngOnDestroy() {
    this.leaveRoom({ user: this.userName, room: this.workSpaceObj.name + " - " + this.documentName });
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
      name: this.profileObj.fname + ' ' + this.profileObj.lname,
      email: this.profileObj.email,
      message: this.messageText,
      w_name: this.workSpaceObj.name,
      doc_name: this.documentName,
      date: new Date().toDateString(),
      time: to12HourtimeString
    };
    this.senderEmail = emitData.email;
    this.httpClientService.socket.emit('message', { room: emitData.w_name + " : " + emitData.doc_name, user: emitData.name, email: emitData.email, message: emitData.message, Time: emitData.time });
    var currentDateToCstTime = currentdate.toLocaleString('en-US', { timeZone: 'America/Chicago' }).replace(',', '');
    console.log('currentDateToCstTime', currentDateToCstTime);
    const saveMsg =
    {
      name: this.profileObj.fname + ' ' + this.profileObj.lname,
      email: this.senderEmail,
      message: this.messageText,
      w_name: this.workSpaceObj.name,
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
    const docName = this.workSpaceObj.name + ":" + documentName;
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

  getWorkspaceData(workspaceId: any) {
    const url = `${apiEndPoints.getWorkspaceById}${encodeURIComponent(workspaceId)}`;
    this.httpClientService.getData(url).subscribe((res: any) => {
      if (res && res.data) {
        this.workspaceData = res.data;
      }
    }, (error: any) => {
    });
  }

  saveDocAnalytics() {
    let workspaceId;
    if (this.workspaceData.hasOwnProperty('w_master_id')) {
      workspaceId = this.workspaceData['w_master_id']
    }
    else {
      workspaceId = this.workspaceData['_id']
    }
    const data = {
      documentName: this.documentObj.documentName,
      workspaceId: workspaceId,
      document_action_status: "DRAFTS",
      w_name: this.workspaceData.w_name,
      created_dt: moment().format(),
      document_id: this.documentId
    }
    this.httpClientService.postData(apiEndPoints.saveDocAnalytics, data).subscribe((response: any) => {

    }, (err) => {
      this.errors = err;
    });
  }

  async openModal() {
    this.isChatOpen = !this.isChatOpen;
    var rr = await Interactions.send("AbbreviaRedCrossMSA", "Hi");
    // this.conversation = `<br> <div style="background-color: #fff;
    // padding: 0.70rem;
    // font-size: 0.80rem;
    // border-radius: 20px 20px 20px 5px;
    
    // font-family: 'Poppins', sans-serif;
    // clear: right;"> 
    // <b>Abbrevia8 Assistant</b><br> Hello ${this.profileObj.fname}!! Welcome to Abbrevia8 assistant! <br> Lets get started with Standard Section of the contract </div>`;
    this.conversation = ``;
    this.conversation = this.conversation + ` <br> <div style="background-color: #fff;
    padding: 0.70rem;
    font-size: 0.80rem;
    border-radius: 20px 20px 20px 5px;
    font-family: 'Poppins', sans-serif;
    clear: right;
    overflow-wrap: break-word;
    "> 
      <b>Abbrevia8 Assistant</b><br> ${rr.message} </div>`;
    var texts = document.getElementsByClassName('chat-wrapper') as HTMLCollectionOf<HTMLElement>;
    for (var i = 0; i < texts.length; i++) {
      texts[i].style.display = "block";
    }
    this.messageField.nativeElement.focus();
    // var texts = document.getElementsByClassName('chatbox__icon') as HTMLCollectionOf<HTMLElement>;
    // for (var i = 0; i < texts.length; i++) {
    //   texts[i].style.display = "none";
    // }
  }

  async closeModal() {
    this.message = '';
    this.isChatOpen = false;
    await Interactions.send("AbbreviaRedCrossMSA", "Exit");
    // this.conversation = `<br> <div style="background-color: #fff;
    // padding: 0.70rem;
    // font-size: 0.80rem;
    // border-radius: 20px 20px 20px 5px;

    // font-family: 'Poppins', sans-serif;
    // clear: right;"> 
    // <b>Abbrevia8 Assistant</b><br> Hello ${this.profileObj.fname}!! Welcome to Abbrevia8 assistant! <br> Lets get started with Standard Section of the contract </div>`;
    var texts = document.getElementsByClassName('chat-wrapper') as HTMLCollectionOf<HTMLElement>;
    for (var i = 0; i < texts.length; i++) {
      texts[i].style.display = "none";
    }
    var texts = document.getElementsByClassName('chatbox__icon') as HTMLCollectionOf<HTMLElement>;
    for (var i = 0; i < texts.length; i++) {
      texts[i].style.display = "inline-block";
    }
  }

  async startChat(event) {
    event.preventDefault();
    if(this.message){
      // Provide a bot name and user input
      this.updateMessage(this.message);

      const response = await Interactions.send("AbbreviaRedCrossMSA", this.message.toString());
      //Log chatbot response
      this.message = '';
      this.handleChatResponse(response);
    }
  }

  updateMessage(message: string) {
    this.conversation = this.conversation + `<br> <div style="background-color: #D3D3D3;
      color: #000;
      border-radius: 20px 20px 5px 20px;
      text-align: right;
      padding: 0.70rem;
      font-size: 0.80rem;
      font-family: 'Poppins', sans-serif;
      clear: both;
      overflow-wrap: break-word"> 
      <b>${this.profileObj.fname}</b><br> ${message} </div>`;

    setTimeout(() => {
      this.scrollToBottom();
    }, 500);
  }

  isValueYes(value: string): boolean {
    let val = value.toLocaleLowerCase();
    return val === 'y' || val === 'yes';
  }

  handleChatResponse(response: any) {
    if (response) {

      if (response.message) {
        this.currentResponse = response;
        let conv = this.conversation + `<br> <div style="background-color: #fff;
        padding: 0.70rem;
        font-size: 0.80rem;
        border-radius: 20px 20px 20px 5px;
        font-family: 'Poppins', sans-serif;
        clear: right;"> 
        <b>Abbrevia8 Assistant</b><br> ${response.message} </div>` ;

        if (response.dialogState == "Fulfilled" || YesOrNoSlots.includes(response.slotToElicit)) {
          conv = conv + `<div class="pt-2" style="margin-bottom: 2.4rem;">
          <a class="chat-action btn right btn-outline-primary mr-2" 
           style="color: #3965d7;width: 20%;background-color: #fff;border: 1px solid #3965d7;"> No </a>
          <a class="chat-action btn right btn-outline-primary mr-2" 
           style="color: #3965d7;width: 20%;background-color: #fff;border: 1px solid #3965d7;"> Yes </a>
          </div>`
        } else if (response.slotToElicit === Payment_Terms) {
          conv = conv + `<div class="pt-2" style="margin-bottom: 5.6rem;">
          <a class="chat-action btn left btn-outline-primary ml-2 mb-2"
           style="color: #3965d7;background-color: #fff;border: 1px solid #3965d7;"> NET 30 </a>
          <a class="chat-action btn left btn-outline-primary ml-2 mb-2"
           style="color: #3965d7;background-color: #fff;border: 1px solid #3965d7;"> NET 45 </a>
          <a class="chat-action btn left btn-outline-primary ml-2 mb-2"
           style="color: #3965d7;background-color: #fff;border: 1px solid #3965d7;"> NET 60 </a>
          <a class="chat-action btn left btn-outline-primary ml-2 mb-2"
           style="color: #3965d7;background-color: #fff;border: 1px solid #3965d7;"> 2% 15 NET 45 </a>
          <a class="chat-action btn left btn-outline-primary ml-2 mb-2"
           style="color: #3965d7;background-color: #fff;border: 1px solid #3965d7;"> OTHER </a>
          </div>`
        }

        this.conversation = conv;
      }

      if (response.dialogState == "Fulfilled") {

        if (response.intentName == "Generic") {
          this.commonSection = response.slots;
    
          let str = Generic;
          str = str.replace('[Contractor]', this.commonSection.Contractor_Name);
          str = str.replace('[Contractor_Name]', this.commonSection.Contractor_Name);
          str = str.replace('[Service_Description]', this.commonSection.Service_Description);
          str = str.replace('[Effective_Date]', this.commonSection.Effective_Date);
          str = str.replace('[Expiration_Date]', this.commonSection.Expiration_Date);
          str = str.replace('[Payment_Terms]', this.commonSection.Payment_Terms);
          str = str.replace('[Total_Value]', this.commonSection.Total_Value);
          str = str.replace('[Services_On_Site]', this.commonSection.Services_On_Site);
          str = str.replace('[Supplier_Details]', this.commonSection.Supplier_Details);
          str = str.replace('[Manager_Details]', this.commonSection.Manager_Details);
    
          this.chatData = str;
          this.docEditor.setData(this.chatData);
        }
    
        if (response.intentName == "Definition") {
          this.commonSection = response.slots;
    
          let str = section_1;
          str = str.replace('[Consulting_Services_Def]', this.isValueYes(this.commonSection.Consulting_Services) ? chatbotConstants.Definition.Consulting_Services : `“<b>Consulting Services</b>” :`+chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Milestone]', this.isValueYes(this.commonSection.Milestone) ? chatbotConstants.Definition.Milestone : `“<b>Milestone</b>” :`+chatbotConstants.IntentionallyOmitted);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }
    
        if (response.intentName == "ContractorServices") {
          this.commonSection = response.slots;
    
          let str = ContratServices;
          str = str.replace('[Integration_of_Software]', this.isValueYes(this.commonSection.Integration_of_Software) ? chatbotConstants.ContractorServices.Integration_of_Software : `<u>Integration of Software</u> :`+chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Hosting_and_Storage_Sites]', this.isValueYes(this.commonSection.Hosting_and_Storage_Sites) ? chatbotConstants.ContractorServices.Hosting_and_Storage_Sites : `<u>Hosting and Storage Sites</u> : ` +chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Backup_and_Recovery]', this.isValueYes(this.commonSection.Hosting_and_Storage_Sites) ? chatbotConstants.ContractorServices.Backup_and_Recovery : `<u>Backup and Recovery of Customer Data</u> :`+chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Training_Services]', this.isValueYes(this.commonSection.Training_Services) ? chatbotConstants.ContractorServices.Training_Services : `<u>Training Services</u> :`+chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Service_Site]', this.isValueYes(this.commonSection.Service_Site) ? chatbotConstants.ContractorServices.Service_Site : `<u>Service Site</u> :`+chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Service_Level_Commitments]', this.isValueYes(this.commonSection.Service_Level_Commitments) ? chatbotConstants.ContractorServices.Service_Level_Commitments : `<u>Service Level Commitments</u> :`+chatbotConstants.IntentionallyOmitted);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }
    
        if (response.intentName == "ImplementationAndAcceptance") {
          this.commonSection = response.slots;
    
          let str = ImplementationAndAcceptance;
          str = str.replace('[Consulting_Services]', this.isValueYes(this.commonSection.Consulting_Services) ? chatbotConstants.ImplementationAndAcceptance.Consulting_Services : `<u>Consulting Services</u> :`+chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Implementation_Schedule]', this.isValueYes(this.commonSection.Implementation_Schedule) ? chatbotConstants.ImplementationAndAcceptance.Implementation_Schedule : `<u>Implementation Schedule</u> :`+chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Acceptance_Period]', this.isValueYes(this.commonSection.Implementation_Schedule) ? chatbotConstants.ImplementationAndAcceptance.Acceptance_Period : `<u>Acceptance Period</u> :`+chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Change_Order_Process]', this.isValueYes(this.commonSection.Change_Order_Process) ? chatbotConstants.ImplementationAndAcceptance.Change_Order_Process : `<u>Change Order Process</u> :`+chatbotConstants.IntentionallyOmitted);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }
    
        if (response.intentName == "SoftwareLicense") {
          this.commonSection = response.slots;
    
          let str = softwareLicense;
          str = str.replace('[Third_Party_Materials]', this.isValueYes(this.commonSection.Third_Party_Materials) ? chatbotConstants.SoftwareLicense.Third_Party_Materials : ``+chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Pending_Changes]', this.isValueYes(this.commonSection.Pending_Changes) ? chatbotConstants.SoftwareLicense.Pending_Changes : ``+chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Known_Defects]', this.isValueYes(this.commonSection.Pending_Changes) ? chatbotConstants.SoftwareLicense.Known_Defects : ``+chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Source_Codes]', this.isValueYes(this.commonSection.Third_Party_Materials) ? chatbotConstants.SoftwareLicense.Source_Codes : ``+chatbotConstants.IntentionallyOmitted);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }
    
        if (response.intentName == "InvoicingAndPayment") {
          this.commonSection = response.slots;
    
          let str = InvoicingAndPayment;
          str = str.replace('[Invoice_Payment_Terms]', this.commonSection.Invoice_Payment_Terms);
          str = str.replace('[Early_Payment_Discount]', this.isValueYes(this.commonSection.Early_Payment_Discount) ? chatbotConstants.InvoicingAndPayment.Early_Payment_Discount : ``+chatbotConstants.IntentionallyOmitted);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }
    
        if (response.intentName == "TermTerminationAndSurvival") {
          this.commonSection = response.slots;
    
          let str = TermTermination + Indemnification + Insuarnce + LimitationOfLiablity;
          str = str.replace('[Term_Months]', this.commonSection.Term_Months);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }
    
        if (response.intentName == "IntellectualProperty") {
          this.commonSection = response.slots;
    
          let str = IntellecutalProperty + Confidentiality;
          str = str.replace('[Ownership_of_Materials]', this.isValueYes(this.commonSection.Ownership_of_Materials) ? chatbotConstants.IntellectualProperty.Ownership_of_Materials : chatbotConstants.IntentionallyOmitted);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }

        if (response.intentName == "Safeguarding") {
          this.commonSection = response.slots;
    
          let str = Safeguarding + RepresentationAndWarrenties;
          str = str.replace('[Safeguarding_Customer_Data]', this.isValueYes(this.commonSection.Safeguarding_Customer_Data) ? chatbotConstants.Safeguarding.Safeguarding_Customer_Data : '');
          str = str.replace('[Maintenance_of_Safeguards]', this.isValueYes(this.commonSection.Maintenance_of_Safeguards) ? chatbotConstants.Safeguarding.Maintenance_of_Safeguards : '');
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }

        if (response.intentName == "RelationshipOfTheParties") {
          this.commonSection = response.slots;
    
          let str = relationShipofParties + conflitOfInt;
          str = str.replace('[Contract_Services_On_Site]', this.isValueYes(this.commonSection.Services_On_Site) ? chatbotConstants.RelationshipOfTheParties.Services_On_Site :  chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Customized_Services]', this.isValueYes(this.commonSection.Customized_Services) ? chatbotConstants.RelationshipOfTheParties.Customized_Services :  chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Mission_Critical_Services]', this.isValueYes(this.commonSection.Mission_Critical_Services) ? chatbotConstants.RelationshipOfTheParties.Mission_Critical_Services :  chatbotConstants.IntentionallyOmitted);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }

        if (response.intentName == "ContractorDiversity") {
          this.commonSection = response.slots;
    
          let str =  ContractorDiverisy + RecordsAudit;
          str = str.replace('[WDMBE_or_SBE]', this.isValueYes(this.commonSection.WDMBE_or_SBE) ? chatbotConstants.ContractorDiversity.WDMBE_or_SBE :  chatbotConstants.IntentionallyOmitted);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }

        if (response.intentName == "CustomerProperty") {
          this.commonSection = response.slots;
    
          let str = CustomerProperty;
          str = str.replace('[Customer_Property]', this.isValueYes(this.commonSection.Customer_Property) ? chatbotConstants.CustomerProperty.Customer_Property :  chatbotConstants.IntentionallyOmitted);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }

        if (response.intentName == "GoverningLaw") {
          this.commonSection = response.slots;
    
          let str = GoverningLaw;
          str = str.replace('[Governing_Law]', this.isValueYes(this.commonSection.Governing_Law) ? chatbotConstants.GoverningLaw.Governing_Law :  chatbotConstants.IntentionallyOmitted);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }

        if (response.intentName == "DisasterRecovery") {
          this.commonSection = response.slots;
    
          let str = Disaster;
          str = str.replace('[Disaster_Recovery]', this.isValueYes(this.commonSection.Disaster_Recovery) ? chatbotConstants.DisasterRecovery.Disaster_Recovery :  chatbotConstants.IntentionallyOmitted);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }

        if (response.intentName == "Miscellaneous") {
          this.commonSection = response.slots;
    
          let str = Miscellaneous;
          str = str.replace('[Supplier_Contact]', this.commonSection.Supplier_Contact);
          str = str.replace('[Regulated_Services]', this.isValueYes(this.commonSection.Regulated_Services) ? chatbotConstants.Miscellaneous.Regulated_Services :  chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Supplier_Approval_Program]', this.isValueYes(this.commonSection.Regulated_Services) ? chatbotConstants.Miscellaneous.Supplier_Approval_Program :  chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Government_Required_Provisions]', this.isValueYes(this.commonSection.Government_Required_Provisions) ? chatbotConstants.Miscellaneous.Government_Required_Provisions :  chatbotConstants.IntentionallyOmitted);
          str = str.replace('[Category_Manager_Name]', this.commonSection.Category_Manager_Name);
          str = str.replace('[Category_Manager_Title]', this.commonSection.Category_Manager_Title);
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }

        if (response.intentName == "ScheduleB") {
          this.commonSection = response.slots;
    
          let str = ScheudleB;
          str = str.replace('[Service_Level_Agreement]', this.isValueYes(this.commonSection.Service_Level_Agreement) ? chatbotConstants.ScheduleB.Service_Level_Agreement :  '');
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }

        if (response.intentName == "ScheduleC") {
          this.commonSection = response.slots;
    
          let str = ScheduleC + ScheduleD;
          str = str.replace('[Travel_Reimbursement_Policy]', this.isValueYes(this.commonSection.Travel_Reimbursement_Policy) ? chatbotConstants.ScheduleC.Travel_Reimbursement_Policy :  '');
          this.chatData = this.chatData + str;
          this.docEditor.setData(this.chatData);
        }

      }

      if (response.intentName == "Exit") {
        this.chatData = this.chatData;
        this.docEditor.setData(this.documentObj.documentHtml + "<br>" + this.chatData + "<br>");
        this.conversation = `<br> <div style="
        background-color: #fff;
        padding: 0.70rem;
        font-size: 0.80rem;
        border-radius: 20px 20px 20px 5px;
        font-family: 'Poppins', sans-serif;
        clear: right;
        overflow-wrap: break-word;"> 
        <b>Abbrevia8 Assistant</b><br> Hello ${this.profileObj.fname}!! Welcome to Abbrevia8 assistant! <br> Lets get started with Standard Section of the contract </div>`;
        this.closeModal();
      }

      setTimeout(() => {
        this.scrollToBottom();
      }, 500);

    }
  }

  async handleChatAction(value: string) {
    let msg = '';
    if (this.currentResponse && this.currentResponse.dialogState == "Fulfilled" && value === "Yes") {
      msg = IntentList[IntentList.indexOf(this.currentResponse.intentName) + 1];
    } else {
      msg = value;
    }
    const response = await Interactions.send("AbbreviaRedCrossMSA", msg);
    this.handleChatResponse(response);
  }

}