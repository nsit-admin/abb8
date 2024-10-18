import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeaturesComponent } from './features/features.component';
import { PricingComponent } from './pricing/pricing.component';
import { BlogComponent } from './blog/blog.component';
import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';
import { ServicesComponent } from './services/services.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SwitcherComponent } from './switcher/switcher.component';
import { ScrollspyDirective } from './scrollspy.directive';
import { PopupComponent } from './popup/popup.component';
import { AcceptanceComponent } from './acceptance/acceptance.component';
import { LoaderComponent } from './loader/loader.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditDocumentComponent } from './edit-document/edit-document.component';
import { PipesModule } from '@app/common/pipes/pipes.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CreateDocumentComponent } from './create-document/create-document.component';
import { MaterialModule } from './material.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  // tslint:disable-next-line: max-line-length
  declarations: [FeaturesComponent, PricingComponent, BlogComponent, ContactComponent, AcceptanceComponent,
    AboutComponent, ServicesComponent, HeaderComponent, FooterComponent, SwitcherComponent, ScrollspyDirective, PopupComponent,
    LoaderComponent, EditDocumentComponent,CreateDocumentComponent],
  imports: [
    CommonModule,
    NgbModule,
    PipesModule,
    CKEditorModule,
    MaterialModule,
    FormsModule
  ],
  // tslint:disable-next-line: max-line-length
  exports: [FeaturesComponent, PricingComponent, BlogComponent, ContactComponent, AcceptanceComponent,
    AboutComponent, ServicesComponent, HeaderComponent, FooterComponent, SwitcherComponent, ScrollspyDirective, PopupComponent,
    LoaderComponent]
})
export class SharedModule { }
