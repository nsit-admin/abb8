import { Component, OnInit } from '@angular/core';
import { CommonfunctionService } from '@app/common/services/commonfunction.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  constructor(public commonfunctionService: CommonfunctionService) { }

  ngOnInit(): void {
  }

}
