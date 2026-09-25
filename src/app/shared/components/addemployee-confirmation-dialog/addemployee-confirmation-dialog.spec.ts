import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AddemployeeConfirmationDialog } from './addemployee-confirmation-dialog';

describe('AddemployeeConfirmationDialog', () => {
  let component: AddemployeeConfirmationDialog;
  let fixture: ComponentFixture<AddemployeeConfirmationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddemployeeConfirmationDialog],
      providers: [
        provideHttpClient(),
        {
          provide: ToastrService,
          useValue: {
            warning: () => {},
            error: () => {},
            success: () => {},
            info: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddemployeeConfirmationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
