/**
 * Reminder scheduling utilities.
 *
 * Generates reminders from tasks/items with due dates.
 * Handles recurring expansions and priority/flagging rules.
 */
import type { Task, Item, Reminder, User } from '../types';

/**
 * Generate reminders from tasks that have due dates.
 * One reminder per task with a due date in the future (or within the past 7 days).
 */
export function generateRemindersFromTasks(
  tasks: Task[],
  existingReminders: Reminder[],
  users: User[],
): Omit<Reminder, 'id' | 'createdAt'>[] {
  const existingTaskIds = new Set(
    existingReminders
      .filter((r) => r.source === 'task' && r.linkedTo)
      .map((r) => r.linkedTo!),
  );

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  return tasks
    .filter((t) => t.dueDate && !t.archived && !existingTaskIds.has(t.id))
    .filter((t) => t.dueDate! >= weekAgo)
    .map((task) => ({
      title: task.title,
      dueDate: task.dueDate!,
      recurring: task.repeatInterval,
      assignee: task.assignedTo,
      labels: task.labels || [],
      flagged: task.priority === 'urgent',
      isPrivate: task.isPrivate || false,
      linkedType: 'task' as const,
      linkedTo: task.id,
      source: 'task' as const,
      dismissed: false,
      createdBy: task.createdBy,
    }));
}

/**
 * Generate reminders from items with due dates.
 */
export function generateRemindersFromItems(
  items: Item[],
  existingReminders: Reminder[],
): Omit<Reminder, 'id' | 'createdAt'>[] {
  const existingItemIds = new Set(
    existingReminders
      .filter((r) => r.source === 'item' && r.linkedTo)
      .map((r) => r.linkedTo!),
  );

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  return items
    .filter((i) => i.dueDate && !i.completed && !existingItemIds.has(i.id))
    .filter((i) => i.dueDate! >= weekAgo)
    .map((item) => ({
      title: item.title,
      dueDate: item.dueDate!,
      assignee: item.assignedTo,
      labels: item.labels || [],
      flagged: item.priority === 'urgent',
      isPrivate: item.isPrivate || false,
      linkedType: 'item' as const,
      linkedTo: item.id,
      source: 'item' as const,
      dismissed: false,
      createdBy: item.createdBy,
    }));
}

/**
 * Expand a recurring reminder into its next N occurrences.
 * Returns an array of { title, dueDate } for display purposes.
 */
export function expandRecurringReminder(
  reminder: Reminder,
  count: number = 5,
): { title: string; dueDate: number }[] {
  if (!reminder.recurring) return [{ title: reminder.title, dueDate: reminder.dueDate }];

  const occurrences: { title: string; dueDate: number }[] = [];
  let current = reminder.dueDate;

  for (let i = 0; i < count; i++) {
    occurrences.push({ title: reminder.title, dueDate: current });
    const d = new Date(current);
    switch (reminder.recurring) {
      case 'week':
        d.setDate(d.getDate() + 7);
        break;
      case 'month':
        d.setMonth(d.getMonth() + 1);
        break;
      case 'year':
        d.setFullYear(d.getFullYear() + 1);
        break;
    }
    current = d.getTime();
  }

  return occurrences;
}

/**
 * Get reminders for a specific date range.
 */
export function getRemindersInRange(
  reminders: Reminder[],
  startMs: number,
  endMs: number,
): Reminder[] {
  return reminders
    .filter((r) => !r.dismissed && r.dueDate >= startMs && r.dueDate <= endMs)
    .sort((a, b) => a.dueDate - b.dueDate);
}

/**
 * Get upcoming reminders (next 7 days).
 */
export function getUpcomingReminders(reminders: Reminder[], days: number = 7): Reminder[] {
  const now = Date.now();
  const end = now + days * 24 * 60 * 60 * 1000;
  return getRemindersInRange(reminders, now, end);
}
