// pb_hooks/on_task_update.js
// Handles recurring task rollover: when a recurring task is marked done,
// automatically create the next occurrence.

onRecordAfterUpdateRequest((e) => {
  const record = e.record;
  const oldRecord = e.oldRecord;

  // Only handle transition to 'done'
  if (oldRecord.get('status') === 'done' || record.get('status') !== 'done') {
    return;
  }

  // Check if task has a repeat_interval
  const repeatInterval = record.get('repeat_interval');
  if (!repeatInterval) {
    return;
  }

  // Calculate next due date
  const currentDueDate = record.get('due_date');
  if (!currentDueDate) {
    return;
  }

  const dueDate = new Date(currentDueDate);
  let nextDueDate = new Date(dueDate);

  if (repeatInterval === 'week') {
    nextDueDate.setDate(nextDueDate.getDate() + 7);
  } else if (repeatInterval === 'month') {
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  } else if (repeatInterval === 'year') {
    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
  }

  // Create the next recurring task
  const collection = $app.dao().findCollectionByNameOrId('tasks');
  const newRecord = new Record(collection);
  const userId = record.get('user');

  const data = new RecordUpsertAction($app, newRecord)
    .set('user', userId)
    .set('title', record.get('title'))
    .set('status', 'todo')
    .set('blocked', false)
    .set('priority', record.get('priority') || '')
    .set('horizon', record.get('horizon') || '')
    .set('due_date', nextDueDate.toISOString())
    .set('repeat_interval', repeatInterval)
    .set('labels', record.get('labels') || [])
    .set('is_private', record.get('is_private') || false)
    .set('archived', false);

  // Copy assignee if exists
  const assignedTo = record.get('assigned_to');
  if (assignedTo) {
    data.set('assigned_to', assignedTo);
  }

  // Copy blocked_comment if exists
  const blockedComment = record.get('blocked_comment');
  if (blockedComment) {
    data.set('blocked_comment', blockedComment);
  }

  data.submit();
}, 'tasks');
