import { Component, Input, OnInit } from '@angular/core';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  loading: boolean;
  constructor(public commonfunctionService: CommonfunctionService) {
    this.commonfunctionService.isLoading.subscribe((v) => {
      this.loading = v;
    });
  }
  ngOnInit(): void {
  }

}
