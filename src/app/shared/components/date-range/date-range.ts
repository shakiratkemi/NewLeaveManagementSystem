import {
  Component,
  ElementRef,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  isHoliday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isDisabled: boolean;
  isPast: boolean;
  
}
interface DateRangeValue {
  startDate: Date | null;
  endDate: Date | null;
  dayCount: number;
  
}

@Component({
  selector: 'app-date-range',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-range.html',
})
export class DateRange {
  // Static holiday list — format: 'YYYY-MM-DD'
  @Output() rangeSelected = new EventEmitter<DateRangeValue>(); 
  publicHolidays: string[] = [
    '2026-01-01', // New Year's Day
    '2026-05-01', // Workers' Day
    '2026-06-12', // Democracy Day
    '2026-10-01', // Independence Day
    '2026-12-25', // Christmas Day
  ];

  currentMonth: Date = new Date(2026, 0, 1);
  startDate: Date | null = null;
  endDate: Date | null = null;
  isOpen = false;

  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  days: CalendarDay[] = [];

  constructor(private elementRef: ElementRef) {
    this.generateCalendar();
  }


  isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
}
  // --- Helpers ---------------------------------------------------------

  private toKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  isHoliday(date: Date): boolean {
    return this.publicHolidays.includes(this.toKey(date));
  }

  private isSameDate(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    return a.toDateString() === b.toDateString();
  }

  private isInSelectedRange(date: Date): boolean {
    if (!this.startDate || !this.endDate) return false;
    return date >= this.startDate && date <= this.endDate;
  }

  formatShort(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // --- Calendar generation ---------------------------------------------

 generateCalendar(): void {
  const year = this.currentMonth.getFullYear();
  const month = this.currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  this.days = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);

    const holiday = this.isHoliday(date);
    const past = this.isPastDate(date);

    this.days.push({
      date,
      inCurrentMonth: date.getMonth() === month,
      isHoliday: holiday,
      isPast: past,
      isSelected:
        this.isSameDate(date, this.startDate) ||
        this.isSameDate(date, this.endDate),
      isInRange: this.isInSelectedRange(date),
      isDisabled: holiday || past,
    });
  }
}

  // --- Selection ---------------------------------------------------------

selectDate(day: CalendarDay): void {
  if (day.isDisabled) return;

  const clicked = day.date;

  if (!this.startDate || (this.startDate && this.endDate)) {
    this.startDate = clicked;
    this.endDate = null;
  } else if (clicked < this.startDate) {
    this.endDate = this.startDate;
    this.startDate = clicked;
  } else {
    this.endDate = clicked;
    this.isOpen = false; // auto-close once a full range is picked
  }

  this.generateCalendar();
  this.emitChange();
}
 
emitChange(): void {
    this.rangeSelected.emit({
      startDate: this.startDate,
      endDate: this.endDate,
      dayCount: Number(this.selectedDayCount),
    });
  }


  clearSelection(event: Event): void {
    event.stopPropagation();
    this.startDate = null;
    this.endDate = null;
    this.generateCalendar();
  }

  // --- Navigation ---------------------------------------------------------

  prevMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  get monthLabel(): string {
    return this.currentMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  // --- Dropdown open/close ---------------------------------------------

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  // --- Input label ---------------------------------------------------------

  get inputLabel(): string {
    if (!this.startDate) return '';
    if (!this.endDate) return this.formatShort(this.startDate);
    return `${this.formatShort(this.startDate)} - ${this.formatShort(this.endDate)}`;
  }

  // --- Selected day count (excludes public holidays inside the range) ---

  get selectedDayCount(): number {
    if (!this.startDate) return 0;
    if (!this.endDate) return 1;

    let count = 0;
    const cursor = new Date(this.startDate);
    while (cursor <= this.endDate) {
      if (!this.isHoliday(cursor)) {
        count++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return count;
  }

  get rangeSummary(): string {
    if (!this.startDate) return 'No date selected';
    if (!this.endDate) return 'Pick an end date';
    return `${this.formatShort(this.startDate)} → ${this.formatShort(this.endDate)}`;
  }
}