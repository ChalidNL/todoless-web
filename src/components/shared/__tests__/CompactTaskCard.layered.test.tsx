import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../../context/AppContext', () => ({
  useApp: vi.fn(),
}));

const { CompactTaskCard } = await import('../CompactTaskCard');
const { useApp } = await import('../../../context/AppContext');

const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();

const baseTask = {
  id: 'task-1',
  title: 'Pay bills',
  status: 'todo',
  blocked: false,
  labels: [],
  flag: false,
  createdAt: Date.now(),
};

describe('CompactTaskCard layered attributes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useApp as any).mockReturnValue({
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
      labels: [{ id: 'l1', name: 'home', color: '#3b82f6' }],
      users: [{ id: 'u1', name: 'Chalid', role: 'admin' }],
    });
  });

  it('hides task attributes until hamburger is tapped', () => {
    render(<CompactTaskCard task={baseTask as any} />);

    expect(screen.queryByLabelText('Edit labels')).toBeNull();
    expect(screen.queryByLabelText('Edit assignee')).toBeNull();
    expect(screen.queryByLabelText('Edit due date and recurring')).toBeNull();
    expect(screen.queryByLabelText('Toggle flag')).toBeNull();

    fireEvent.click(screen.getByLabelText('Open task menu'));

    expect(screen.getByLabelText('Edit labels')).toBeTruthy();
    expect(screen.getByLabelText('Edit assignee')).toBeTruthy();
    expect(screen.getByLabelText('Edit due date and recurring')).toBeTruthy();
    expect(screen.getByLabelText('Toggle flag')).toBeTruthy();
  });

  it('opens assignee selector from @ icon and only one detail row is active', () => {
    render(<CompactTaskCard task={baseTask as any} />);
    fireEvent.click(screen.getByLabelText('Open task menu'));

    fireEvent.click(screen.getByLabelText('Edit assignee'));
    expect(screen.getByText('Chalid')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Edit labels'));
    // assignee row closed when switching active editor
    expect(screen.queryByText('Chalid')).toBeNull();
    // label row visible
    expect(screen.getByText('home')).toBeTruthy();
  });

  it('flag toggles blocked visual state and does not open detail row', () => {
    const { container } = render(<CompactTaskCard task={baseTask as any} />);
    fireEvent.click(screen.getByLabelText('Open task menu'));
    fireEvent.click(screen.getByLabelText('Toggle flag'));

    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { flag: true, blocked: true });
    expect(screen.queryByText('Flagged')).toBeNull();

    const root = container.firstChild as HTMLElement;
    expect(root.className.includes('bg-white')).toBeTruthy();
  });

  it('renders light red tinted card when task is flagged/blocked', () => {
    const { container } = render(
      <CompactTaskCard task={{ ...baseTask, flag: true, blocked: true } as any} />
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className.includes('bg-red-50')).toBeTruthy();
    expect(root.className.includes('border-red-200')).toBeTruthy();
  });
});
