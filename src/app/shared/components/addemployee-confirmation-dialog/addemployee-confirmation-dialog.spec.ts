import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddemployeeConfirmationDialog } from './addemployee-confirmation-dialog';

describe('AddemployeeConfirmationDialog', () => {
  let component: AddemployeeConfirmationDialog;
  let fixture: ComponentFixture<AddemployeeConfirmationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddemployeeConfirmationDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AddemployeeConfirmationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
