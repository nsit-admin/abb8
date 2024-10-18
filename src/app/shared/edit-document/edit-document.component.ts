import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-edit-document',
  templateUrl: './edit-document.component.html',
  styleUrls: ['./edit-document.component.css']
})
export class EditDocumentComponent implements OnInit {

  docEditor: any;

  constructor(
    private dialogRef: MatDialogRef<EditDocumentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { document: string }
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
    this.dialogRef.close(this.docEditor.getData());
  }

  cancel() {
    this.dialogRef.close();
  }

}
