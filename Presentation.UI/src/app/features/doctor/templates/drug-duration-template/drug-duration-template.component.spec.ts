import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugDurationTemplateComponent } from './drug-duration-template.component';

describe('DrugDurationTemplateComponent', () => {
  let component: DrugDurationTemplateComponent;
  let fixture: ComponentFixture<DrugDurationTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrugDurationTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrugDurationTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
