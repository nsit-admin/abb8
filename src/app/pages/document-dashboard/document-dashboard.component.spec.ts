import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDashboardComponent } from './document-dashboard.component';

describe('DocumentDashboardComponent', () => {
  let component: DocumentDashboardComponent;
  let fixture: ComponentFixture<DocumentDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
