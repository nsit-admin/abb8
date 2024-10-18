import { HttpResponseBase } from '@angular/common/http';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, ElementRef, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgModel, Validators } from '@angular/forms';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, Subscription } from 'rxjs';
import { HttpClientService } from 'src/app/common/services/http-client.service';
import { apiEndPoints } from 'src/app/common/utils/api-endpoint.constant';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { appConstants } from '@app/common/utils/app.constant';
import * as moment from 'moment';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html', //'./dashboard.component copy.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  panelOpenState = true;
  workSpaceCount: any = {};
  documentEditedCount: any = {};
  activeEntries = [];
  view: any[] = [450, 200];
  tagList: string[] = [];
  selectedTagList: string[] = [];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  /* Identifiers for Add workspace */
  public workspaceFormGroup: FormGroup;
  public workspaceObj: any = {};
  public submitted = false;
  errors: any;
  workspaceList: any;
  wTags: any;
  email: any;

  // Identifiers for search Workspace
  searchUrl: any;
  searchField: FormControl;
  // Identifiers for archive Workspace
  element: HTMLElement;

  // Identifiers for Notification
  options = { positionClass: 'toast-bottom-right' };

  id: any;
  // Identifiers for w_contributors list
  contributorsName: string[];
  filteredTags: Observable<string[]>;
  tmp: any = [];
  wContibutors: any;
  arrList: any;
  errorMessage: string;
  modalRef: BsModalRef;
  selectedMenu = 'Last Modified';
  // Google Chart Variables
  chartData: any = {};
  workSpaceChartColor = ['#497ef9'];
  documentChartColor = ['#00c4c4'];
  chartOptions: any = {
    vAxis: {
      minValue: 0,
      gridlines: { color: '#fff', minSpacing: 20 },
      baselineColor: '#fff',
      textStyle: { color: '#fff' }
    },
    hAxis: {
      textStyle: { color: '#fff' }
    },
    legend: {
      position: 'none'
    },
    pointSize: 10,
    height: 100,
    pointsVisible: true
  };
  public profileObj: any;
  notificationData: Array<any> = [];
  totalDoc = 0;
  legendWidth1 = '0%';
  legendWidth2 = '0%';
  legendWidth3 = '0%';
  legend1Percentage = 0;
  legend2Percentage = 0;
  legend3Percentage = 0;
  subscription: Subscription;
  docAnalyticsArr = [];
  draftsDocLength = 0;
  pendingDocLength = 0;
  approvedDocLength = 0;
  firstLegend = '';
  lastLegend = '';
  firstandLastLegend = '';
  constructor(
    public commonfunctionService: CommonfunctionService, private modalService: BsModalService,
    private formBuilder: FormBuilder, private httpClientService: HttpClientService, private toast: ToastrService,
    private router: Router
  ) {
    this.subscription = this.commonfunctionService.getSearchWord().subscribe(currentWord => {
      if (currentWord) {
        this.getSearchData(currentWord.text);
      } else {
        this.getWorkspaceList();
      }
    });
  }

  ngAfterViewInit() {
    this.filteredTags = this.workspaceFormGroup.get('workspaceTagname').valueChanges.pipe(
      startWith(null as string),
      map((tag: string | null) => tag ? this._filter(tag) : this.tagList.slice()));
  }

  ngOnInit(): void {
    this.profileObj = this.commonfunctionService.getProfileDetails();
    this.getWorkSpaceCount();
    this.initializeForm();
    this.getWorkspaceList();
    this.getTagsList();
    this.searchField = new FormControl('');
    this.searchField.valueChanges
      .subscribe(term => {
        if (term !== '') {
          const words = term.split(' ');
          const currentWord = words[words.length - 1];
          term = term.substring(0, term.lastIndexOf(' '));
          if (currentWord.length > 0) {
            if (term.trim().length > 0) {
              term = term + ' ';
            }
            this.getSearchData(currentWord);
          }
        } else {
          this.getWorkspaceList();
        }
      });
    this.getSharedWorkspaceDetails();

    this.receiveNotification()
      .subscribe(data => {
        this.commonfunctionService.isLoading.next(false);
        if (data != 'From Login')
          this.toast.success('You have a New Notification', '');
        this.getSharedWorkspaceDetails();
      });
    // this.getDocAnalytics();
  }

  private initializeForm() {
    this.workspaceFormGroup = this.formBuilder.group({
      workspaceName: ['', [Validators.required, Validators.pattern(/[^ +]/)]],
      workspaceDesc: ['', [Validators.pattern(/[^ +]/)]],
      workspaceTagname: ['', [Validators.pattern(/[^ +]/)]],
    });
  }

  get workspaceForm() {
    return this.workspaceFormGroup.controls;
  }

  openModal(WorkspaceCreatetemplate: TemplateRef<any>) {
    this.getTagsList();
    this.modalRef = this.modalService.show(WorkspaceCreatetemplate, { ignoreBackdropClick: true, keyboard: false });
  }

  onSubmit(form: any) {
    const curDate = moment().format();
    const tagArray = [];
    this.selectedTagList.forEach(a => {
      tagArray.push({ tagName: a });
    }, {});
    const wName = (this.workspaceFormGroup.get('workspaceName').value).trim();
    const workspaceName = this.workspaceList.find((x) => x.w_name.toLowerCase() === wName.toLowerCase());
    if (workspaceName) {
      this.errorMessage = 'Workspace Name already exists';
    } else {
      this.submitted = true;
      this.errors = '';
      if (form.valid) {

        const reqData = {
          w_name: this.workspaceFormGroup.get('workspaceName').value,
          w_desc: this.workspaceFormGroup.get('workspaceDesc').value,
          w_tags: this.selectedTagList,
          created_dt: curDate,
          created_by: `${this.profileObj.fname} ${this.profileObj.lname}`,
          w_owner: atob(JSON.parse(localStorage.getItem('abb8_profile')).email),
        };
        this.httpClientService.postData(apiEndPoints.workspaceCreate, reqData).subscribe((response: any) => {
          this.workspaceFormGroup.reset();
          this.getWorkspaceList();
          this.getWorkSpaceCount();
          this.httpClientService.postData(apiEndPoints.tags, tagArray).subscribe((resp: any) => {
            this.selectedTagList = [];
          }, (err) => {
            this.selectedTagList = [];
            this.errors = err;
          });
        }, (err) => {
          this.errors = err;
        });
        this.toast.success('Workspace has been created successfully', '', this.options);
        this.submitted = false;
        this.modalRef.hide();
      }
    }
  }

  getWorkspaceList() {

    this.email = atob(JSON.parse(localStorage.getItem('abb8_profile')).email);
    const url = `${apiEndPoints.workspaces}?email=${this.email}`;
    this.httpClientService.getData(url).subscribe((response: any) => {
      this.commonfunctionService.loading = false;
      this.workspaceList = response.workspaces;
      this.getWorkSpaceSharedorNot();
      this.getDocumentEditCount();
      this.getDocAnalytics();
      let doc = this.docAnalyticsArr;
      console.log(doc);
      this.commonfunctionService.workSpaceDetails = this.workspaceList
      for (var index in this.workspaceList) {
        this.arrList = this.workspaceList[index].w_tags;
        this.tmp.push(this.arrList);
      }

    }, (err) => {
      this.errors = err;
    });
  }

  // Sort workspace
  sortWorkspaceList(sortValue) {
    const sort = sortValue === 'menu.item2' ? 'created' : 'modified';
    this.selectedMenu = sortValue === 'menu.item2' ? 'Last Created' : 'Last Modified';
    this.email = atob(JSON.parse(localStorage.getItem('abb8_profile')).email);
    const url = `${apiEndPoints.SortList}?email=${this.email}&sort=${sort}`;
    this.httpClientService.getData(url).subscribe((response: any) => {
      this.workspaceList = response.sortedlist;
    }, (err) => {
      this.errors = err;
    });
  }

  // search workspace or tags
  getSearchData(value) {
    const searchData = {
      email: localStorage.getItem('abb8_email') ? atob(localStorage.getItem('abb8_email')) : '',
      searchKey: value
    };
    if (value === '' || null) {
      this.getWorkspaceList();
    } else {
      this.httpClientService.postData(apiEndPoints.searchWorkspace, searchData).subscribe((responseData: any) => {
        this.workspaceList = responseData;
      }, (err) => {
        this.errors = err;
      });
    }
  }

  // Delete workspace
  deleteWorkSpace(id: any, itemId: any) {
    const payload = {
      _id: itemId,
      status: 'InActive'
    };
    this.httpClientService.postData(apiEndPoints.updateWorkspace, payload).subscribe((response: any) => {
      if (response) {
        this.toast.success('Workspace is deleted successfully', '', this.options);
        this.workspaceList.splice(id, 1);
        this.getWorkSpaceCount();
        this.getDocumentEditCount();
      }

    }, (err) => {
      this.toast.error('Unable to update Workspace', '', this.options);
    });
  }

  // Archive Workspace
  archiveWorkSpace(id: any, itemId: any) {
    this.element = document.getElementById('Archiveid') as HTMLElement;
    const payload = {
      _id: itemId,
      status: 'Archived'
    };
    this.httpClientService.postData(apiEndPoints.updateWorkspace, payload).subscribe((response: any) => {
      if (response) {
        this.toast.success('Workspace is archived successfully', '', this.options);
        this.element.setAttribute('disabled', 'true');
        this.element.setAttribute('style', 'background-color:#C0C0C0;');
        this.getWorkSpaceCount();
      }
    }, (err) => {
      this.toast.error('Unable to update Workspace', '', this.options);
    });
  }

  resetForm() {
    this.submitted = false;
    this.workspaceFormGroup.reset();
    this.errorMessage = '';
  }

  public getColors(index: number) {
    index = index < 10 ? index : index - 10;
    switch (index) {
      case 0: return { backgroundColor: '#f3e5f5', color: '#9c27b0' };
      case 1: return { backgroundColor: '#f9fbe7', color: '#cb9418' };
      case 2: return { backgroundColor: '#e1f5fe', color: '#2196F3' };
      case 3: return { backgroundColor: '#e0f7fa', color: '#00bcd4' };
      case 4: return { backgroundColor: '#E3F2FD', color: '#000000' };
      case 5: return { backgroundColor: '#f3e5f5', color: '#9c27b0' };
      case 6: return { backgroundColor: '#f9fbe7', color: '#cb9418' };
      case 7: return { backgroundColor: '#e1f5fe', color: '#2196F3' };
      case 8: return { backgroundColor: '#e0f7fa', color: '#00bcd4' };
      case 9: return { backgroundColor: '#E3F2FD', color: '#000000' };
      default: return { backgroundColor: '#E3F2FD', color: '#000000' };
    }
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
    const color = Math.floor(0x1000000 * Math.random()).toString(16);
    return '#' + ('000000' + color).slice(-6);
  }

  getTags(name: any) {
    const tagsName = name.split(';');
    for (const element of tagsName) {
      if (element === name) {
        break;
      }
    }
    this.wTags = tagsName;
  }

  getContributors(name: any) {
    const contName = name.split(',');
    this.wContibutors = contName;
  }

  /*
   *Method for get the document edit details count
   **/
  getDocumentEditCount() {
    const selectedWorkspaceIds = this.workspaceList.filter(w => (w.status && w.status.toUpperCase() === 'ACTIVE')).map(({ _id }) => _id);
    this.httpClientService.postData(apiEndPoints.allDocumentsDetails, selectedWorkspaceIds).subscribe((response: any) => {
      this.documentEditedCount = response;
      this.totalDoc = response.totalDocuments;
      this.documentEditedCount.chartData.options = {
        colors: this.documentChartColor,
        vAxis: { minValue: 0, maxValue: this.documentEditedCount.totalDocumentsEdited }
      };
      this.chartOptions.colors = this.documentChartColor;
    }, (err) => {
      this.errors = err;
    });


  }

  /*
  Method for get the workspace chart details and count details
 **/
  getWorkSpaceCount() {
    this.email = atob(JSON.parse(localStorage.getItem('abb8_profile')).email);
    const url = `${apiEndPoints.allWorkspacesDetails}?email=${this.email}`;
    this.httpClientService.getData(url).subscribe((response: any) => {
      this.workSpaceCount = response;
      this.workSpaceCount.chartData.options = {
        colors: this.workSpaceChartColor,
        vAxis: { minValue: 0, maxValue: response.totalWorkspaces }
      };
    }, (err) => {
      this.errors = err;
    });
  }

  /*
    Method for redirect the document dashboard page with workspace details
   **/
  onSelectWorkSpace(workSpaceDetails: any) {
    this.commonfunctionService.isLoading.next(true);
    this.commonfunctionService.setWorkSpaceDetails(workSpaceDetails);
    this.router.navigate([appConstants.route.documentDashboard, workSpaceDetails._id]);
  }

  remove(tag: string): void {
    const index = this.selectedTagList.indexOf(tag);

    if (index >= 0) {
      this.selectedTagList.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (event?.option?.value?.length <= 30) {
      this.selectedTagList.push(event.option.viewValue);
    }
    this.workspaceFormGroup.get('workspaceTagname').setValue(null);
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim() && value.length <= 30) {
      this.selectedTagList.push(value.trim());
    }
    if (input) {
      input.value = '';
    }

    this.workspaceFormGroup.get('workspaceTagname').setValue(null);
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();

    return this.tagList.filter(tags => tags.toLowerCase().indexOf(filterValue) === 0);
  }

  getTagsList(e?) {
    this.tagList = [];
    const url = `${apiEndPoints.tags}?tags=${e && e.target.value || ''}`;
    this.httpClientService.getData(url).subscribe((responseData: any) => {
      responseData.data.forEach(element => {
        this.tagList.push(element.tagName);
      });
    }, (err) => {
      this.errors = err;
    });
  }

  getWorkSpaceSharedorNot() {
    this.workspaceList.forEach(element => {
      const url = `${apiEndPoints.getWorkspaceByWorkspaceName}${encodeURIComponent(element['w_name'])}`;
      this.httpClientService.getData(url).subscribe((response: any) => {
        let data = response.data;
        data = data.filter(w => (w.w_owner == this.email));
        if (data && data.length > 1) {
          element['sharedVersion'] = true;
        }
        else {
          element['sharedVersion'] = false;
        }
      }, (err) => {
        this.errors = err;
      });
    });
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

  getDocAnalytics() {
    let workspaceMasterIdArr = [];
    let workspaceId;
    this.docAnalyticsArr = [];
    let apiCallReqd = true;
    this.workspaceList.map(element => {
      if (element.status = 'Active') {
        if (element.hasOwnProperty('w_master_id') && workspaceMasterIdArr.indexOf(element['w_master_id']) > -1) {
          apiCallReqd = false;
        }
        else {
          apiCallReqd = true;
        }
        if (element.hasOwnProperty('w_master_id')) {
          workspaceId = element['w_master_id'];
          workspaceMasterIdArr.push(workspaceId);
        }
        else {
          workspaceId = element['_id']
        }
        if (apiCallReqd) {
          const url = `${apiEndPoints.getDocAnalytics}?workspaceId=${workspaceId}`;
          this.httpClientService.getData(url).subscribe((responseData: any) => {
            responseData['data'].map(element => {
              this.docAnalyticsArr.push(element);
              this.parseDocAnalytics();
            });
          }, (err) => {
            this.errors = err;
          });
        }
      }
    });
  }

  parseDocAnalytics() {

    let totalDoc = this.docAnalyticsArr.length;
    const drafts = this.docAnalyticsArr.filter(w => (w.document_action_status && w.document_action_status.toUpperCase() === 'DRAFTS'));
    const pending = this.docAnalyticsArr.filter(w => (w.document_action_status && w.document_action_status.toUpperCase() === 'PENDING'));
    const approved = this.docAnalyticsArr.filter(w => (w.document_action_status && w.document_action_status.toUpperCase() === 'APPROVED'));
    this.legend1Percentage = (approved.length / totalDoc) * 100;
    this.legend2Percentage = (pending.length / totalDoc) * 100;
    this.legend3Percentage = (drafts.length / totalDoc) * 100;
    this.legendWidth1 = this.legend1Percentage + '%';
    this.legendWidth2 = this.legend2Percentage + '%';
    this.legendWidth3 = this.legend3Percentage + '%';
    this.draftsDocLength = drafts.length;
    this.pendingDocLength = pending.length;
    this.approvedDocLength = approved.length;
    this.setFirstFlag(approved, pending, drafts);
    this.setLastFlag(approved, pending, drafts);
    this.setFirstandLastFlag();
  }

  setFirstFlag(approved, pending, drafts) {
    if (approved.length > 0) {
      this.firstLegend = "APPROVED"
    } else if (pending.length > 0) {
      this.firstLegend = "PENDING"
    } else if (drafts.length > 0) {
      this.firstLegend = "DRAFTS"
    }
  }
  setLastFlag(approved, pending, drafts) {
    if (drafts.length > 0) {
      this.lastLegend = "DRAFTS";
    } else if (pending.length > 0) {
      this.lastLegend = "PENDING";
    } else if (approved.length > 0) {
      this.lastLegend = "APPORVED";
    }
  }

  setFirstandLastFlag() {
    if (this.firstLegend == 'APPROVED' && this.lastLegend == "APPROVED") {
      this.firstandLastLegend = "APPROVED";
    }
    else if (this.firstLegend == 'PENDING' && this.lastLegend == "PENDING") {
      this.firstandLastLegend = "PENDING";
    }
    else if (this.firstLegend == 'DRAFTS' && this.lastLegend == "DRAFTS") {
      this.firstandLastLegend = "DRAFTS";
    }
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
}