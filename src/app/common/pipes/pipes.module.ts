import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { MessageTimePipe } from './message-time.pipe';

@NgModule({
  declarations: [SanitizeHtmlPipe, MessageTimePipe],
  imports: [
    CommonModule
  ],
  exports: [SanitizeHtmlPipe, MessageTimePipe]
})
export class PipesModule { }
