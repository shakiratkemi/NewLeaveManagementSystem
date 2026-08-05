import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeContainer } from './employee-container';

describe('EmployeeContainer', () => {
  let component: EmployeeContainer;
  let fixture: ComponentFixture<EmployeeContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
