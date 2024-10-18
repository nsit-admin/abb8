import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { NgxYoutubePlayerModule } from 'ngx-youtube-player';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PagesRoutingModule } from './pages-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PipesModule } from '@app/common/pipes/pipes.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DocumentEditComponent } from './document-edit/document-edit.component';
import { PageComponent } from './page.component';
import { MergeDocumentComponent } from './merge-document/merge-document.component';
import { DocumentDashDemoComponent } from './document-dash-demo/document-dash-demo.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
// import { CKEditorModule } from 'ckeditor4-angular';
import { GoogleChartsModule } from 'angular-google-charts';
import { MaterialModule } from '@app/shared/material.module';
import { DocumentDashboardComponent } from './document-dashboard/document-dashboard.component';
import { DragDropFileUploadDirective } from './document-dashboard/drag-drop-file-upload.directive';
import Amplify, {Interactions } from 'aws-amplify';
Amplify.configure({
  Auth: {
    identityPoolId: 'us-east-1:a50e43b4-f423-4336-8d99-074d7ae80fc2',
    region: 'us-east-1'
  },
  Interactions: {
    bots: {
      "AbbreviaRedCrossMSA": {
        "name": "AbbreviaRedCrossMSA",
        "alias": "redCrossMSA",
        "region": "us-east-1",
      },
    }
  }
});
@NgModule({
  declarations: [DashboardComponent, DocumentEditComponent, PageComponent, MergeDocumentComponent, DocumentDashDemoComponent, DocumentDashboardComponent, DragDropFileUploadDirective],
  imports: [
    CommonModule,
    PagesRoutingModule,
    SharedModule,
    NgbModule,
    NgxYoutubePlayerModule.forRoot(),
    ScrollToModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxChartsModule,
    ModalModule.forRoot(),
    PipesModule,
    CKEditorModule,
    MatMenuModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
    GoogleChartsModule,
    MaterialModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule { }
