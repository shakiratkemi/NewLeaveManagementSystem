import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveHistoryDetails } from './leave-history-details';

describe('LeaveHistoryDetails', () => {
  let component: LeaveHistoryDetails;
  let fixture: ComponentFixture<LeaveHistoryDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveHistoryDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaveHistoryDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
