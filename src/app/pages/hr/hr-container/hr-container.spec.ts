import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrContainer } from './hr-container';

describe('HrContainer', () => {
  let component: HrContainer;
  let fixture: ComponentFixture<HrContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(HrContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
