import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {

  }
  onActivate(event) {
    window.scroll(0, 0);
  }
}
