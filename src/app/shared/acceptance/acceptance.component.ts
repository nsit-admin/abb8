import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-acceptance',
  templateUrl: './acceptance.component.html',
  styleUrls: ['./acceptance.component.css']
})
export class AcceptanceComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<AcceptanceComponent>) { }

  ngOnInit(): void {
  }
  dialogClose() {
    this.dialogRef.close();
  }

}
