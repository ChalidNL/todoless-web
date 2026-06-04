import { describe, expect, it } from 'vitest';
import {
  combineLocalDateAndTime,
  formatLocalDateInputValue,
  formatLocalTimeInputValue,
  parseLocalDateInputValue,
} from '../lib/date-local';

describe('date-local helpers', () => {
  it('parses a date input as local calendar date', () => {
    expect(parseLocalDateInputValue('2026-06-05')).toBe(new Date(2026, 5, 5).getTime());
  });

  it('formats local date input without UTC day shift', () => {
    const value = new Date(2026, 5, 5, 14, 30).getTime();
    expect(formatLocalDateInputValue(value)).toBe('2026-06-05');
    expect(formatLocalTimeInputValue(value)).toBe('14:30');
  });

  it('combines date and time in local time', () => {
    expect(combineLocalDateAndTime('2026-06-05', '09:45')).toBe(new Date(2026, 5, 5, 9, 45, 0, 0).getTime());
  });
});
