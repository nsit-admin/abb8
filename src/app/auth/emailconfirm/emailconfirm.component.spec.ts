import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailconfirmComponent } from './emailconfirm.component';

describe('EmailconfirmComponent', () => {
  let component: EmailconfirmComponent;
  let fixture: ComponentFixture<EmailconfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailconfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailconfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
