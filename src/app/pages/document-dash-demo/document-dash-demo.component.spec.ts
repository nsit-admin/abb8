import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDashDemoComponent } from './document-dash-demo.component';

describe('DocumentDashDemoComponent', () => {
  let component: DocumentDashDemoComponent;
  let fixture: ComponentFixture<DocumentDashDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentDashDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentDashDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
