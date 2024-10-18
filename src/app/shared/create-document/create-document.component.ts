import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { appConstants } from '@app/common/utils/app.constant';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-create-document',
  templateUrl: './create-document.component.html',
  styleUrls: ['./create-document.component.css']
})
export class CreateDocumentComponent implements OnInit,AfterViewInit {
  public docEditor: any;
  public fileName = '';
  // Identifiers for Notification
  options = { positionClass: appConstants.toaster.centerClassName,countDuplicates : true ,preventDuplicates: true};
  constructor(
    private dialogRef: MatDialogRef<CreateDocumentComponent>,private toast: ToastrService,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    DecoupledEditor
    .create( document.querySelector( '.document-editor__editable' ) )
    .then( editor => {
        const toolbarContainer = document.querySelector( '.document-editor__toolbar' );
        toolbarContainer.appendChild( editor.ui.view.toolbar.element );
        this.docEditor = editor;
    } )
    .catch( err => {
        console.error( err );
    } );
  }
  save() {
    if(this.fileName){
      const createDocumentPayload = {
        fileName:`${this.fileName}.${appConstants.DOCX}`,
        document:this.docEditor.getData()
      }
      this.dialogRef.close(createDocumentPayload);
    }else{
      if(!this.fileName && !this.docEditor.getData()){
        this.toast.error(appConstants.toaster.createDocumentValidation, '', this.options);
      }else if(!this.docEditor.getData()){
        this.toast.error(appConstants.toaster.createDocuContentReq, '', this.options);
      }else if(!this.fileName){
        this.toast.error(appConstants.toaster.createDocuFileNameReq, '', this.options);
      }
    }
  }

  cancel() {
    this.dialogRef.close();
  }


}
