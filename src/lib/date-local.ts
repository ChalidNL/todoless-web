function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatLocalDateInputValue(timestamp?: number | null): string {
  if (timestamp == null) return '';
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatLocalTimeInputValue(timestamp?: number | null): string {
  if (timestamp == null) return '';
  const date = new Date(timestamp);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseLocalDateInputValue(value: string): number | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).getTime();
}

export function combineLocalDateAndTime(dateValue: string, timeValue: string): number | null {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split('-').map(Number);
  if (!year || !month || !day) return null;
  const [hours, minutes] = (timeValue || '00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0).getTime();
}
