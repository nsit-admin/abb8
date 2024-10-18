import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';

@NgModule({
  exports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    MatExpansionModule
  ]
})
export class MaterialModule { }
