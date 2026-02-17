import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugDoseTemplateComponent } from './drug-dose-template.component';

describe('DrugDoseTemplateComponent', () => {
  let component: DrugDoseTemplateComponent;
  let fixture: ComponentFixture<DrugDoseTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrugDoseTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrugDoseTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
