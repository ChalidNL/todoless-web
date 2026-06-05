import type { NotificationInboxItem } from '../types';

export function getUnreadInboxCount(items: NotificationInboxItem[]): number {
  return items.filter((item) => !item.read && !item.archived).length;
}

export function getVisibleInboxNotifications(items: NotificationInboxItem[], limit?: number): NotificationInboxItem[] {
  const visible = items
    .filter((item) => !item.archived)
    .sort((left, right) => right.createdAt - left.createdAt);

  return typeof limit === 'number' ? visible.slice(0, limit) : visible;
}
