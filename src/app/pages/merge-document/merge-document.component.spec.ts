import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeDocumentComponent } from './merge-document.component';

describe('MergeDocumentComponent', () => {
  let component: MergeDocumentComponent;
  let fixture: ComponentFixture<MergeDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergeDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
