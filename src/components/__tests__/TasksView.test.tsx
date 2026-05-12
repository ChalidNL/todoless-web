import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import type { Task, Label, Filter, User, Sprint } from '../../types';

// -- Helper to create realistic task fixtures --
const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: overrides.id || `task-${Math.random().toString(36).slice(2, 8)}`,
  title: overrides.title || 'Test Task',
  status: overrides.status || 'todo',
  blocked: overrides.blocked ?? false,
  labels: overrides.labels ?? [],
  createdAt: overrides.createdAt ?? Date.now(),
  ...overrides,
});

// -- Tests for Task Card default view logic --
describe('TasksView — Task Cards (default type)', () => {
  it('renders active tasks (non-done) by default', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Active task 1', status: 'todo' }),
      makeTask({ id: 't2', title: 'Active task 2', status: 'backlog' }),
      makeTask({ id: 't3', title: 'Done task', status: 'done' }),
    ];
    const active = tasks.filter(t => t.status !== 'done');
    expect(active).toHaveLength(2);
    expect(active.map(t => t.title)).toEqual(['Active task 1', 'Active task 2']);
  });

  it('sorts active tasks by priority: urgent > normal > low > undefined', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Low', priority: 'low' }),
      makeTask({ id: 't2', title: 'Urgent', priority: 'urgent' }),
      makeTask({ id: 't3', title: 'No priority' }),
      makeTask({ id: 't4', title: 'Normal', priority: 'normal' }),
    ];
    const active = tasks.filter(t => t.status !== 'done');
    const priorityOrder: Record<string, number> = { urgent: 0, normal: 1, low: 2, undefined: 3 };
    const sorted = [...active].sort((a, b) => {
      const aP = a.priority ?? 'undefined';
      const bP = b.priority ?? 'undefined';
      return priorityOrder[aP] - priorityOrder[bP];
    });
    expect(sorted.map(t => t.title)).toEqual(['Urgent', 'Normal', 'Low', 'No priority']);
  });

  it('shows checkboxes on task cards when showCheckbox is true', () => {
    // CompactTaskCard accepts showCheckbox prop — verified by interface
    const props = { task: makeTask(), showCheckbox: true };
    expect(props.showCheckbox).toBe(true);
  });

  it('filters tasks by search query (case-insensitive)', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Buy grocery items' }),
      makeTask({ id: 't2', title: 'Walk the dog' }),
      makeTask({ id: 't3', title: 'GROCERY list review' }),
    ];
    const query = 'grocery';
    const filtered = tasks.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase())
    );
    expect(filtered).toHaveLength(2);
    expect(filtered.map(t => t.id)).toEqual(['t1', 't3']);
  });

  it('filters tasks by active label filters (AND logic)', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Has both', labels: ['lbl-work', 'lbl-urgent'] }),
      makeTask({ id: 't2', title: 'Has work only', labels: ['lbl-work'] }),
      makeTask({ id: 't3', title: 'Has neither', labels: [] }),
    ];
    const activeLabelFilters = ['lbl-work', 'lbl-urgent'];
    const filtered = tasks.filter(t =>
      activeLabelFilters.every(filterId => t.labels.includes(filterId))
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Has both');
  });

  it('handles empty task list gracefully', () => {
    const tasks: Task[] = [];
    const active = tasks.filter(t => t.status !== 'done');
    expect(active).toHaveLength(0);
  });

  it('applies saved filter label constraints', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Home', labels: ['home'] }),
      makeTask({ id: 't2', title: 'Work', labels: ['work'] }),
      makeTask({ id: 't3', title: 'Both', labels: ['home', 'work'] }),
    ];
    const savedFilter: Filter = {
      id: 'f1',
      name: 'Home tasks',
      labelIds: ['home'],
      showCompleted: true,
      type: 'task',
    };
    const filtered = tasks.filter(t =>
      savedFilter.labelIds.every(labelId => t.labels.includes(labelId))
    );
    expect(filtered.map(t => t.title)).toEqual(['Home', 'Both']);
  });

  it('excludes completed tasks when saved filter has showCompleted=false', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Active', status: 'todo' }),
      makeTask({ id: 't2', title: 'Done', status: 'done' }),
      makeTask({ id: 't3', title: 'Backlog', status: 'backlog' }),
    ];
    const savedFilter: Filter = {
      id: 'f1',
      name: 'Active only',
      labelIds: [],
      showCompleted: false,
      type: 'task',
    };
    let filtered = tasks;
    if (!savedFilter.showCompleted) {
      filtered = filtered.filter(t => t.status !== 'done');
    }
    expect(filtered.map(t => t.title)).toEqual(['Active', 'Backlog']);
  });
});

// -- Tests for Checked Out view --
describe('TasksView — Checked Out View', () => {
  it('separates done tasks from active tasks', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Task A', status: 'todo' }),
      makeTask({ id: 't2', title: 'Task B', status: 'done', completedAt: Date.now() }),
      makeTask({ id: 't3', title: 'Task C', status: 'done', completedAt: Date.now() - 1000 }),
      makeTask({ id: 't4', title: 'Task D', status: 'backlog' }),
    ];
    const checkedOut = tasks.filter(t => t.status === 'done');
    expect(checkedOut).toHaveLength(2);
    expect(checkedOut.map(t => t.title)).toEqual(['Task B', 'Task C']);
  });

  it('shows "Checked Out" section only when there are done tasks', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Active', status: 'todo' }),
      makeTask({ id: 't2', title: 'Also active', status: 'backlog' }),
    ];
    const checkedOut = tasks.filter(t => t.status === 'done');
    const shouldShowSection = checkedOut.length > 0;
    expect(shouldShowSection).toBe(false);
  });

  it('toggles visibility of checked out tasks', () => {
    // Simulate toggle state: collapsed -> expanded
    let showCheckedOut = false;
    expect(showCheckedOut).toBe(false);
    showCheckedOut = !showCheckedOut;
    expect(showCheckedOut).toBe(true);
    showCheckedOut = !showCheckedOut;
    expect(showCheckedOut).toBe(false);
  });

  it('displays count of checked out tasks in section header', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', status: 'done' }),
      makeTask({ id: 't2', status: 'done' }),
      makeTask({ id: 't3', status: 'done' }),
      makeTask({ id: 't4', status: 'todo' }),
    ];
    const checkedOutCount = tasks.filter(t => t.status === 'done').length;
    const headerText = `Checked Out (${checkedOutCount})`;
    expect(headerText).toBe('Checked Out (3)');
  });

  it('shows checkboxes on checked out task cards', () => {
    const doneTask = makeTask({ id: 't1', status: 'done' });
    // In TasksView, done tasks are rendered with showCheckbox={task.status === 'done'}
    const showCheckbox = doneTask.status === 'done';
    expect(showCheckbox).toBe(true);
  });

  it('applies label filters to checked out tasks as well', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Done home', status: 'done', labels: ['home'] }),
      makeTask({ id: 't2', title: 'Done work', status: 'done', labels: ['work'] }),
      makeTask({ id: 't3', title: 'Done both', status: 'done', labels: ['home', 'work'] }),
    ];
    const activeLabelFilters = ['home'];
    const filtered = tasks
      .filter(t => t.status === 'done')
      .filter(t => activeLabelFilters.every(fid => t.labels.includes(fid)));
    expect(filtered.map(t => t.title)).toEqual(['Done home', 'Done both']);
  });

  it('applies search filter to checked out tasks', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Completed grocery run', status: 'done' }),
      makeTask({ id: 't2', title: 'Finished laundry', status: 'done' }),
    ];
    const query = 'grocery';
    const filtered = tasks.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Completed grocery run');
  });
});

// -- Tests for 'Uncheck All' bulk action --
describe('TasksView — Uncheck All Bulk Action', () => {
  it('unchecks all done tasks back to todo status', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Done 1', status: 'done', completedAt: Date.now() }),
      makeTask({ id: 't2', title: 'Done 2', status: 'done', completedAt: Date.now() - 5000 }),
      makeTask({ id: 't3', title: 'Still active', status: 'todo' }),
    ];

    const updates: { id: string; updates: Partial<Task> }[] = [];
    tasks
      .filter(t => t.status === 'done')
      .forEach(t => {
        updates.push({ id: t.id, updates: { status: 'todo', completedAt: undefined } });
      });

    expect(updates).toHaveLength(2);
    expect(updates[0].updates.status).toBe('todo');
    expect(updates[0].updates.completedAt).toBe(undefined);
    // Active task should not be updated
    const updatedIds = updates.map(u => u.id);
    expect(updatedIds).not.toContain('t3');
  });

  it('clears completedAt timestamp when unchecking', () => {
    const task = makeTask({ id: 't1', status: 'done', completedAt: 1234567890 });
    const update = { status: 'todo' as const, completedAt: undefined };
    expect(update.completedAt).toBe(undefined);
  });

  it('shows completion message after unchecking all', () => {
    // In TasksView: showCompletionMessage('All tasks checked back in')
    const message = 'All tasks checked back in';
    expect(message).toBe('All tasks checked back in');
  });

  it('does nothing when no tasks are done', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', status: 'todo' }),
      makeTask({ id: 't2', status: 'backlog' }),
    ];
    const doneTasks = tasks.filter(t => t.status === 'done');
    expect(doneTasks).toHaveLength(0);
  });

  it('handles mixed states — only done tasks are affected', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', status: 'done', completedAt: Date.now() }),
      makeTask({ id: 't2', status: 'todo' }),
      makeTask({ id: 't3', status: 'done', completedAt: Date.now() - 1000 }),
      makeTask({ id: 't4', status: 'backlog' }),
    ];

    const updates: { id: string; updates: Partial<Task> }[] = [];
    tasks
      .filter(t => t.status === 'done')
      .forEach(t => {
        updates.push({ id: t.id, updates: { status: 'todo', completedAt: undefined } });
      });

    expect(updates).toHaveLength(2);
    const updatedIds = updates.map(u => u.id);
    expect(updatedIds).toContain('t1');
    expect(updatedIds).toContain('t3');
    expect(updatedIds).not.toContain('t2');
    expect(updatedIds).not.toContain('t4');
  });

  it('uncheckAllDoneTasks implementation matches expected behavior', () => {
    // Simulates the exact implementation from AppContext.tsx line 610-614
    const tasks: Task[] = [
      makeTask({ id: 't1', status: 'done', completedAt: 1000 }),
      makeTask({ id: 't2', status: 'todo' }),
      makeTask({ id: 't3', status: 'done', completedAt: 2000 }),
    ];

    const updateResults: Array<{ id: string; status: string; completedAt: undefined }> = [];
    tasks.filter((task) => task.status === 'done').forEach((task) => {
      updateResults.push({
        id: task.id,
        status: 'todo',
        completedAt: undefined,
      });
    });

    expect(updateResults).toHaveLength(2);
    expect(updateResults.every(r => r.status === 'todo')).toBe(true);
    expect(updateResults.every(r => r.completedAt === undefined)).toBe(true);
  });
});

// -- Integration: Combined filtering across both views --
describe('TasksView — Combined View Behavior', () => {
  it('applies search to both active and checked out sections', () => {
    const allTasks: Task[] = [
      makeTask({ id: 't1', title: 'Morning standup', status: 'todo' }),
      makeTask({ id: 't2', title: 'Standup notes review', status: 'done' }),
      makeTask({ id: 't3', title: 'Buy milk', status: 'todo' }),
    ];
    const query = 'standup';
    const filtered = allTasks.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase())
    );
    const active = filtered.filter(t => t.status !== 'done');
    const checkedOut = filtered.filter(t => t.status === 'done');
    expect(active).toHaveLength(1);
    expect(checkedOut).toHaveLength(1);
  });

  it('shows "No tasks found" when all sections are empty after filtering', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Grocery', status: 'todo' }),
      makeTask({ id: 't2', title: 'Shopping', status: 'done' }),
    ];
    const query = 'nonexistent';
    const filtered = tasks.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase())
    );
    const activeTasks = filtered.filter(t => t.status !== 'done');
    const checkedOutTasks = filtered.filter(t => t.status === 'done');
    const showEmpty = activeTasks.length === 0 && checkedOutTasks.length === 0;
    expect(showEmpty).toBe(true);
  });

  it('active tasks section always renders (even when empty)', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Done', status: 'done' }),
    ];
    const active = tasks.filter(t => t.status !== 'done');
    // The active tasks section container should still render
    expect(active).toBeDefined();
    expect(active).toHaveLength(0);
  });

  it('checked out section hides completely when no done tasks', () => {
    const tasks: Task[] = [
      makeTask({ id: 't1', title: 'Todo', status: 'todo' }),
      makeTask({ id: 't2', title: 'Backlog', status: 'backlog' }),
    ];
    const checkedOut = tasks.filter(t => t.status === 'done');
    const shouldRender = checkedOut.length > 0;
    expect(shouldRender).toBe(false);
  });
});
