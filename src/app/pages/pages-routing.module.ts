import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageComponent } from './page.component';
import { DocumentEditComponent } from './document-edit/document-edit.component';
import { MergeDocumentComponent } from './merge-document/merge-document.component';
import { DocumentDashDemoComponent } from './document-dash-demo/document-dash-demo.component';
import { DocumentDashboardComponent } from './document-dashboard/document-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: PageComponent,
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'document-edit/:id/:w_id',
        component: DocumentEditComponent
      },
      {
        path: 'merge-document/:id',
        component: MergeDocumentComponent
      },
      {
        path: 'dash-document/:id',
        component: DocumentDashDemoComponent
      },
      {
        path: 'document-dashboard/:id',
        component: DocumentDashboardComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
