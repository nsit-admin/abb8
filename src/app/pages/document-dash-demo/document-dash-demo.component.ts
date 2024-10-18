import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';
import { HttpClientService } from '@app/common/services/http-client.service';
import { apiEndPoints } from '@app/common/utils/api-endpoint.constant';
import { appConstants } from '@app/common/utils/app.constant';
import * as mammoth from 'mammoth/mammoth.browser.js';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-document-dash-demo',
  templateUrl: './document-dash-demo.component.html',
  styleUrls: ['./document-dash-demo.component.css']
})
export class DocumentDashDemoComponent implements OnInit {
  @ViewChild('docFile') public docFile: ElementRef;
  @ViewChild('uploadedDocumentRef') public uploadedDocumentRef: ElementRef;
  documentList = [];
  public profileObj: any;
  public workSpaceObj: any;
  workSpaceId: any;
  options = { positionClass: appConstants.toaster.rightClassName, timeOut: 3000 };
  uploadedDocument: any;
  classicEditor = DecoupledEditor;

  constructor(
    private httpClientService: HttpClientService, private actRoute: ActivatedRoute,
    public commonfunctionService: CommonfunctionService, private router: Router,
    private toast: ToastrService) { }

  ngOnInit(): void {
    if (this.actRoute.snapshot.params.id) {
      this.workSpaceId = this.actRoute.snapshot.params.id;
      this.workSpaceObj = this.commonfunctionService.getWorkSpaceDetails();
      this.profileObj = this.commonfunctionService.getProfileDetails();
      this.getDocuments();
    }
  }
  /*
  Method for upload the document with the workspace details
 **/
  uploadDoc() {
    const file = this.docFile.nativeElement.files[0];
    const fileReader: FileReader = new FileReader();
    const self = this;
    fileReader.onloadend = (x) => {
      mammoth.convertToHtml({ arrayBuffer: fileReader.result })
        .then((result) => {
          const html = result.value; // The generated HTML
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
              workspaceName: self.workSpaceObj.name,
              documentName: file.name,
              document: this.uploadedDocument,
              created_by: `${self.profileObj.fname} ${self.profileObj.lname}`,
              created_dt: moment().format(),
            };
            self.httpClientService.postData(apiEndPoints.saveDocument, payload).
              subscribe((res: any) => {
                self.getDocuments();
                self.docFile.nativeElement.value = '';
              }, (err) => {
                self.toast.error(appConstants.toaster.doucmentUploadError, '', self.options);
              });
          }, 100);
          const messages = result.messages; // Any messages, such as warnings during conversion
        });
    };
    fileReader.readAsArrayBuffer(file);
  }
  /*
  Method for redirect the edit document page
 **/
  editDocument(doc) {
    this.router.navigate([appConstants.route.documentEdit, doc._id]);
  }
  mergeDocument() {
  }
  getDocuments() {
    const url = `${apiEndPoints.getDocument}${encodeURIComponent(this.workSpaceId)}`;
    this.httpClientService.getData(url).
      subscribe((res: any) => {
        this.documentList = res.data;
      });
  } 

  mergeToMaster() {
    const url = `${apiEndPoints.getMergeStatus}${encodeURIComponent(this.workSpaceId)}`;
    this.httpClientService.getData(url).
      subscribe((res: any) => {
        if (res.mergeStatus == appConstants.Inprogress) {
          this.toast.info(appConstants.toaster.mergeStatus, '', this.options);
        } else {
          this.router.navigate([appConstants.route.mergeDocument, this.workSpaceId]);
        }
      });
  }

  /*
  DecoupledEditor Setup Configuration method
 **/
  public onReady(editor): void {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.view.editable.element,
      editor.ui.getEditableElement()
    );
  }

}
