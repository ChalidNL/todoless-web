import { RepeatInterval } from '../types';

const ORDINALS = ['first', 'second', 'third', 'fourth'] as const;
const ORDINALS_NL = ['eerste', 'tweede', 'derde', 'vierde'] as const;

function getUiLanguage(): 'nl' | 'en' {
  if (typeof document !== 'undefined') {
    const lang = document.documentElement.lang?.toLowerCase();
    if (lang?.startsWith('nl')) return 'nl';
  }

  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('nl')) {
    return 'nl';
  }

  return 'en';
}

function getLocale(language: 'nl' | 'en'): string {
  return language === 'nl' ? 'nl-NL' : 'en-US';
}

function getWeekdayLabel(dueDate: number, language: 'nl' | 'en'): string {
  return new Intl.DateTimeFormat(getLocale(language), { weekday: 'long' }).format(new Date(dueDate));
}

function getBaseRepeatLabel(repeatInterval: Exclude<RepeatInterval, 'month_weekday'>, language: 'nl' | 'en'): string {
  const labels = language === 'nl'
    ? {
        day: 'Elke dag',
        week: 'Elke week',
        month: 'Elke maand',
        year: 'Elk jaar',
      }
    : {
        day: 'Every day',
        week: 'Every week',
        month: 'Every month',
        year: 'Every year',
      };

  return labels[repeatInterval];
}

function getMonthlyWeekdayLabel(dueDate: number | undefined, language: 'nl' | 'en'): string {
  if (!dueDate) {
    return language === 'nl' ? 'Elke eerste maandag' : 'Every first Monday';
  }

  const date = new Date(dueDate);
  const dayOfMonth = date.getDate();
  const weekday = getWeekdayLabel(dueDate, language);
  const occurrenceIndex = Math.floor((dayOfMonth - 1) / 7);
  const nextSameWeekday = new Date(date);
  nextSameWeekday.setDate(dayOfMonth + 7);
  const isLastOccurrence = nextSameWeekday.getMonth() !== date.getMonth();

  if (isLastOccurrence) {
    return language === 'nl' ? `Elke laatste ${weekday}` : `Every last ${weekday}`;
  }

  const ordinal = language === 'nl'
    ? ORDINALS_NL[Math.min(occurrenceIndex, ORDINALS_NL.length - 1)]
    : ORDINALS[Math.min(occurrenceIndex, ORDINALS.length - 1)];
  return language === 'nl' ? `Elke ${ordinal} ${weekday}` : `Every ${ordinal} ${weekday}`;
}

export function getRepeatLabel(repeatInterval?: RepeatInterval | null, dueDate?: number): string | null {
  if (!repeatInterval) return null;

  const language = getUiLanguage();

  switch (repeatInterval) {
    case 'day':
      return getBaseRepeatLabel('day', language);
    case 'week':
      return getBaseRepeatLabel('week', language);
    case 'month':
      return getBaseRepeatLabel('month', language);
    case 'year':
      return getBaseRepeatLabel('year', language);
    case 'month_weekday':
      return getMonthlyWeekdayLabel(dueDate, language);
    default:
      return null;
  }
}

export function getRepeatOptions(dueDate?: number): Array<{ value: '' | RepeatInterval; label: string; disabled?: boolean }> {
  const language = getUiLanguage();
  const repeatLabel = language === 'nl' ? 'Herhalen' : 'Repeat';

  return [
    { value: '', label: repeatLabel },
    { value: 'day', label: getBaseRepeatLabel('day', language) },
    { value: 'week', label: getBaseRepeatLabel('week', language) },
    { value: 'month', label: getBaseRepeatLabel('month', language) },
    { value: 'month_weekday', label: getMonthlyWeekdayLabel(dueDate, language), disabled: !dueDate },
    { value: 'year', label: getBaseRepeatLabel('year', language) },
  ];
}